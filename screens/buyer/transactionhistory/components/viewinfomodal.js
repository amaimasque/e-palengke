import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Text,
  Button,
  Thumbnail,
  Card,
  CardItem,
  Body,
  Input,
  Item,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Rating, AirbnbRating} from 'react-native-ratings';

import DateHelper from 'modules/DateHelper';
import StringHelper from 'modules/StringHelper';
import AsyncHelper from 'modules/AsyncHelper';
import RatingsReview from 'modules/RatingsReview';

const CLOSE = require('assets/images/close.png');
const RATING = require('assets/images/rating.png');
const USER = require('assets/images/user_icon.png');
const MESSAGE = require('assets/images/messages.png');

export default function RatingsModal(props) {
  let {visible, onDismiss, data} = props;
  const [ratingData, setRatingData] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isReviewInputVisible, setReviewInputVisibility] = useState(false);
  const [didUserReviewed, setIfUserReviewed] = useState(false);
  const [reviewInput, setReviewInput] = useState('');
  const [ratingInput, setRatingInput] = useState(0);

  // alert(JSON.stringify(data, null, '\t'));

  function ratingCompleted(rating) {
    setRatingInput(rating);
  }

  useEffect(() => {
    fetchRating();
  }, []);

  const fetchRating = async () => {
    let userId = await AsyncHelper.getItem('USER_ID');
    await RatingsReview.getRatingByItemAndUserID(
      data.id,
      userId,
      (ratingData) => {
        // alert(JSON.stringify(ratingData, null, '\t'));
        setRatingData(ratingData);
        ratingData !== null && setRatingInput(ratingData.rating);
      },
    );
    await RatingsReview.getReviewByItemAndUserID(
      data.id,
      userId,
      (reviewData) => {
        // alert(JSON.stringify(reviewData, null, '\t'));
        setReviewData(reviewData);
        reviewData !== null && setReviewInput(reviewData.review);
      },
    );
  };

  async function handleSubmit() {
    // alert(ratingInput + reviewInput)
    let {id, seller_id} = data;
    let userId = await AsyncHelper.getItem('USER_ID');
    let userInfo = JSON.parse(await AsyncHelper.getItem('USER_INFO'));
    let userAvatar = await AsyncHelper.getItem('PROFILE_URL');
    let dt = {
      item_id: id,
      seller_id,
      buyer_id: userId,
      buyer_first_name: userInfo.first_name,
      buyer_last_name: userInfo.last_name,
      buyer_avatar: userAvatar,
    };
    await RatingsReview.addRating({...dt, rating: ratingInput});
    await RatingsReview.addReview({...dt, review: reviewInput});
    onDismiss();
  }

  async function handleSave() {
    await RatingsReview.updateRatingByID(ratingData.id, {rating: ratingInput});
    await RatingsReview.updateReviewByID(reviewData.id, {review: reviewInput});
    fetchRating();
    setReviewInputVisibility(false);
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
            <Button onPress={onDismiss} transparent style={styles.closeButton}>
              <Thumbnail
                source={CLOSE}
                small
                square
                style={{height: wp('5%'), width: wp('5%')}}
              />
            </Button>
            <View>
              <Text
                style={[
                  styles.textStyle,
                  {color: '#31C3E7', marginTop: hp('4%')},
                ]}>
                ORDER INFORMATION
              </Text>
              <Card>
                <CardItem>
                  <Body>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Order:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {data?.total_items} {data?.measurement} of{' '}
                        {data?.item_name}
                      </Text>
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Price:{' '}
                      </Text>
                      <Text style={styles.textStyle}>{data?.total_price}</Text>
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Payment method:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {StringHelper.toProperCase(data?.payment_method)}
                      </Text>
                    </Text>
                    {data?.notes !== '' && (
                      <Text>
                        <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                          Notes:{' '}
                        </Text>
                        <Text style={styles.textStyle}>{data?.notes}</Text>
                      </Text>
                    )}
                  </Body>
                </CardItem>
              </Card>
              {data?.payment_method !== 'cash' && (
                <View>
                  <Text
                    style={[
                      styles.textStyle,
                      {color: '#31C3E7', marginTop: hp('2%')},
                    ]}>
                    PAYMENT INFORMATION
                  </Text>
                  <Card>
                    <CardItem>
                      <Body>
                        <Text>
                          <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                            Payment method:{' '}
                          </Text>
                          <Text style={styles.textStyle}>
                            {StringHelper.toProperCase(data?.payment_method)}
                          </Text>
                        </Text>
                        <Text>
                          <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                            Reference number:{' '}
                          </Text>
                          <Text style={styles.textStyle}>
                            {data.reference_number}
                          </Text>
                        </Text>
                        <Text>
                          <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                            Transaction date:{' '}
                          </Text>
                          <Text style={styles.textStyle}>
                            {StringHelper.formatDate(
                              data.transaction_date,
                              'MMMM D, YYYY',
                            )}
                          </Text>
                        </Text>
                      </Body>
                    </CardItem>
                  </Card>
                </View>
              )}
              {data.is_delivery && (
                <Text
                  style={[
                    styles.textStyle,
                    {color: '#31C3E7', marginTop: hp('2%')},
                  ]}>
                  DELIVERY INFORMATION
                </Text>
              )}
              {data.is_delivery && (
                <Card>
                  <CardItem>
                    <Body>
                      <Text>
                        <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                          Address:{' '}
                        </Text>
                        <Text style={styles.textStyle}>
                          {data?.delivery_address}
                        </Text>
                      </Text>
                    </Body>
                  </CardItem>
                </Card>
              )}
              <Text
                  style={[
                    styles.textStyle,
                    {color: '#31C3E7', marginTop: hp('2%')},
                  ]}>
                  REVIEW
                </Text>
              {isReviewInputVisible ? (
                <View>
                  <Rating
                    showRating
                    onFinishRating={ratingCompleted}
                    style={{paddingVertical: 10}}
                    minValue={1}
                    startingValue={ratingInput}
                  />
                  <Item regular>
                    <Input
                      multiline={true}
                      placeholder="Please input here..."
                      style={[
                        styles.textStyle,
                        {height: 150, textAlignVertical: 'top'},
                      ]}
                      onChangeText={(value) => setReviewInput(value)}
                      value={reviewInput}
                    />
                  </Item>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: hp('2%'),
                    }}>
                    <Button
                      onPress={() => setReviewInputVisibility(false)}
                      small
                      block
                      style={{backgroundColor: '#AAE556', width: '47%'}}>
                      <Text style={[styles.textStyle, {color: 'white'}]}>
                        CANCEL
                      </Text>
                    </Button>
                    <Button
                      onPress={
                        ratingData !== null && ratingData !== null
                          ? handleSave
                          : handleSubmit
                      }
                      small
                      block
                      style={{
                        backgroundColor:
                          ratingInput === 0 || reviewInput === ''
                            ? '#BDC3C7'
                            : '#31C3E7',
                        width: '47%',
                      }}>
                      <Text style={[styles.textStyle, {color: 'white'}]}>
                        SUBMIT
                      </Text>
                    </Button>
                  </View>
                </View>
              ) : reviewData !== null && (
                <View
                  style={[
                    {
                      padding: wp('2%'),
                      flexDirection: 'row',
                      borderBottomColor: '#E8E8E8',
                      borderBottomWidth: 1,
                    },
                  ]}>
                  <Image
                    source={
                      reviewData?.buyer_avatar === ''
                        ? USER
                        : {uri: reviewData?.buyer_avatar}
                    }
                    style={{
                      width: wp('20%'),
                      height: wp('20%'),
                      borderRadius: wp('10%'),
                      backgroundColor: '#C1BFBF',
                    }}
                  />
                  <View style={{width: wp('60%'), marginLeft: wp('2%')}}>
                    <Text style={[styles.boldTextStyle, {fontSize: 14}]}>
                      {reviewData?.buyer_first_name}{' '}
                      {reviewData?.buyer_last_name}
                    </Text>
                    <Text style={[styles.textStyle, {fontSize: 14}]}>
                      {reviewData?.review}
                    </Text>
                    <Text style={[styles.textStyle, {fontSize: 10}]}>
                      {DateHelper.getDate(
                        reviewData?.date,
                        null,
                        'MMMM D, YYYY h:mm A',
                      )}
                    </Text>
                  </View>
                </View>
              )}
              {ratingData === null &&
                reviewData === null &&
                !isReviewInputVisible && (
                  <View style={{marginVertical: hp('2%')}}>
                    <Thumbnail
                      source={RATING}
                      large
                      square
                      style={[styles.emptyIcon, {alignSelf: 'center'}]}
                    />
                  </View>
                )}
              <Button
                rounded
                style={[
                  styles.saveButton,
                  {
                    // backgroundColor: isReviewInputVisible ? '#BDC3C7' : '#31C3E7',
                    backgroundColor: '#31C3E7',
                    marginTop: hp('2%'),
                    display: isReviewInputVisible ? 'none' : 'flex',
                  },
                ]}
                onPress={() => setReviewInputVisibility(true)}>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: 'white',
                  }}>
                  {ratingData !== null && ratingData !== null
                    ? 'EDIT'
                    : 'ADD'}{' '}
                  RATING & REVIEW
                </Text>
              </Button>
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
