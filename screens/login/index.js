import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Alert,
  StatusBar,
} from 'react-native';
import {Container, Button, Text, Content, Card, Toast} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import auth from '@react-native-firebase/auth';

import LoadingModal from 'components/loadingmodal';
import PasswordResetModal from './components/passwordresetmodal';
import SocialSetupModal from 'components/socialsetting';
import LoginForm from './components/loginform';
import RegistrationForm from './components/registrationform';
import StringHelper from 'modules/StringHelper';
import Database from 'modules/Database';
import * as RootNavigation from 'modules/RootNavigation';
import AsyncHelper from 'modules/AsyncHelper';

const BG = require('assets/images/splashscreen_bg.png');
const LOGO = require('assets/images/logo_text.png');
const FB = require('assets/images/facebook.png');
const GOOGLE = require('assets/images/google.png');

export default function Login() {
  const [focused, setFocused] = useState('login');
  const [email, setEmail] = useState('buyer');
  const [password, setPassword] = useState('');
  const [registrationData, setregistrationData] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [isSocialSetup, setisSocialSetup] = useState(false);
  const [
    isPasswordResetModalVisible,
    setPasswordResetModalVisibility,
  ] = useState(false);

  const onAuthStateChanged = async (user) => {
    // alert('Changed!')
    console.warn('User', JSON.stringify(auth().currentUser, null, '\t'));
    if (auth().currentUser !== null) {
      let userID = await AsyncHelper.getItem('USER_ID');
      if (auth().currentUser.providerData[0]?.providerId !== 'password') {
        Database.getUserInfo(userID, (info) => {
          // alert(JSON.stringify(info, null, '\t'))
          if (
            info.account_type === '' ||
            info.account_type === null ||
            userID == '' ||
            userID == null
          ) {
            return;
          }
          Database.logAction(userID, 'User has logged in!');
          AsyncHelper.setItem('USER_INFO', JSON.stringify(info));
          AsyncHelper.setItem('ACCOUNT_TYPE', info.account_type);
          Toast.show({
            text: 'Successfully logged in!',
          });
          RootNavigation.reset(StringHelper.toProperCase(info.account_type));
        });
      } else {
        if (
          !auth().currentUser.emailVerified &&
          auth().currentUser.providerData[0]?.providerId !== 'facebook.com'
        ) {
          Alert.alert(
            'Account Verification',
            "Please verify your account first. We've sent an email to the email address you used for registration.",
          );
          auth().currentUser.sendEmailVerification();
          setTimeout(async () => {
            AsyncHelper.clearItems();
            Database.logout();
            try {
              await Database.facebookLogout();
              await Database.googleLogout();
            } catch (err) {
              console.warn(err);
            }
          }, 1000);
        } else {
          //Disable auto login when account is not yet setup
          //RegistratonData is set (null before) & social setup is needed, USER_ID is only set
          //Check if account type / is set

          // Toast.show({
          //   'Please verify your email.',
          //   buttonText: 'OK',
          // });
          // let userID = await AsyncHelper.getItem('USER_ID');
          // alert(userID)
          Database.getUserInfo(userID, (info) => {
            // alert(JSON.stringify(info))
            Database.logAction(userID, 'User has logged in!');
            AsyncHelper.setItem('USER_INFO', JSON.stringify(info));
            AsyncHelper.setItem('ACCOUNT_TYPE', info.account_type);
            Toast.show({
              text: 'Successfully logged in!',
            });
            RootNavigation.reset(StringHelper.toProperCase(info.account_type));
          });
          // AsyncHelper.setItem('USER_INFO', JSON.stringify(registrationData));
          // Database.loginUser(
          //   registrationData.email_address,
          //   registrationData.password,
          // );
        }
      }
    }
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    let userType = await AsyncHelper.getItem('ACCOUNT_TYPE');
    if (userType) {
      RootNavigation.reset(StringHelper.toProperCase(userType));
    }
  };

  const handleLogin = async () => {
    if (focused === 'login') {
      // setisLoading(true);
      if (email === '' || password === '') {
        return Alert.alert('Error', 'Please complete login fields!');
      }
      setisLoading(true);
      await Database.loginOnly(email, password, async (status) => {
        //authentication succeeded
        if (status === true) {
          //get id
          await Database.checkUserExist(async (data) => {
            if (data) {
              await Database.updateUserByID(data.id, {password});
              await AsyncHelper.setItem('USER_ID', data.id).then(
                onAuthStateChanged,
              );
            } else {
              Alert.alert(
                'Login Failed',
                'Internal Error! Please contact administrator.',
              );
            }
          }, email);
        } else {
          setisLoading(false);
          Alert.alert('Login Failed', 'Invalid email/password!');
        }
      });

      // await Database.checkUserExist(
      //   async (data) => {
      //     if (data) {
      //       AsyncHelper.setItem('USER_ID', data.id);
      //       await Database.loginUser(email, password);
      //     } else {
      //       Alert.alert('Error logging in', 'User does not exists!');
      //     }
      //     setisLoading(false);
      //   },
      //   email,
      //   password,
      // ).then(() => {
      //   setisLoading(false);
      // });
    } else {
      setFocused('login');
    }
  };

  const handleRegister = async () => {
    console.warn('Reg data', JSON.stringify(registrationData, null, '\t'));
    if (focused === 'register') {
      if (
        Object.values(registrationData).some(
          (item) => item === null || item === '',
        )
      ) {
        return Alert.alert('Error', 'Please complete registration fields!');
      } else {
        setisLoading(true);
        await Database.register(registrationData, async (response) => {
          if (response) {
            setisLoading(false);
            AsyncHelper.setItem('USER_ID', response);
            await Database.loginUser(
              registrationData.email_address,
              registrationData.password,
            ).then(() => setFocused('login'));
          }
        });
      }
    } else {
      setFocused('register');
    }
  };

  const handleLoginData = (data) => {
    setEmail(data.email_address);
    setPassword(data.password);
  };

  const handleGoogleLogin = async () => {
    setisLoading(true);
    await Database.googleLogin(async (data) => {
      await AsyncHelper.setItem('USER_ID', data.id);
      if (data.account_type === '') {
        setregistrationData(data);
        setisSocialSetup(true);
        // } else {
        //   AsyncHelper.setItem('USER_ID', data.id);
        //   AsyncHelper.setItem('ACCOUNT_TYPE', data.account_type);
        //   AsyncHelper.setItem('USER_INFO', JSON.stringify(data));
        //   Database.logAction(data.id, 'User has logged in!');
        //   Toast.show({
        //     text: 'Successfully logged in!',
        //   });
        //   RootNavigation.reset(StringHelper.toProperCase(data.account_type));
      } else {
        onAuthStateChanged();
      }
    }).then(() => {
      setisLoading(false);
    });
  };

  const handleFacebookLogin = async () => {
    setisLoading(true);
    await Database.facebookLogin(async (data) => {
      await AsyncHelper.setItem('USER_ID', data.id);
      if (data.account_type === '') {
        setregistrationData(data);
        setisSocialSetup(true);
        // } else {
        //   AsyncHelper.setItem('USER_ID', data.id);
        //   AsyncHelper.setItem('ACCOUNT_TYPE', data.account_type);
        //   AsyncHelper.setItem('USER_INFO', JSON.stringify(data));
        //   Database.logAction(data.id, 'User has logged in!');
        //   Toast.show({
        //     text: 'Successfully logged in!',
        //   });
        //   RootNavigation.reset(StringHelper.toProperCase(data.account_type));
      } else {
        onAuthStateChanged();
      }
    }).then(() => {
      setisLoading(false);
    });
  };

  return (
    <Container>
      <Content>
        {isLoading && <LoadingModal isLoading={isLoading} />}
        {isSocialSetup && (
          <SocialSetupModal
            visible={isSocialSetup}
            onPressContinue={async (data) => {
              await Database.updateUserByID(registrationData.id, data).then(
                () => {
                  onAuthStateChanged();
                },
              );
              // AsyncHelper.setItem('USER_ID', registrationData.id);
              // AsyncHelper.setItem('ACCOUNT_TYPE', data.account_type);
              // AsyncHelper.setItem(
              //   'USER_INFO',
              //   JSON.stringify({
              //     ...registrationData,
              //     account_type: data.accountType,
              //     birthdate: data.birthdate,
              //     password: data.password,
              //   }),
              // );
              // Toast.show({
              //   text: 'Successfully logged in!',
              // });
              // RootNavigation.reset(
              //   StringHelper.toProperCase(data.account_type),
              // );
            }}
          />
        )}
        {isPasswordResetModalVisible && (
          <PasswordResetModal
            visible={isPasswordResetModalVisible}
            onDismiss={() => setPasswordResetModalVisibility(false)}
            onSubmit={async (email) => {
              try {
                await auth()
                  .sendPasswordResetEmail(email)
                  .then(() =>
                    Toast.show({text: 'Password reset email has been sent'}),
                  );
              } catch (error) {
                console.warn('Error password reset', error.message);
                Alert.alert('Error', 'Invalid email address');
              }
            }}
          />
        )}
        <ImageBackground source={BG} style={styles.imageBg}>
          <Card style={styles.loginContainer}>
            <Image source={LOGO} style={styles.logo} />
            <View style={{width: '80%'}}>
              {focused === 'login' ? (
                <LoginForm
                  onPressForgotPassword={() =>
                    setPasswordResetModalVisibility(true)
                  }
                  handleLoginData={handleLoginData}
                />
              ) : (
                <RegistrationForm
                  handleRegistrationData={(data) => setregistrationData(data)}
                />
              )}

              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleLogin}
                  // bordered
                  style={[styles.loginButton, {backgroundColor: '#8CC739'}]}>
                  <Text numberOfLines={1} style={[styles.buttonText, {color: 'white'}]}>
                    {focused === 'register' ? 'CANCEL' : 'LOGIN'}
                  </Text>
                </Button>
                <Button
                  onPress={handleRegister}
                  // bordered
                  full
                  style={[styles.loginButton, {backgroundColor: '#21BEDE'}]}>
                  <Text numberOfLines={1} style={[styles.buttonText, {color: 'white'}]}>
                    REGISTER
                  </Text>
                </Button>
              </View>
              {focused === 'login' && (
                <View>
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        textAlign: 'center',
                        marginVertical: hp('2%'),
                        fontSize: 9,
                        color: '#31C3E7',
                      },
                    ]}>
                    OR LOGIN WITH
                  </Text>
                  <View style={styles.buttonContainer}>
                    <Button
                      onPress={handleFacebookLogin}
                      bordered
                      style={[
                        styles.loginButton,
                        {flexDirection: 'row', borderColor: '#31C3E7'},
                      ]}>
                      <Image
                        source={FB}
                        style={[
                          styles.inputIcon,
                          {tintColor: '#31C3E7', marginLeft: wp('5%')},
                        ]}
                      />
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        style={[
                          styles.buttonText,
                          {width: wp('25%'), color: '#31C3E7'},
                        ]}>
                        FACEBOOK
                      </Text>
                    </Button>
                    <Button
                      onPress={handleGoogleLogin}
                      bordered
                      style={[styles.loginButton, {borderColor: '#31C3E7'}]}>
                      <Image
                        source={GOOGLE}
                        style={[
                          styles.inputIcon,
                          {tintColor: '#31C3E7', marginLeft: wp('5%')},
                        ]}
                      />
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        style={[
                          styles.buttonText,
                          {width: wp('20%'), color: '#31C3E7'},
                        ]}>
                        GOOGLE
                      </Text>
                    </Button>
                  </View>
                </View>
              )}
            </View>
          </Card>
        </ImageBackground>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 15,
    fontWeight: '600',
  },
  forgotPassword: {
    fontFamily: 'Raleway-Medium',
    fontSize: 9,
  },
  imageBg: {
    height: hp('100%') - StatusBar.currentHeight,
    width: wp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIcon: {
    height: wp('5%'),
    width: wp('5%'),
    resizeMode: 'contain',
  },
  inputText: {
    fontFamily: 'Raleway-Light',
    fontSize: 13,
  },
  loginButton: {
    width: wp('30%'),
    justifyContent: 'center',
  },
  loginContainer: {
    width: wp('80%'),
    alignItems: 'center',
    paddingVertical: hp('3%'),
  },
  logo: {
    width: wp('50%'),
    height: hp('10%'),
    resizeMode: 'contain',
  },
});
