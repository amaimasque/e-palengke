import React, {useEffect, useState} from 'react';
import {Image, View, StyleSheet, BackHandler} from 'react-native';
import {GiftedChat, Send, Actions, Composer} from 'react-native-gifted-chat';
import {Container, Content} from 'native-base';
import ImagePicker from 'react-native-image-picker';

import CustomHeader from 'components/headers/sellerheader';

import firebaseSvc from 'modules/FirebaseSvc';
import Database from 'modules/Database';
import AsyncHelper from 'modules/AsyncHelper';

const SEND = require('assets/images/send.png');
const IMAGE = require('assets/images/image.png');
const VIDEO = require('assets/images/video.png');

export default function Chat(props) {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      props.route.params.refreshMessages();
      props.navigation.goBack(null);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);
  
  useEffect(() => {
    setMessages([]);
    let {otherUserID} = props.route.params;
    // alert(userID + ' ' + otherUserID)
    if (userID !== '') {
      firebaseSvc.refOn(userID, otherUserID, (message) => {
        // alert(JSON.stringify(message, null, '\t'));
        // setMessages(messages.concat(message));
        // setTimeout(() => {
        //   console.log('After', JSON.stringify(messages, null, '\t'));
        // }, 1000);
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, message),
        );
      });
      firebaseSvc.updateMessageStatus(userID, otherUserID);
      // setTimeout(() => alert(messages), 1000)
    }
    return () => firebaseSvc.refOff();
  }, [props.route.params]);

  useEffect(() => {
    // firebaseSvc.getMessages((msgs) => setMessages(msgs))
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      let id = await AsyncHelper.getItem('USER_ID');
      if (id) {
        setUserID(id);
        await Database.getUserInfo(id, async (data) => {
          if (data) {
            if (data.profile_pic !== '') {
              let url = await Database.getDownloadURL(data.profile_pic);
              if (url) {
                setUser({
                  name: `${data.first_name} ${data.last_name}`,
                  email: data.email_address,
                  avatar: url,
                  _id: firebaseSvc.uid,
                });
              }
            } else {
              setUser({
                name: `${data.first_name} ${data.last_name}`,
                email: data.email_address,
                avatar: '',
                _id: firebaseSvc.uid,
              });
            }
          }
        });
      }
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  // get user() {
  //   return {
  //     name: this.props.navigation.state.params.name,
  //     email: this.props.navigation.state.params.email,
  //     avatar: this.props.navigation.state.params.avatar,
  //     _id: firebaseSvc.uid,
  //   };
  // }

  const handlePhotoSelection = async (messages) => {
    // const options = {
    //   quality: 1.0, // range is 0.1 - 1.0
    //   maxWidth: 800,
    //   maxHeight: 800,
    //   noData: true,
    // };
    await ImagePicker.showImagePicker({allowsEditing: true}, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        // alert(JSON.stringify(messages))
        firebaseSvc.send(messages, 'https://i.pinimg.com/originals/6d/be/99/6dbe99d6021c1e9735265dc35271d415.jpg');
      }
    });
  };

  const handleVideoSelection = async () => {
    // const options = {
    //   quality: 1.0, // range is 0.1 - 1.0
    //   noData: true,
    // };
    await ImagePicker.showImagePicker({allowsEditing: true}, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        onSend([{ image: result.uri }])
        return result.uri
      }
    });
  };


  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        {user !== null && (
          <GiftedChat
            messages={messages}
            onSend={(_messages) => firebaseSvc.send(_messages, userID, props.route.params.otherUserID)}
            user={user}
            renderSend={(props) => {
              return (
                <View>
                  {/* <View style={styles.composerActionButtonsContainer}>
                    <Actions
                      {...props}
                      onPressActionButton={handlePhotoSelection}
                      icon={() => (
                        <Image
                          source={IMAGE}
                          style={styles.composerActionButton}
                        />
                      )}
                      wrapperStyle={{margin: 0}}
                      containerStyle={styles.composerActionButtonContainer}
                    />
                    <Actions
                      {...props}
                      onPressActionButton={() => {}}
                      icon={() => (
                        <Image
                          source={VIDEO}
                          style={styles.composerActionButton}
                        />
                      )}
                      wrapperStyle={{margin: 0}}
                      containerStyle={styles.composerActionButtonContainer}
                    />
                  </View> */}
                  <Send {...props} containerStyle={styles.sendButton}>
                    <Image source={SEND} style={styles.sendIcon} />
                  </Send>
                </View>
              );
            }}
            alwaysShowSend={true}
            alignTop={true}
            renderComposer={(props) => {
              return (
                <Composer
                  {...props}
                  textInputStyle={styles.composerInput}
                  placeholder="Type your message here..."
                  multiline={true}
                  placeholderTextColor="grey"
                />
              );
            }}
            minInputToolbarHeight={60}
            // minInputToolbarHeight={80}
            // minComposerHeight={80}
          />
        )}
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  composerActionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 5,
    marginTop: 10,
    justifyContent: 'center',
  },
  composerActionButtonContainer: {
    width: 40,
    margin: 0,
  },
  composerActionButton: {
    width: 40,
    resizeMode: 'contain',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: '#21BEDE',
    // borderWidth: 2,
    marginHorizontal: 5,
  },
  sendIcon: {
    width: 40,
    height: 40,
  },
  composerInput: {
    // backgroundColor: '#F1F1F1',
    borderRadius: 10,
    textAlignVertical: 'top',
    margin: 10
  },
})