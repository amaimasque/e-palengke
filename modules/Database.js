import {Alert, Platform} from 'react-native';
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import {GoogleSignin} from 'react-native-google-signin';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
/**
 * FACEBOOK LOGIN
 * Check in database if user exists,
 * if yes, login
 * if no, register then login
 * @param {function} callback
 */
async function facebookLogin(callback) {
  try {
    let data, result;
    if (AccessToken.getCurrentAccessToken() != null) {
      LoginManager.logOut();
    } 
    if (Platform.OS === 'android') {
      try {
        LoginManager.setLoginBehavior('NATIVE_ONLY');
        result = await LoginManager.logInWithPermissions([
          'public_profile',
          'email',
        ]);
      } catch (error) {
        LoginManager.setLoginBehavior('WEB_ONLY');
        result = await LoginManager.logInWithPermissions([
          'public_profile',
          'email',
        ]);
      }
    }
    if (result.isCancelled) {
      throw new Error('User cancelled request');
    }
    data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw new Error('Something went wrong obtaining the users access token');
    }
    const credential = auth.FacebookAuthProvider.credential(data.accessToken);
    const firebaseUserCredential = await auth().signInWithCredential(
      credential,
    );
    let user = firebaseUserCredential.user;
    // console.warn('User', user);
    // let isExists = await checkUserExist(user.email);
    // callback(isExists, user.email);
    if (user.email === '' || user.email === null) {
      Alert.alert('Error', 'Account is not binded to an email! Please check your Facebook account.')
    } else {
      checkUserExist((data) => {
        if (data) {
          callback(data);
        } else {
          let userData = {
            account_type: '',
            first_name: user.displayName?.split(' ')[0],
            last_name: user.displayName?.split(' ')[1],
            password: '',
            email_address: user.email,
            birthdate: '',
            profile_pic: user.photoURL,
            is_account_verified: true,
            gcash_number: '',
            paymaya_numbr: '',
            date_created: new Date().toString(),
            shop_name: '',
          };
          register(userData, (id) => {
            callback({...userData, id});
          });
        }
      }, user.email);
    }
  } catch (error) {
    console.warn('Error', error.message);
    Alert.alert(
      'Login failed',
      'There was an error logging in your account. Please try again later.',
    );
  }
}
async function facebookLogout() {
  try {
    if (AccessToken.getCurrentAccessToken() != null) {
      LoginManager.logOut();
    }
  } catch (e) {
    console.warn(e.message);
  }
};
async function googleLogout() {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (e) {
    console.warn(e.message);
  }
};
/**
 * GOOGLE LOGIN
 * Check in database if user exists,
 * if yes, login
 * if no, register then login
 * @param {function} callback
 */
async function googleLogin(callback) {
  try {
    googleLogout();
    GoogleSignin.configure({
      webClientId:
        '803819056425-06bsk55ucjonbidssm1q0kmbg2ds9u1r.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    });
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const data = await GoogleSignin.signIn();
    const credential = auth.GoogleAuthProvider.credential(
      data.idToken,
      data.accessToken,
    );
    const firebaseUserCredential = await auth().signInWithCredential(
      credential,
    );
    let user = firebaseUserCredential.user;
    console.warn('User', user);
    // let isExists = await checkUserExist(user.email);
    // callback(isExists, user.email)
    checkUserExist((data) => {
      if (data) {
        callback(data);
      } else {
        let userData = {
          account_type: '',
          first_name: user.displayName?.split(' ')[0],
          last_name: user.displayName?.split(' ')[1],
          password: '',
          email_address: user.email,
          birthdate: '',
          profile_pic: user.photoURL,
          is_account_verified: true,
          gcash_number: '',
          paymaya_numbr: '',
          date_created: new Date().toString(),
          shop_name: '',
        };
        register(userData, (id) => {
          callback({...userData, id});
        });
      }
    }, user.email);
  } catch (error) {
    console.warn('Error', error.message);
    Alert.alert(
      'Login failed',
      'There was an error logging in your account. Please try again later.',
    );
  }
}
/**
 * Login social user to auth
 * Credential object loooks like {password, email}
 * @param {object} credentials
 */
async function loginSocialUser(credentials) {
  try {
    await auth()
      .signInWithCredential(credentials)
      .then((res) => {
        console.log(
          'Social account signed in',
          JSON.stringify(res, null, '\t'),
        );
      })
      .catch((error) => {
        Alert.alert('Error signing in', error.message);
        console.warn('Social login error', error.message);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
}
/**
 * Check user if existing in database
 * if email and password is passed, find through email and validate with password
 * if email is only provided, find through email
 * @param {function} callback
 * @param {string} email
 * @param {string} password
 */
async function checkUserExist(callback, email = null, password = null) {
  try {
    let userExists = false;
    await database()
      .ref('/users')
      .once('value')
      .then((snapshot) => {
        snapshot.forEach((querySnapshot) => {
          let data = querySnapshot.val();
          if (data?.email_address === email) {
            console.log('User found!', data);
            if (
              (password && password === data?.password) ||
              password === null ||
              password === undefined
            ) {
              userExists = true;
              callback({id: querySnapshot.key, ...data});
            }
          }
        });
      });
    !userExists && callback(null);
  } catch (error) {
    console.warn('Error', error.message);
  }
}
/**
 * Login user to auth
 * @param {string} email
 * @param {string} password
 */
async function loginUser(email, password, callback = null) {
  await auth()
    .createUserWithEmailAndPassword(email, password)
    .then((res) => {
      console.log('User account created', JSON.stringify(res, null, '\t'));
    })
    .catch((error) => {
      callback && callback(error.code);
      if (error.code === 'auth/email-already-in-use') {
        auth()
          .signInWithEmailAndPassword(email, password)
          .then(() => {
            console.log('User account signed in!');
          })
          .catch((error) => {
            if (error.code === 'auth/invalid-email') {
              console.log('That email address is invalid!');
            }
            Alert.alert('Error signing in', error.message);
          });
      }
      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
      }
      console.error(error.message);
    });
}
async function loginOnly(email, password, callback) {
  auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log('User account signed in!');
      callback(true);
    })
    .catch((error) => {
      console.error(error.code, error.message);
      callback(error.code);
    });
}
/**
 *  Check if user exists
 * If not, register and login
 * @param {object} userData
 * @param {function} callback
 */
async function register(userData, callback) {
  try {
    await checkUserExist((data) => {
      if (data) {
        callback(false);
      } else {
        const newReference = database().ref('/users').push();
        console.log('Auto generated key: ', newReference.key);
        newReference
          .set({
            ...userData,
            profile_pic: '',
            is_account_verified: false,
            gcash_number: '',
            paymaya_number: '',
            date_created: new Date().toString(),
            shop_name: '',
          })
          .then(() => console.log('Data updated.'));
        callback(newReference.key);
      }
    }, userData.email_address);
  } catch (error) {
    console.warn('Error', error.message);
  }
}
/**
 * Update user info with object keys and values
 * @param {string} id
 * @param {object} data
 */
const updateUserByID = async (id, data) => {
  try {
    await database()
      .ref(`/users/${id}`)
      .update(data)
      .then(() => console.log('Data updated.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get user info by ID
 * @param {string} id
 * @param {function} callback
 */
const getUserInfo = async (id, callback) => {
  try {
    let userExists = false;
    await database()
      .ref('/users')
      .once('value')
      .then((snapshot) => {
        snapshot.forEach((querySnapshot) => {
          let data = querySnapshot.val();
          if (querySnapshot.key === id) {
            userExists = true;
            callback({id: querySnapshot.key, ...data});
          }
        });
      });
    !userExists && callback(null);
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Log user actions
 * @param {string} id
 * @param {string} action
 */
const logAction = async (id, action) => {
  try {
    const newReference = database().ref('/logs').push();
    console.log('Auto generated key: ', newReference.key);
    newReference
      .set({
        id: newReference.key,
        action,
        date: new Date().toString(),
        userID: id,
      })
      .then(() => console.log('Data updated.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get user info by ID
 * returns log array
 * @param {string} id
 * @param {function} callback
 */
const getUserLogs = async (id, callback) => {
  try {
    let logs = [];
    await database()
      .ref('/logs')
      .once('value')
      .then((snapshot) => {
        snapshot.forEach((querySnapshot) => {
          let data = querySnapshot.val();
          if (data.userID === id) {
            logs.push(data);
          }
        });
      });
    callback(logs);
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Delete user logs
 * Iterate through logs fetched
 * returns null
 * @param {array} logs
 */
const deleteUserLogs = async (logs) => {
  try {
    logs.map(async (item) => {
      await database().ref(`/logs/${item.id}`).remove();
    });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Upload photo to database
 * @param {string} filepath
 * @param {string} filename
 * @param {function} callback
 */
const uploadPhoto = async (filepath, filename, callback) => {
  try {
    await storage().setMaxUploadRetryTime(100000);
    console.warn('Image', filepath, filename);
    let task = storage().ref(filename).putFile(filepath);

    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
    });

    task.then(() => {
      console.log('Image uploaded to the bucket!');
      callback();
    });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get download URL of file
 * @param {string} ref
 */
const getDownloadURL = async (ref) => {
  try {
    await storage().setMaxDownloadRetryTime(100000);
    const url = await storage().ref(ref).getDownloadURL();
    if (url) {
      return url;
    }
    return;
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Logout user from auth
 */
const logout = () => {
  try {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Deletes user account from the database
 * Files associated from other tables and storage are not yet deleted
 * @param {string} id
 */
const deleteUserAccount = async (id) => {
  try {
    await database().ref(`/users/${id}`).remove();
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Deletes files from the storage
 * @param {string} id
 */
const deleteFiles = async (id) => {
  try {
    await storage().ref(id).delete();
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Delete currently signed in auth user
 * @param {function} callback
 */
const deleteAuthUser = async (callback) => {
  try {
    await auth()
      .currentUser.delete()
      .then(() => callback());
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get user's public profile by ID
 * @param {string} id
 * @param {function} callback
 */
const getPublicProfile = async (id, callback) => {
  try {
    let userExists = false;
    await database()
      .ref('/users')
      .once('value')
      .then((snapshot) => {
        snapshot.forEach((querySnapshot) => {
          let data = querySnapshot.val();
          if (querySnapshot.key === id) {
            userExists = true;
            delete data.password;
            delete data.account_number;
            callback({id: querySnapshot.key, ...data});
          }
        });
      });
    !userExists && callback(null);
  } catch (error) {
    console.warn('Error', error.message);
  }
};
export default {
  checkUserExist,
  deleteAuthUser,
  deleteFiles,
  deleteUserAccount,
  deleteUserLogs,
  facebookLogin,
  facebookLogout,
  getDownloadURL,
  getPublicProfile,
  getUserInfo,
  getUserLogs,
  googleLogin,
  googleLogout,
  logAction,
  loginOnly,
  loginSocialUser,
  loginUser,
  logout,
  register,
  updateUserByID,
  uploadPhoto,
};
