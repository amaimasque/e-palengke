import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Text,
  Button,
  Thumbnail,
  Form,
  Item,
  Picker,
  Icon,
  Label,
  Input,
  DatePicker,
  Content,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import RNFetchBlob from 'rn-fetch-blob';
var RNFS = require('react-native-fs');

import Database from 'modules/Database';
import StringHelper from 'modules/StringHelper';
import TermsModal from './termsmodal';

const CLOSE = require('assets/images/close.png');
const INFO = require('assets/images/information.png');
const CHECK = require('assets/images/tick.png');

export default function PaymentModal(props) {
  const [selectedPayment, setPayment] = useState('key0');
  const [referenceNumber, setreferenceNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [isTermsModalVisible, setTermsModalVisibility] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  let {visible, onDismiss, onPressSend, onPressBack, data, orderData} = props;

  let isButtonDisabled =
    selectedPayment === 'key0' ||
    selectedPayment !== 'cash' ||
    (selectedPayment === 'paymaya' || selectedPayment === 'gcash'
      ? referenceNumber === '' || transactionDate === ''
      : false);

  useEffect(() => {}, []);

  useEffect(() => {
    Database.getPublicProfile(data.seller_id, (info) => {
      setSellerInfo(info);
    });
  }, []);

  const handleSendRequest = () => {
    onPressSend({
      selectedPayment,
      referenceNumber,
      transactionDate,
      totalPrice:
        orderData?.total_price +
        (orderData.is_delivery ? parseInt(data.delivery_fee) : 0),
    });
  };

  const handleDownload = async () => {
    let url = await Database.getDownloadURL('ep_terms_and_policies.pdf');
    if (url) {
      let downloadDest = `${RNFS.ExternalStorageDirectoryPath}/Download/ep_terms_policy.pdf`;
      RNFetchBlob.config({
        addAndroidDownloads: {
          notification: true,
          title: 'ep_terms_policy.pdf',
          description: 'Terms and policy for e-Palengke app.',
          mime: 'application/pdf',
          useDownloadManager: true,
          path: downloadDest,
        },
      })
        .fetch('GET', url)
        .then((res) => {
          Alert.alert(
            'Success',
            'Terms and policy document successfully downloaded! Please preview before buying an item.',
          );
          RNFetchBlob.android.actionViewIntent(res.path(), '/');
        })
        .catch((e) => {
          Alert.alert(
            'Error',
            'File cannot be downloaded! Please contact adminstrator.',
          );
          console.warn(e.message);
        });
    }
  };

  let totalPrice =
    orderData?.total_price +
    (orderData.is_delivery ? parseInt(data.delivery_fee) : 0);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onDismiss}
      transparent={true}
      style={styles.modalStyle}>
      {isTermsModalVisible && (
        <TermsModal
          visible={isTermsModalVisible}
          onDismiss={() => setTermsModalVisibility(false)}
        />
      )}
      <View style={styles.modalContent}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Button onPress={onDismiss} transparent style={styles.closeButton}>
              <Thumbnail
                source={CLOSE}
                small
                square
                style={{height: wp('5%'), width: wp('5%')}}
              />
            </Button>
            <TouchableOpacity onPress={onPressBack}>
              <Text style={[styles.textStyle, {marginVertical: hp('1%')}]}>
                {'< Back'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.textStyle, styles.priceSummary]}>
              P {totalPrice} ({orderData?.total_items} {orderData?.measurement})
            </Text>
            {orderData.is_delivery && (
              <Text
                style={[
                  styles.textStyle,
                  {fontSize: 13, textAlign: 'center', marginBottom: hp('1%')},
                ]}>
                *Added P {data.delivery_fee} for delivery charge
              </Text>
            )}
            <Form>
              <Label style={[styles.textStyle, {fontSize: 13}]}>
                Pay Through
              </Label>
              <Item picker>
                <Picker
                  mode="dropdown"
                  iosIcon={<Icon name="arrow-down" />}
                  style={{width: undefined}}
                  placeholder="Select from list"
                  placeholderStyle={{color: '#bfc6ea'}}
                  placeholderIconColor="#007aff"
                  selectedValue={selectedPayment}
                  onValueChange={(value) => {
                    value === 'cash' ||
                    data?.tags.includes(StringHelper.toProperCase(value))
                      ? setPayment(value)
                      : Alert.alert(
                          'Error',
                          'Option unavailable! Seller has disabled this payment option.',
                        );
                  }}>
                  <Picker.Item label="Select from list" value="key0" />
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="Gcash" value="gcash" />
                  <Picker.Item label="Paymaya" value="paymaya" />
                </Picker>
              </Item>
            </Form>
            {selectedPayment === 'cash' ? (
              <View style={{flexDirection: 'row', marginTop: hp('3%')}}>
                <Image source={INFO} style={{width: 20, height: 20}} />
                <Text
                  style={[
                    styles.textStyle,
                    {marginLeft: wp('5%'), fontSize: 15},
                  ]}>
                  Please pay exact amount.
                </Text>
              </View>
            ) : (
              sellerInfo !== null &&
              selectedPayment !== 'key0' && (
                <View>
                  <View style={{flexDirection: 'row', marginTop: hp('3%')}}>
                    <Image source={INFO} style={{width: 20, height: 20}} />
                    <Text
                      style={[
                        styles.textStyle,
                        {marginLeft: wp('5%'), fontSize: 15},
                      ]}>
                      Please transfer exact amount in your {selectedPayment}{' '}
                      account to seller's account. Input the reference no. and
                      transaction date for seller's validation.
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.textStyle,
                      {fontSize: 30, textAlign: 'center'},
                    ]}>
                    {StringHelper.toProperCase(selectedPayment)}
                  </Text>
                  <Text
                    style={[
                      styles.textStyle,
                      {fontSize: 15, textAlign: 'center'},
                    ]}>
                    Selected Platform
                  </Text>
                  <Text
                    style={[
                      styles.textStyle,
                      {fontSize: 30, textAlign: 'center'},
                    ]}>
                    {sellerInfo[`${selectedPayment}_number`]}
                  </Text>
                  <Text
                    style={[
                      styles.textStyle,
                      {fontSize: 15, textAlign: 'center'},
                    ]}>
                    {StringHelper.toProperCase(selectedPayment)} Number
                  </Text>
                  <Item stackedLabel>
                    <Label style={[styles.textStyle, {fontSize: 13}]}>
                      Reference Number
                    </Label>
                    <Input
                      onChangeText={(value) => setreferenceNumber(value)}
                      style={[styles.textStyle, {paddingVertical: 5}]}
                    />
                  </Item>
                  <Item stackedLabel>
                    <Label style={[styles.textStyle, {fontSize: 13}]}>
                      Transaction Date
                    </Label>
                    <DatePicker
                      defaultDate={new Date()}
                      minimumDate={new Date()}
                      locale={'en'}
                      timeZoneOffsetInMinutes={undefined}
                      modalTransparent={false}
                      animationType={'fade'}
                      androidMode={'default'}
                      textStyle={styles.textStyle}
                      placeHolderTextStyle={styles.textStyle}
                      onDateChange={(date) => setTransactionDate(date)}
                    />
                  </Item>
                </View>
              )
            )}
            <View style={{flexDirection: 'row', marginTop: hp('3%')}}>
              <Image source={CHECK} style={{width: 20, height: 20}} />
              <Text
                style={[
                  styles.textStyle,
                  {marginLeft: wp('5%'), fontSize: 15},
                ]}>
                Upon proceeding, you agree to the terms and condition
              </Text>
            </View>
            <Button
              rounded
              style={[styles.saveButton, {marginTop: hp('5%'), backgroundColor: '#085DAD'}]}
              onPress={() => setTermsModalVisibility(true)}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: 'white',
                }}>View Terms & Policy</Text>
            </Button>
            <Button
              rounded
              style={[
                styles.saveButton,
                {backgroundColor: '#31C3E7', marginTop: hp('2%')},
              ]}
              onPress={handleDownload}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: 'white',
                }}>
                Download Terms & Policy
              </Text>
            </Button>
            <Button
              disabled={isButtonDisabled}
              rounded
              style={[
                styles.saveButton,
                {
                  backgroundColor: isButtonDisabled ? '#ADB6B5' : '#AAE556',
                  marginVertical: hp('2%'),
                },
              ]}
              onPress={handleSendRequest}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: isButtonDisabled ? 'black' : 'white',
                }}>
                Send request
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: wp('100%'),
    backgroundColor: 'white',
    padding: wp('5%'),
  },
  closeButton: {
    position: 'absolute',
    right: wp('4%'),
    top: wp('4%'),
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
  },
  priceSummary: {
    color: '#3077BA',
    fontSize: 20,
    marginTop: hp('2%'),
    textAlign: 'center',
  },
  saveButton: {
    width: wp('90%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
