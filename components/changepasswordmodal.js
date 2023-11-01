import React, {useState} from 'react';
import {Modal, View, StatusBar, Image, StyleSheet, Alert} from 'react-native';
import {Card, Item, Input, Text, Button, Toast, Label} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function ChangePassword(props) {
  const [password, setPassword] = useState('');
	const [reTypedPassword, setreTypedPassword] = useState('');
	const [oldpassword, setoldpassword] = useState('');
	let {visible, onPressContinue, onDismiss, oldPassword} = props,
    isContinueButtonDisabled =
      password !== reTypedPassword || oldPassword !== oldpassword;

  const showToast = (text) => {
    Toast.show({
      text,
      buttonText: 'OK',
    });
  };

  const handleContinue = () => {
    onPressContinue(password);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
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
            Change password
          </Text>
          <Item fixedLabel>
            <Label style={styles.textStyle}>New password</Label>
            <Input
              style={styles.inputText}
              onChangeText={(value) => setPassword(value)}
              secureTextEntry={true}
              onEndEditing={() => {
                password.length < 8 &&
                  showToast('Password must be at least 8 characters!');
              }}
            />
          </Item>
          <Item fixedLabel>
            <Label style={styles.textStyle}>Re-type password</Label>
            <Input
              style={styles.inputText}
              onChangeText={(value) => setreTypedPassword(value)}
              secureTextEntry={true}
              onEndEditing={() => {
                password !== reTypedPassword &&
                  showToast('Password does not match!');
              }}
            />
          </Item>
					<Item fixedLabel>
            <Label style={styles.textStyle}>Old password</Label>
            <Input
              style={styles.inputText}
              onChangeText={(value) => setoldpassword(value)}
              secureTextEntry={true}
              onEndEditing={() => {
                oldPassword !== oldpassword &&
                  showToast('The old password you have entered is incorrect');
              }}
            />
          </Item>
          <Button
            full
            disabled={isContinueButtonDisabled}
            style={{marginTop: 20, backgroundColor: isContinueButtonDisabled ? '#ADB6B5' : '#31C3E7'}}
            onPress={handleContinue}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </Button>
          <Button
            full
            style={{marginTop: 20, backgroundColor: '#8CC739'}}
            onPress={onDismiss}>
            <Text style={styles.buttonText}>CANCEL</Text>
          </Button>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 15,
    fontWeight: '600',
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
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
    fontSize: 14,
  },
});
