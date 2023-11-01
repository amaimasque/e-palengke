import React from 'react';
import {FlatList, StyleSheet, ScrollView, Alert} from 'react-native';
import {Container, Button, Text, Content, Thumbnail} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import * as RootNavigation from 'modules/RootNavigation';
import AsyncHelper from 'modules/AsyncHelper';
import Database from 'modules/Database';
import CustomHeader from 'components/headers/sellerheader';

const ITEMS = [
  {
    title: 'items',
    navigationTitle: 'Items',
    icon: require('assets/images/items.png'),
  },
  {
    title: 'requests',
    navigationTitle: 'Requests',
    icon: require('assets/images/requests.png'),
  },
  {
    title: 'transaction_history',
    navigationTitle: 'TransactionHistory',
    icon: require('assets/images/transaction.png'),
  },
  {
    title: 'messages',
    navigationTitle: 'Messages',
    icon: require('assets/images/messages.png'),
  },
  {
    title: 'account_settings',
    navigationTitle: 'AccountSettings',
    icon: require('assets/images/settings.png'),
  },
  {
    title: 'logout',
    icon: require('assets/images/logout.png'),
  },
];

export default function Home(props) {
  const renderHomeItems = ({item, index}) => {
    let {title, icon, navigationTitle} = item;
    return (
      <Button
        bordered
        style={styles.itemButton}
        onPress={() => title === 'logout' ? handleLogout() : props.navigation.navigate(navigationTitle)}>
        <Thumbnail square large source={icon} />
        <Text
          style={[
            styles.buttonText,
            {fontSize: index === 2 || index === 4 ? 11 : 15},
          ]}>
          {title.replace('_', ' ').toUpperCase()}
        </Text>
      </Button>
    );
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

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.mainContainer}>
          <FlatList data={ITEMS} renderItem={renderHomeItems} numColumns={2} />
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'Raleway-Light',
    color: '#26A8D7',
    textAlign: 'center',
  },
  itemButton: {
    flexDirection: 'column',
    height: hp('20%'),
    width: wp('40%'),
    margin: 5,
    justifyContent: 'center',
    padding: 5,
  },
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: hp('13%'),
  },
});
