/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-community/async-storage';
import {Root} from 'native-base';
import firebase from '@react-native-firebase/app';

//Screens
import Login from 'screens/login';
import AccountSettings from 'screens/accountsettings';
import ViewMessage from 'screens/viewmessage';
import Messages from 'screens/messages';

//Seller
import SellerHome from 'screens/seller/home';
import AddItem from 'screens/seller/items/additem';
import Items from 'screens/seller/items/items';
import ViewItem from 'screens/seller/items/viewitem';
import EditItem from 'screens/seller/items/edititem';
import TransactionHistory from 'screens/seller/transactionhistory';
import Requests from 'screens/seller/requests';
import ViewRequest from 'screens/seller/requests/viewrequest';

//Buyer
import Market from 'screens/buyer/market';
import BuyerRequests from 'screens/buyer/requests';
import BuyerViewRequest from 'screens/buyer/requests/viewrequest';
import MarketCategories from 'screens/buyer/market/viewcategories';
import MarketItems from 'screens/buyer/market/viewitems';
import MarketViewItem from 'screens/buyer/market/viewitem';
import SearchItem from 'screens/buyer/market/searchitem';
import BuyerTransactionHistory from 'screens/buyer/transactionhistory';

import SideNavigation from 'components/sidenav';
import {navigationRef} from 'modules/RootNavigation';

const theme = {
  // dark: boolean;
  // mode?: Mode;
  roundness: 50,
  colors: {
    primary: 'black',
    background: 'white',
    // surface: string;
    accent: '#FAE7DF',
    // error: string;
    text: 'black',
    // onSurface: string;
    // onBackground: string;
    headerAccent: '#DECEC7',
    // placeholder: string;
    backdrop: 'rgba(0,0,0,0.5)',
    // notification: string;
    accent1: '#F9F9F9',
    accent2: '#CECECE',
  },
  fonts: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    thin: 'Roboto-Thin',
  },
  animation: {
    scale: 2,
  },
};

const Seller = createDrawerNavigator();
const Buyer = createDrawerNavigator();

function SellerScreens() {
  return (
    <Seller.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <SideNavigation {...props} />}>
      <Seller.Screen name="Home" component={SellerHome} />
      <Seller.Screen name="AddItem" component={AddItem} />
      <Seller.Screen name="Items" component={Items} />
      <Seller.Screen name="ViewItem" component={ViewItem} />
      <Seller.Screen name="EditItem" component={EditItem} />
      <Seller.Screen name="TransactionHistory" component={TransactionHistory} />
      <Seller.Screen name="Requests" component={Requests} />
      <Seller.Screen name="ViewRequest" component={ViewRequest} />
      <Seller.Screen name="AccountSettings" component={AccountSettings} />
      <Seller.Screen name="ViewMessage" component={ViewMessage} />
      <Seller.Screen name="Messages" component={Messages} />
    </Seller.Navigator>
  );
}

function BuyerScreens() {
  return (
    <Buyer.Navigator
      initialRouteName="Market"
      drawerContent={(props) => <SideNavigation {...props} />}>
      <Buyer.Screen name={'Market'} component={Market} />
      <Buyer.Screen name="TransactionHistory" component={BuyerTransactionHistory} />
      <Buyer.Screen name="Requests" component={BuyerRequests} />
      <Buyer.Screen name="ViewRequest" component={BuyerViewRequest} />
      <Buyer.Screen name="AccountSettings" component={AccountSettings} />
      <Buyer.Screen name="MarketCategories" component={MarketCategories} />
      <Buyer.Screen name="MarketItems" component={MarketItems} />
      <Buyer.Screen name="ViewItem" component={MarketViewItem} />
      <Buyer.Screen name="SearchItem" component={SearchItem} />
      <Buyer.Screen name="ViewMessage" component={ViewMessage} />
      <Buyer.Screen name="Messages" component={Messages} />
    </Buyer.Navigator>
  );
}

function App() {
  const MainApp = createStackNavigator();

  useEffect(() => {
    // TODO: change with firebase credentials
    SplashScreen.hide();
    firebase.app() === null &&
      firebase.initializeApp({
        projectId: '',
        apiKey: '',
        storageBucket: '',
      });
  }, []);

  return (
    <Root>
      <NavigationContainer ref={navigationRef}>
        <MainApp.Navigator initialRouteName={'Login'} headerMode="none">
          <MainApp.Screen name="Login" component={Login} />
          <MainApp.Screen name="Seller" component={SellerScreens} />
          <MainApp.Screen name="Buyer" component={BuyerScreens} />
        </MainApp.Navigator>
      </NavigationContainer>
    </Root>
  );
}

export default App;
