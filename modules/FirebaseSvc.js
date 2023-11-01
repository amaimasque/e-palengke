import firebase from '@react-native-firebase/app';
import AsyncHelper from 'modules/AsyncHelper';
import Database from 'modules/Database';

class FirebaseSvc {
  constructor() {}

  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = (user) => {
    if (!user) {
      try {
        this.login(user);
      } catch ({message}) {
        console.log('Failed:' + message);
      }
    } else {
      console.log('Reusing auth...');
    }
  };

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get userID() {
    return AsyncHelper.getItem('USER_ID');
  }

  get ref() {
    return firebase.database().ref('messages');
  }

  parse = (snapshot) => {
    const {timestamp: numberStamp, text, user} = snapshot.val();
    const {key: id} = snapshot;
    const {key: _id} = snapshot; //needed for giftedchat
    const timestamp = new Date(numberStamp);

    const message = {
      id,
      _id,
      timestamp,
      text,
      user,
    };
    return message;
  };

  getInitialMessages = async (id, callback) => {
    try {
      await this.ref
        // .limitToLast(20)
        .once('value', (snapshot) => {
          let msg = snapshot.val();
          //test if msg is for user
          //TODO: test according to other user
          if (msg.receiverUserID === id || msg.senderUserID === id) {
            callback(msg);
          }
        });
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  getMessages = async (id, callback) => {
    try {
      await this.ref
        // .limitToLast(20)
        .on('child_added', (snapshot) => {
          let msg = snapshot.val();
          //test if msg is for user
          //TODO: test according to other user
          if (msg.receiverUserID === id || msg.senderUserID === id) {
            callback(msg);
          }
        });
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  statusListener = async (id, callback) => {
    try {
      await this.ref
        // .limitToLast(20)
        .on('child_changed', (snapshot) => {
          let msg = snapshot.val();
          //test if msg is for user
          //TODO: test according to other user
          if (msg.receiverUserID === id || msg.senderUserID === id) {
            callback(msg);
          }
        });
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  //update status to read when message's senderID is other user viewed
  updateMessageStatus = async (id, senderID) => {
    try {
      await this.ref.once('value', (snapshot) => {
        snapshot.forEach(async (itemSnapshot) => {
          let msg = itemSnapshot.val();
          if (msg.receiverUserID === id && msg.senderUserID === senderID) {
            await firebase
              .database()
              .ref(`/messages/${msg._id}`)
              .update({
                status: 'read',
              })
              .then(() => console.log('Data updated.'));
          }
        });
      });
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  // const updateUserByID = async (id, data) => {
  //   try {
  //     await database()
  //       .ref(`/users/${id}`)
  //       .update(data)
  //       .then(() => console.log('Data updated.'));
  //   } catch (error) {
  //     console.warn('Error', error.message);
  //   }
  // };

  refOn = (userID, id, callback) => {
    try {
      this.ref
        // .limitToLast(20)
        .on('child_added', (snapshot) => {
          let msg = snapshot.val();
          //test if msg is for user
          //TODO: test according to other user
          if (
            (msg.receiverUserID === userID || msg.senderUserID === userID) &&
            (msg.receiverUserID === id || msg.senderUserID === id)
          ) {
            //TODO: filter according to selected user
            //test msg according to certain user
            //if sender is user, set user to user
            //if sender is other user, set user to user
            msg.user = msg.sender;
            callback(msg);
          }
        });
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  // send the message to the Backend
  send = (messages, userID, receiverUserID) => {
    try {
      for (let i = 0; i < messages.length; i++) {
        Database.getPublicProfile(receiverUserID, (userData) => {
          let {profile_pic, email_address} = userData;
          const newReference = this.ref.push(message);
          const {text, user} = messages[i];
          const message = {
            text,
            receiver: {
              avatar: profile_pic,
              email: email_address,
              name: `${userData.first_name} ${userData.last_name}`,
            },
            receiverUserID,
            sender: user,
            senderUserID: userID,
            createdAt: this.timestamp,
            status: 'unread',
            // messageType:
            //   video === null ? (image === null ? 'message' : 'image') : 'video',
          };
          // if (image !== null) message.image = image;
          // if (video !== null) message.video = video;
          console.warn(JSON.stringify(message));
          // this.ref.push(message);
          newReference
            .set({
              ...message,
              _id: newReference.key,
            })
            .then(() => console.log('Message sent.'));
        });
      }
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  refOff() {
    this.ref.off();
  }
}

const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
