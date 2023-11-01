import React, {useState} from 'react';
import {
  Modal,
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {Text, Button, Input, Item, Label} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function PasswordResetModal(props) {
  let {visible, onDismiss, onSubmit} = props;
  const [emailAddress, setEmailAddress] = useState('');

  function handleSubmit() {
		onSubmit(emailAddress);
		onDismiss();
	}

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onDismiss}
      transparent={true}
      style={styles.modalStyle}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.modalContent}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={[
                styles.textStyle,
                {color: '#31C3E7', marginVertical: hp('2%'), textAlign: 'center'},
              ]}>
              PASSWORD RESET
            </Text>
            <View>
              <Item fixedLabel>
                <Label style={[styles.textStyle]}>Email address</Label>
                <Input
                  placeholder="***@***.***"
                  style={[styles.textStyle, {width: wp('50%')}]}
                  onChangeText={(value) => setEmailAddress(value)}
                  value={emailAddress}
                />
              </Item>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: hp('2%'),
                }}>
                <Button
                  onPress={onDismiss}
                  small
                  block
                  style={{backgroundColor: '#AAE556', width: '47%'}}>
                  <Text style={[styles.textStyle, {color: 'white'}]}>
                    CANCEL
                  </Text>
                </Button>
                <Button
                  onPress={handleSubmit}
                  small
                  block
                  style={{
                    backgroundColor:
                      emailAddress === '' ? '#BDC3C7' : '#31C3E7',
                    width: '47%',
                  }}>
                  <Text style={[styles.textStyle, {color: 'white'}]}>
                    SUBMIT
                  </Text>
                </Button>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalStyle: {
    height: hp('100%') - StatusBar.currentHeight,
    width: wp('100%'),
  },
  modalContent: {
    height: hp('100%') - StatusBar.currentHeight,
    width: wp('100%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: wp('95%'),
    backgroundColor: 'white',
    padding: wp('5%'),
    marginVertical: wp('2.5%'),
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    height: wp('9%'),
    padding: wp('2%'),
    // right: wp('4%'),
    // top: wp('2%'),
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
  },
  boldTextStyle: {
    fontFamily: 'Raleway-Medium',
    color: 'black',
  },
  priceSummary: {
    color: '#3077BA',
    fontSize: 20,
    marginVertical: hp('2%'),
    textAlign: 'center',
  },
  saveButton: {
    width: wp('85%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginVertical: hp('2%'),
  },
  emptyIcon: {
    width: wp('30%'),
    height: wp('30%'),
    resizeMode: 'contain',
  },
});
