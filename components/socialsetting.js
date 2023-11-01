import React, {useState} from 'react';
import {Modal, View, StatusBar, Image, StyleSheet, Alert} from 'react-native';
import {
  Card,
  Item,
  Picker,
  DatePicker,
  Icon,
  Input,
  Text,
  Button,
  Toast,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const PASSWORD = require('assets/images/lock.png');
const DATE = require('assets/images/calendar.png');
const TYPE = require('assets/images/account_type.png');

export default function SocialSetupModal(props) {
  // const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [accountType, setaccountType] = useState('seller');
  let {visible, onPressContinue} = props;

  const showToast = (text) => {
    Toast.show({
      text,
      buttonText: 'OK',
    });
  };

  const handleContinue = () => {
    let data = {
      account_type: accountType,
      birthdate,
      // password,
    };
    if (Object.values(data).some((item) => item === '')) {
      return Alert.alert('Error', 'Please fill up all fields!');
    }
    onPressContinue(data);
  };

  let isButtonDisabled = birthdate === '';

  return (
    <Modal
      visible={visible}
      onDismiss={() => {}}
      transparent={true}
      style={{
        height: hp('100%') - StatusBar.currentHeight,
        width: wp('100%'),
      }}>
      <View
        style={{
          height: hp('100%') - StatusBar.currentHeight,
          width: wp('100%'),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <Card style={{width: wp('80%'), padding: wp('5%')}}>
          <Text
            style={[
              styles.buttonText,
              {textAlign: 'center', paddingHorizontal: 30},
            ]}>
            Finish setting up your account
          </Text>
          <Item>
            <Image source={TYPE} style={styles.inputIcon} />
            <Picker
              mode="dropdown"
              iosHeader="Select your account type"
              iosIcon={<Icon name="arrow-down" />}
              style={{width: undefined}}
              selectedValue={accountType}
              onValueChange={(value) => setaccountType(value)}>
              <Picker.Item label="Seller" value="seller" />
              <Picker.Item label="Buyer" value="buyer" />
            </Picker>
          </Item>
          <Item style={{paddingVertical: 5}}>
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
          {/* <Item>
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
          </Item> */}
          <Button
            disabled={isButtonDisabled}
            full
            style={{marginTop: 20, backgroundColor: isButtonDisabled ? '#ADB6B5' : '#085DAD'}}
            onPress={handleContinue}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </Button>
        </Card>
      </View>
    </Modal>
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
