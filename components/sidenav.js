import React, {useState, useEffect} from 'react';
import {View, Alert, StyleSheet, FlatList} from 'react-native';
import {
  Container,
  Button,
  Text,
  Item,
  Content,
  Thumbnail,
  Title,
  Footer,
} from 'native-base';
import StringHelper from 'modules/StringHelper';
import * as RootNavigation from 'modules/RootNavigation';
import AsyncHelper from 'modules/AsyncHelper';
import Database from 'modules/Database';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';

const ITEMS = [
  {
    title: 'items',
    navigation: 'Items',
    icon: require('assets/images/items.png'),
  },
  {
    title: 'requests',
    navigation: 'Requests',
    icon: require('assets/images/requests.png'),
  },
  {
    title: 'transaction_history',
    navigation: 'TransactionHistory',
    icon: require('assets/images/transaction.png'),
  },
  {
    title: 'messages',
    navigation: 'Messages',
    icon: require('assets/images/messages.png'),
  },
  {
    title: 'account_settings',
    navigation: 'AccountSettings',
    icon: require('assets/images/settings.png'),
  },
  {
    title: 'logout',
    navigation: 'Logout',
    icon: require('assets/images/logout.png'),
  },
];


const CLOSE = require('assets/images/close.png');

export default function SideNavigation(props) {
  const [userType, setUserType] = useState('');
  const [customerName, setcustomerName] = useState('');
  const [profile, setprofile] = useState('');
  const [profileRef, setprofileRef] = useState('');

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    getUser();
    return () => getUser();
  }, [props]);

  const getUser = async () => {
    let userId = await AsyncHelper.getItem('USER_ID');
    let type = await AsyncHelper.getItem('ACCOUNT_TYPE');
    let userInfo = await AsyncHelper.getItem('USER_INFO');
    if (type) {
      type !== userType && setUserType(type);
      // if (userInfo !== null || userInfo !== undefined) {
      //   userInfo = JSON.parse(userInfo);
      //   setcustomerName(`${userInfo.first_name} ${userInfo.last_name}`);
      //   if (userInfo.profile_pic === '') {
      //     return;
      //   }
      //   setprofileRef(userInfo.profile_pic);
      //   if (
      //     userInfo.profile_pic !== '' &&
      //     profileRef !== userInfo.profile_pic
      //   ) {
      //     let url = await Database.getDownloadURL(userInfo.profile_pic);
      //     console.warn('Download url', url);
      //     setprofile(url);
      //     await AsyncStorage.setItem('PROFILE_URL', url);
      //   }
      // } else {
      Database.getUserInfo(userId, async (info) => {
        setcustomerName(`${info.first_name} ${info.last_name}`);
        AsyncHelper.setItem('USER_INFO', JSON.stringify(info));
        if (info.profile_pic === '') {
          return;
        }
        setprofileRef(info.profile_pic);
        if (info.profile_pic !== '' && profileRef !== info.profile_pic) {
          let url = await Database.getDownloadURL(info.profile_pic);
          console.warn('Download url', url);
          setprofile(url);
          await AsyncStorage.setItem('PROFILE_URL', url);
        }
      });
      // }
    } else {
      logout();
    }
  };
  
  const handleLogout = () => {
    Alert.alert('Confirm', 'Are you sure you want to logout?', [
      {
        text: 'NO',
        style: 'cancel',
      },
      {
        text: 'YES',
        onPress: logout,
      },
    ]);
  };

  const logout = async () => {
    let id = await AsyncHelper.getItem('USER_ID');
    Database.logAction(id, 'User has logged out.').then(() => {
      AsyncHelper.clearItems();
    });
    Database.logout();
    try {
      await Database.facebookLogout();
      await Database.googleLogout();
    } catch (err) {
      console.warn(err);
    }
    RootNavigation.reset('Login');
  };

  const handleNavigation = (title) => {
    switch(title) {
      case 'Logout': 
        return handleLogout();
      // case 'Messages':
      //   return alert('This feature is under development!')
      default:
        return props.navigation.navigate(title);
    }
  }

  const renderBarItems = ({item, index}) => {
    let {title, icon, navigation} = item;
    if (index === 0) {
      title = userType === 'buyer' ? 'market' : title;
      navigation = userType === 'buyer' ? 'Market' : navigation;
    }
    return (
      <Item
        onPress={() => handleNavigation(navigation)}
        style={{paddingHorizontal: 10, paddingVertical: 5}}>
        <Thumbnail small square source={icon} style={styles.itemIcon} />
        <Title style={styles.itemText}>
          {StringHelper.toProperCase(title.replace('_', ' '))}
        </Title>
      </Item>
    );
  };

  return (
    <Container style={[styles.mainContainer, {backgroundColor: 'white'}]}>
      <Content>
        <Button
          transparent
          style={{alignSelf: 'flex-end', marginRight: 10}}
          onPress={() => props.navigation.toggleDrawer()}>
          <Thumbnail source={CLOSE} style={{height: 30, width: 30}} />
        </Button>
        <View style={{alignItems: 'center', padding: 20}}>
          <Thumbnail
            circle
            source={{
              uri: profile,
            }}
            style={styles.profileIcon}
          />
          <Text style={styles.customerName}>{customerName}</Text>
        </View>
        <FlatList
          data={ITEMS}
          renderItem={renderBarItems}
          extraData={userType}
        />
      </Content>
      <Footer style={styles.footer}>
        <Text style={{fontSize: 10, fontFamily: 'Raleway-Light'}}>
          Copyright © 2020
        </Text>
      </Footer>
    </Container>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: hp('100%'),
  },
  profileIcon: {
    backgroundColor: 'grey',
    width: wp('50%'),
    height: wp('50%'),
    borderRadius: wp('25%'),
  },
  customerName: {
    fontSize: 14,
    color: '#26A8D7',
    fontFamily: 'Raleway-Medium',
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'Raleway-Light',
    color: 'black',
    marginLeft: 5,
  },
  itemIcon: {
    width: 20,
    height: 20,
    marginVertical: 5,
    resizeMode: 'contain',
  },
  footer: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
