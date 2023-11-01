import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Icon, Picker, Item, Input, DatePicker, Toast} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import Database from 'modules/Database';
import Constants from 'modules/Constants';

const USER = require('assets/images/user.png');
const PASSWORD = require('assets/images/lock.png');
const EMAIL = require('assets/images/email.png');
const DATE = require('assets/images/calendar.png');
const TYPE = require('assets/images/account_type.png');

export default function Login(props) {
  const [firstName, setFirstName] = React.useState('buyer');
  const [lastName, setLastName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [birthdate, setBirthdate] = React.useState('');
  const [accountType, setaccountType] = React.useState('seller');

  React.useEffect(() => {
    props.handleRegistrationData({
      account_type: accountType,
      first_name: firstName,
      last_name: lastName,
      password,
      email_address: email,
      birthdate: birthdate.toString(),
    });
  }, [firstName, lastName, password, email, birthdate, accountType]);

  const showToast = (text) => {
    Toast.show({
      text,
      buttonText: 'OK',
    });
  };

  return (
    <View style={{marginBottom: 20}}>
      <Item>
        <Image source={USER} style={styles.inputIcon} />
        <Input
          placeholder="First Name"
          style={styles.inputText}
          onChangeText={(Value) => setFirstName(Value)}
        />
      </Item>
      <Item>
        <Image source={USER} style={styles.inputIcon} />
        <Input
          placeholder="Last Name"
          style={styles.inputText}
          onChangeText={(value) => setLastName(value)}
        />
      </Item>
      <Item>
        <Image source={DATE} style={styles.inputIcon} />
        <DatePicker
          defaultDate={new Date()}
          maximumDate={new Date()}
          locale={'en'}
          timeZoneOffsetInMinutes={undefined}
          modalTransparent={false}
          animationType={'fade'}
          androidMode={'default'}
          placeHolderText="Birthdate"
          textStyle={styles.inputText}
          placeHolderTextStyle={styles.inputText}
          onDateChange={(date) => setBirthdate(date)}
          disabled={false}
        />
      </Item>
      <Item>
        <Image source={EMAIL} style={styles.inputIcon} />
        <Input
          value={email}
          keyboardType="email-address"
          placeholder="Email address"
          style={styles.inputText}
          onChangeText={(Value) => setEmail(Value)}
          onEndEditing={async () => {
            !Constants.REGEX.email.test(email) &&
              showToast('Invalid email address format!');
            Database.checkUserExist((data) => {
              if (data !== null) {
                setEmail('');
                showToast('Email is already registered!');
              }
            }, email);
          }}
        />
      </Item>
      <Item>
        <Image source={PASSWORD} style={styles.inputIcon} />
        <Input
          placeholder="Password"
          style={styles.inputText}
          onChangeText={(value) => setPassword(value)}
          secureTextEntry={true}
          onEndEditing={() => {
            password.length < 8 &&
              showToast('Password must be at least 8 characters!');
          }}
        />
      </Item>
      <Item>
        <Image source={TYPE} style={styles.inputIcon} />
        <Picker
          mode="dropdown"
          iosHeader="Select your account type"
          iosIcon={<Icon name="arrow-down" />}
          style={{ width: undefined }}
          selectedValue={accountType}
          onValueChange={(value) => setaccountType(value)}>
          <Picker.Item label="Seller" value="seller" />
          <Picker.Item label="Buyer" value="buyer" />
        </Picker>
      </Item>
    </View>
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
    height: hp('100%'),
    width: wp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#025DAF',
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
