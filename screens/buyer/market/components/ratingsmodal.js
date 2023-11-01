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
import {Text, Button, Thumbnail, Item, Input, Icon} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Rating, AirbnbRating} from 'react-native-ratings';

import DateHelper from 'modules/DateHelper';
import AsyncHelper from 'modules/AsyncHelper';
import RatingsReview from 'modules/RatingsReview';

const CLOSE = require('assets/images/close.png');
const RATING = require('assets/images/rating.png');
const USER = require('assets/images/user_icon.png');

export default function RatingsModal(props) {
  let {visible, onDismiss, data} = props;
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isReviewInputVisible, setReviewInputVisibility] = useState(false);
  const [didUserReviewed, setIfUserReviewed] = useState(false);
  const [reviewInput, setReviewInput] = useState('');
  const [ratingInput, setRatingInput] = useState(0);

  // alert(JSON.stringify(data, null, '\t'))

  function ratingCompleted(rating) {
    setRatingInput(rating);
  }

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    let userId = await AsyncHelper.getItem('USER_ID');
    RatingsReview.getRatingsByItemID(data.id, (items) => {
      // alert(JSON.stringify(items));
      setRatings(items);
      let ratingIndex = items.findIndex((i) => i.buyer_id === userId && i.item_id === data.id);
      if (ratingIndex >= 0) {
        setIfUserReviewed(true);
        setRatingInput(items[ratingIndex].rating);
      }
    });
    RatingsReview.getReviewsByItemID(data.id, (items) => {
      // alert(JSON.stringify(items));
      setReviews(items);
      let reviewIndex = items.findIndex((i) => i.buyer_id === userId && i.item_id === data.id);
      if (reviewIndex >= 0) {
        setIfUserReviewed(true);
        setReviewInput(items[reviewIndex].review);
      }
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
    // alert(ratingInput + reviewInput)
    let userId = await AsyncHelper.getItem('USER_ID');
    let ratingData = ratings.find((i) => i.buyer_id === userId);
    await RatingsReview.updateRatingByID(ratingData.id, {rating: ratingInput});
    let reviewData = reviews.find((i) => i.buyer_id === userId);
    await RatingsReview.updateReviewByID(reviewData.id, {review: reviewInput});
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
            <Button onPress={onDismiss} transparent style={styles.closeButton}>
              <Thumbnail
                source={CLOSE}
                small
                square
                style={{height: wp('5%'), width: wp('5%')}}
              />
            </Button>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: hp('4%'),
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
              // starContainerStyle={{borderColor: '#F0C30D', borderWidth: 1}}\
            />
            {/* <Text
              style={[styles.textStyle, {fontSize: 13, textAlign: 'center'}]}>
              100 users
            </Text> */}
            <Button
              disabled={isReviewInputVisible}
              rounded
              style={[
                styles.saveButton,
                {
                  backgroundColor: isReviewInputVisible ? '#BDC3C7' : '#31C3E7',
                  marginTop: hp('2%'),
                },
              ]}
              onPress={() => setReviewInputVisibility(true)}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: 'white',
                }}>
                {didUserReviewed ? 'EDIT' : 'ADD'} RATING & REVIEW
              </Text>
            </Button>
            {!isReviewInputVisible ? (
              <FlatList
                data={reviews}
                renderItem={renderReview}
                ListHeaderComponent={() => (
                  <Text style={[styles.boldTexxtStyle, {fontSize: 18}]}>
                    Reviews ({reviews.length})
                  </Text>
                )}
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
            ) : didUserReviewed ? (
              <View style={{marginVertical: 20}}>
                {/* <Button
                  icon
                  transparent
                  light
                  style={{alignSelf: 'flex-end', position: 'absolute'}}>
                  <Icon name="trash" />
                </Button> */}
                <Rating
                  showRating
                  onFinishRating={ratingCompleted}
                  minValue={1}
                  startingValue={ratingInput}
                />
                <Item regular style={{marginVertical: 10}}>
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
                    onPress={handleSave}
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
                      SAVE
                    </Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View>
                <Rating
                  showRating
                  onFinishRating={ratingCompleted}
                  style={{paddingVertical: 10}}
                  minValue={1}
                  startingValue={1}
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
                    onPress={handleSubmit}
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
            )}
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
    // right: wp('4%'),
    // top: wp('2%'),
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
  },
  boldTexxtStyle: {
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
    height: hp('30%'),
  },
  emptyIcon: {
    width: wp('30%'),
    height: wp('30%'),
    resizeMode: 'contain',
  },
});
