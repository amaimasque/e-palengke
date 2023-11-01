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
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    RatingsReview.getRatingsByItemID(data.id, (items) => {
      setRatings(items);
    });
    RatingsReview.getReviewsByItemID(data.id, (items) => {
      setReviews(items);
    });
  };

  const renderReview = ({item}) => {
    let {
      id,
      item_id,
      seller_id,
      buyer_id,
      buyer_first_name,
      buyer_last_name,
      buyer_avatar,
      date,
      review,
    } = item;
    return (
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
          source={buyer_avatar === '' ? USER : {uri: buyer_avatar}}
          style={{
            width: wp('20%'),
            height: wp('20%'),
            borderRadius: wp('10%'),
            backgroundColor: '#C1BFBF',
          }}
        />
        <View style={{width: wp('60%'), marginLeft: wp('2%')}}>
          <Text style={[styles.boldTexxtStyle, {fontSize: 14}]}>
            {buyer_first_name} {buyer_last_name}
          </Text>
          <Text style={[styles.textStyle, {fontSize: 14}]}>{review}</Text>
          <Text style={[styles.textStyle, {fontSize: 10}]}>
            {DateHelper.getDate(date, null, 'MMMM D, YYYY h:mm A')}
          </Text>
        </View>
      </View>
    );
  };

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
                      <Text style={[styles.textStyle, {color: '#085DAD'}]}>
                        Delivery Information
                      </Text>
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
                RATINGS & REVIEWS
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: wp('5%'),
                }}>
                <Text
                  style={[
                    styles.boldTexxtStyle,
                    {color: '#F0C30D', fontSize: 30},
                  ]}>
                  {ratings.length === 0
                    ? 0
                    : ratings.length === 1
                    ? ratings[0].rating
                    : ratings.reduce((a, b) => a.rating + b.rating, 0) /
                      ratings.length}
                  /5
                </Text>
                <Text style={[styles.textStyle, {color: '#00ACEA'}]}>
                  {ratings.length} users
                </Text>
              </View>
              <AirbnbRating
                defaultRating={
                  ratings.length === 0
                    ? 0
                    : ratings.length === 1
                    ? ratings[0].rating
                    : ratings.reduce((a, b) => a.rating + b.rating, 0) /
                      ratings.length
                }
                showRating={false}
                isDisabled={true}
              />
              <FlatList
                data={reviews}
                renderItem={renderReview}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Thumbnail
                      source={RATING}
                      large
                      square
                      style={styles.emptyIcon}
                    />
                    <Text style={[styles.textStyle, {color: '#00ACEA'}]}>
                      NO REVIEWS
                    </Text>
                  </View>
                )}
                style={{marginTop: hp('2%')}}
              />
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
