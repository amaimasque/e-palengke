import React, {useEffect, useState} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {Button, Header, Left, Right, Item, Input, Thumbnail} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import AsyncHelper from 'modules/AsyncHelper';
import Database from 'modules/Database';

const ADD = require('assets/images/add.png');
const MENU = require('assets/images/menu.png');
const LOGO = require('assets/images/logo_text.png');
const PRODUCT = require('assets/images/product.png');
const CLOSE = require('assets/images/close.png');

export default function SellerHeader(props) {
  const [usertype, setUserType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isSearchbarVisible, setIsSearchbarVisible] = useState(false);

  useEffect(() => {
    usertype === '' && getUserType();
  }, []);

  const fetchUserInfo = async () => {
    try {
      let id = await AsyncHelper.getItem('USER_ID');
      if (id) {
        await Database.getUserInfo(id, async (data) => {
          if (data) {
            console.warn(data.shop_name)
            data.shop_name !== ''
              ? props.navigation.navigate('AddItem')
              : Alert.alert(
                  'Shop Setup',
                  'Please setup your shop name first in the account settings. Add your Paymaya and/or Gcash number to enable online transactions.',
                );
          }
        });
      }
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  const getUserType = async () => {
    let type = await AsyncHelper.getItem('ACCOUNT_TYPE');
    console.warn('User type', type);
    type !== null && setUserType(type);
  };

  return (
    <Header style={{backgroundColor: 'white'}}>
      <Left style={{flexDirection: 'row'}}>
        <Button transparent onPress={() => props.navigation.toggleDrawer()}>
          <Thumbnail square small source={MENU} style={styles.headerButton} />
        </Button>
        {isSearchbarVisible && (
          <Item
            style={{position: 'absolute', backgroundColor: 'white', zIndex: 2}}>
            <Input
              placeholder="Search here..."
              style={styles.inputText}
              onChangeText={(Value) => setKeyword(Value)}
              style={[styles.textStyle, {width: wp('85%')}]}
              onEndEditing={() =>
                props.navigation.navigate('SearchItem', {keyword})
              }
            />
            <Button
              onPress={() => setIsSearchbarVisible(false)}
              transparent
              style={{paddingHorizontal: 10}}>
              <Thumbnail
                square
                small
                source={CLOSE}
                style={styles.closeButton}
              />
            </Button>
          </Item>
        )}
        {usertype === 'buyer' ? (
          <Button transparent onPress={() => setIsSearchbarVisible(true)}>
            <Thumbnail
              square
              small
              source={PRODUCT}
              style={styles.headerButton}
            />
          </Button>
        ) : (
          <Button transparent onPress={fetchUserInfo}>
            <Thumbnail square small source={ADD} style={styles.headerButton} />
          </Button>
        )}
      </Left>
      <Right>
        <Thumbnail square source={LOGO} style={styles.logo} />
      </Right>
    </Header>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    height: hp('3%'),
    width: wp('5%'),
    resizeMode: 'contain',
  },
  headerButton: {
    height: hp('4%'),
    width: wp('7%'),
    resizeMode: 'contain',
  },
  logo: {
    width: wp('40%'),
    height: hp('5%'),
    resizeMode: 'contain',
    alignSelf: 'flex-end',
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
    fontSize: 14,
  },
});
