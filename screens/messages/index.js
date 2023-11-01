import React, {useEffect, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {Container, Content, Text, Thumbnail} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import CustomHeader from 'components/headers/sellerheader';

import firebaseSvc from 'modules/FirebaseSvc';
import AsyncHelper from 'modules/AsyncHelper';
import DateHelper from 'modules/DateHelper';
import Database from 'modules/Database';

const SAD = require('assets/images/sad.png');

const USER = require('assets/images/user_icon.png');
function ChatPhoto(props) {
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    props.url !== '' && !props.url.startsWith('http') ?
      fetchPhotoUrl(props.url, (url) => {
        setPhotoUrl(url);
      }) : props.url;
  }, [props.url]);

  const fetchPhotoUrl = async (url, callback) => {
    url = await Database.getDownloadURL(url);
    url !== '' && callback(url);
    return url !== '';
  };

  return (
    <Image
      // source={photoUrl === '' ? USER : {uri: photoUrl}}
      source={props.url === '' ? USER : {uri: photoUrl}}
      style={{
        width: wp('30%'),
        height: wp('30%'),
        borderRadius: wp('30%') / 2,
        backgroundColor: '#C1BFBF',
      }}
    />
  );
}
export default function Chat(props) {
  const [messages, setMessages] = useState([]);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState('');

  // useEffect(() => {
  //   firebaseSvc.getInitialMessages('-MKtW2iCZhj7NUNTVlJi', (message) => {
  //     let userID = '-MKtW2iCZhj7NUNTVlJi',
  //       messagesCopy = messages;
  //     let otherUserID =
  //       userID === message.receiverUserID
  //         ? message.senderUserID
  //         : message.receiverUserID;
  //     let lastMsgIndex = messagesCopy.findIndex((msg) => {
  //       return msg.userID === otherUserID;
  //     });
  //     message.userID = otherUserID;
  //     if (lastMsgIndex >= 0) {
  //       messagesCopy[lastMsgIndex] = message;
  //     } else {
  //       messagesCopy.push(message);
  //     }
  //     setMessages([...messagesCopy]);
  //     setRefresh(!refresh);
  //   });
  // }, []);

  useEffect(() => {
    getUserID();
  }, []);

  const getUserID = async () => {
    let id = await AsyncHelper.getItem('USER_ID');
    setUserID(id);
  };

  const fetchMessages = () => {
    setLoading(true);
    firebaseSvc
      .getMessages(userID, (message) => {
        let messagesCopy = messages;
        let otherUserID =
          userID === message.receiverUserID
            ? message.senderUserID
            : message.receiverUserID;
        let lastMsgIndex = messagesCopy.findIndex((msg) => {
          return msg.userID === otherUserID;
        });
        message.userID = otherUserID;
        if (lastMsgIndex >= 0) {
          messagesCopy[lastMsgIndex] = message;
        } else {
          messagesCopy.push(message);
        }
        setMessages([...messagesCopy]);
        setRefresh(!refresh);
      })
      .then(() => setLoading(false));
  };

  useEffect(() => {
    userID !== '' && fetchMessages();
  }, [userID]);

  useEffect(() => {
    userID !== '' &&
      firebaseSvc.statusListener(userID, (message) => {
        let messagesCopy = messages;
        // let otherUserID =
        //   userID === message.receiverUserID
        //     ? message.senderUserID
        //     : message.receiverUserID;
        let lastMsgIndex = messagesCopy.findIndex((msg) => {
          return msg._id === message._id;
        });
        if (lastMsgIndex >= 0) {
          messagesCopy[lastMsgIndex].status = message.status;
        }
        // else {
        //   message.userID = otherUserID;
        //   messagesCopy.push(message);
        // }
        // alert(JSON.stringify(messagesCopy, null, '\t'));
        setMessages([...messagesCopy]);
        setRefresh(!refresh);
      });
    return () => firebaseSvc.refOff();
  }, []);

  const renderMessage = ({item}) => {
    let {
      receiverUserID,
      receiver,
      text,
      createdAt,
      sender,
      status,
      senderUserID,
    } = item;
    //TODO: change static id to user ID
    let displayUser = receiverUserID === userID ? sender : receiver;
    let displayUserID =
      receiverUserID === userID ? senderUserID : receiverUserID;
    console.warn(JSON.stringify(displayUser));
    return (
      <TouchableOpacity
        onPress={() =>
          props.navigation.navigate('ViewMessage', {
            otherUserID: displayUserID,
            refreshMessages: fetchMessages,
          })
        }
        style={[
          {
            padding: wp('5%'),
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomColor: '#E8E8E8',
            borderBottomWidth: 1,
          },
          userID !== senderUserID &&
            status === 'unread' && {backgroundColor: '#F1F1F1'},
        ]}>
        <ChatPhoto url={displayUser.avatar} />
        <View style={{width: wp('55%'), marginLeft: wp('2%')}}>
          <Text style={styles.fontStyle}>{displayUser.name}</Text>
          <Text numberOfLines={2} style={styles.fontStyle}>
            {userID === senderUserID && 'You: '}
            {text}
          </Text>
          <Text style={styles.dateStyle}>
            {DateHelper.timestampToTime(createdAt)}
          </Text>
        </View>
        <View>
          {userID !== senderUserID && status === 'unread' && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#AAE556',
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content>
        {/* <Content contentContainerStyle={{flex: 1, backgroundColor: 'red'}}> */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchMessages} />
          }
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}>
          {loading ? (
            <ActivityIndicator
              size="large"
              animating={true}
              color="black"
              style={{marginVertical: hp('40%')}}
            />
          ) : (
            <FlatList
              // keyExtractor={(item) => item._id}
              // style={{width: '100%', flex: 1}}
              data={messages.sort(
                (a, b) => parseInt(a.timestamp) > parseInt(b.timestamp),
              )}
              ItemSeparatorComponent={() => (
                <View style={{borderColor: '#E8E8E8', borderWidth: 1}} />
              )}
              renderItem={renderMessage}
              extraData={[messages, refresh]}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Thumbnail
                    source={SAD}
                    large
                    square
                    style={styles.emptyIcon}
                  />
                  <Text style={[styles.textStyle, {color: '#00ACEA'}]}>
                    NO MESSAGES
                  </Text>
                </View>
              )}
            />
          )}
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  fontStyle: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
  },
  dateStyle: {
    fontSize: 12,
    color: '#C1BFBF',
    fontFamily: 'Raleway-Medium',
    textAlign: 'left',
    marginTop: 10,
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: '#00ACEA',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: hp('80%'),
  },
  emptyIcon: {
    width: wp('30%'),
    height: wp('30%'),
    resizeMode: 'contain',
  },
});
