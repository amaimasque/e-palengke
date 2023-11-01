import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  Container,
  Button,
  Text,
  Content,
  Thumbnail,
  Card,
  CardItem,
  DeckSwiper,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Table, TableWrapper, Row, Cell} from 'react-native-table-component';

import Market from 'modules/Market';
import Requests from 'modules/Requests';
import LoadingModal from 'components/loadingmodal';
import CustomHeader from 'components/headers/sellerheader';
import ImageViewer from './components/imageviewermodal';
import BuyModal from './components/buymodal';
import PaymentModal from './components/paymentmodal';
import RatingModal from './components/ratingsmodal';
import AsyncHelper from 'modules/AsyncHelper';

const BUY = require('assets/images/buy.png');
const VIEW = require('assets/images/eye.png');
const ADD = require('assets/images/add.png');
const INFO = require('assets/images/question.png');
const ITEM = require('assets/images/items.png');

const SELLER_HEADERS = ['Shop', 'Price', 'Qty Available', ''];

export default function ViewItem(props) {
  const _deckSwiper = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [sellersList, setSellersList] = useState([]);
  const [items, setItems] = useState([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [isViewerVisible, setViewerVisible] = useState(false);
  const [isBuyModalVisible, setBuyModalVisibility] = useState(false);
  const [isRatingModalVisible, setRatingModalVisibility] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisibility] = useState(false);
  const [selectedSellerIndex, setSellerIndex] = useState(0);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoadingModalVisible, setLoadingVisiblity] = useState(false);

  useEffect(() => {
    let {sub_category_id, item_id} = props.route.params;
    setLoading(true);
    Market.getMarketItemsByID(sub_category_id, item_id, (_items) => {
      console.log('View item', _items);
      _items[0] === null && _items.splice(0, 1);
      if (_items.length > 0) {
        setItems(_items);
        let sellersListCopy = [];
        _items.map((i) => {
          sellersListCopy.push([i.shop_name, i.price, parseInt(i.stocks), '']);
        });
        setSellersList(sellersListCopy);
        let _images = [];
        for (let index = 0; index < _items.length; index++) {
          _items[index].images !== undefined &&
            _items[index].images.map((i) => _images.push(i));
        }
        fetchImages(_images);
      }
      setLoading(false);
    });
  }, [props]);

  const fetchImages = async (_images) => {
    setIsImagesLoading(true);
    let imagesCopy = [];
    // console.warn(_images)
    for (let index = 0; index < _images.length; index++) {
      let url = await Market.getDownloadURL(_images[index]);
      console.log(url);
      await imagesCopy.push(url);
    }
    setImages(imagesCopy);
    setIsImagesLoading(false);
  };

  const tableButtons = (data, index) => (
    <View style={{flexDirection: 'row', paddingVertical: 5}}>
      <Button
        onPress={() => {
          setPaymentData({
            seller_id: items[index].seller_id,
            total_price: '0',
            base_price: items[index].price,
            total_items: '0',
            is_delivery: false,
            measurement: items[index].measurement,
            delivery_address: '',
            notes: '',
          });
          setBuyModalVisibility(true);
        }}
        transparent
        small>
        <Image
          source={ADD}
          style={{width: 20, height: 20, resizeMode: 'contain'}}
        />
      </Button>
      <Button
        transparent
        small
        style={{marginHorizontal: 5}}
        onPress={() => {
          setSellerIndex(index);
          setViewerVisible(true);
        }}>
        <Image
          source={VIEW}
          style={{width: 20, height: 20, resizeMode: 'contain'}}
        />
      </Button>
      <Button
        onPress={() => {
          setSellerIndex(index);
          setRatingModalVisibility(true);
        }}
        small
        block
        style={{backgroundColor: '#AAE556'}}>
        <Text style={[styles.textStyle, {color: 'white'}]}>RATE</Text>
      </Button>
    </View>
  );

  const handleRequest = async (data) => {
    let userInfo = JSON.parse(await AsyncHelper.getItem('USER_INFO')),
      userID = await AsyncHelper.getItem('USER_ID'),
      selectedItem = items.filter(
        (i) => i.seller_id === paymentData.seller_id,
      )[0];
    setLoadingVisiblity(true);
    await Requests.addRequest({
      ...data,
      date: new Date().toString(),
      is_payment_verified: false,
      status: 'pending',
      buyer_id: userID,
      buyer_first_name: userInfo.first_name,
      buyer_last_name: userInfo.last_name,
      sale_item_id: selectedItem.id,
      sub_category_id: selectedItem.sub_category_id,
      item_name: selectedItem.item_name,
    });
    await Market.updateSaleItem(selectedItem.sub_category_id, selectedItem.id, {
      stocks: selectedItem.stocks - parseInt(paymentData.total_items),
    }).then(() => {
      setLoadingVisiblity(false);
      setPaymentData(null);
    });
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1, paddingHorizontal: wp('7%')}}>
        {isLoadingModalVisible && (
          <LoadingModal isLoading={isLoadingModalVisible} />
        )}
        {isRatingModalVisible && (
          <RatingModal
            visible={isRatingModalVisible}
            onDismiss={() => {
              setRatingModalVisibility(false);
            }}
            items={items}
            data={items[selectedSellerIndex]}
          />
        )}
        {isBuyModalVisible && (
          <BuyModal
            visible={isBuyModalVisible}
            onDismiss={() => {
              setBuyModalVisibility(false);
              setPaymentData(null);
            }}
            onProceed={(data) => {
              setPaymentData(data);
              setBuyModalVisibility(false);
              setPaymentModalVisibility(true);
            }}
            items={items}
            data={paymentData}
          />
        )}
        {isPaymentModalVisible && (
          <PaymentModal
            visible={isPaymentModalVisible}
            onDismiss={() => {
              setPaymentModalVisibility(false);
              setPaymentData(null);
            }}
            onPressSend={(payData) => {
              handleRequest({
                ...paymentData,
                payment_method: payData.selectedPayment,
                reference_number: payData.referenceNumber,
                transaction_date: payData.transactionDate,
                total_price: payData.totalPrice,
              });
              setPaymentModalVisibility(false);
            }}
            onPressBack={() => {
              setBuyModalVisibility(true);
              setPaymentModalVisibility(false);
            }}
            orderData={paymentData}
            data={
              paymentData !== null &&
              items.filter((i) => i.seller_id === paymentData.seller_id)[0]
            }
          />
        )}
        {isViewerVisible && (
          <ImageViewer
            visible={isViewerVisible}
            imageList={items[selectedSellerIndex]?.images}
            onDismiss={() => setViewerVisible(false)}
          />
        )}
        {loading ? (
          <ActivityIndicator
            size="large"
            animating={true}
            color="black"
            style={{marginVertical: hp('40%')}}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingVertical: hp('5%')}}>
            <Text style={[styles.textStyle, {fontSize: 13}]}>
              {items[0].category} > {items[0].sub_category}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View style={{width: wp('50%')}}>
                <Text
                  style={[styles.textStyle, {color: '#3077BA', fontSize: 25}]}>
                  {items.length > 0 && items[0].item_name}
                </Text>
                <Text style={[styles.textStyle, {fontSize: 13}]}>
                  Stocks Available:{' '}
                  {items.length > 0
                    ? items
                        .map((i) => parseInt(i.stocks))
                        .reduce((total, num) => {
                          return total + num;
                        })
                    : 0}
                </Text>
              </View>
              <View style={{width: wp('36%')}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={[
                      styles.textStyle,
                      {color: '#21BEDE', fontSize: 12, marginRight: 5},
                    ]}>
                    AVG PRICE
                  </Text>
                  <Button transparent small>
                    <Image
                      source={INFO}
                      style={{width: 20, height: 20, resizeMode: 'contain'}}
                    />
                  </Button>
                </View>
                <Text
                  style={[
                    styles.textStyle,
                    {
                      fontSize: 25,
                      textAlign: 'center',
                      marginBottom: 10,
                    },
                  ]}>
                  {items.length > 0 &&
                    items
                      .map((i) => i.price)
                      .reduce((total, num) => {
                        return total + parseInt(num);
                      }, 0) /
                      items.length +
                      `/${items[0].measurement}`}
                </Text>
                <Button
                  onPress={() => setBuyModalVisibility(true)}
                  small
                  rounded
                  block
                  style={{width: wp('36%'), backgroundColor: '#AAE556'}}>
                  <Image
                    source={BUY}
                    style={{width: 20, height: 20, tintColor: 'white'}}
                  />
                  <Text style={[styles.textStyle, {color: 'white'}]}>BUY</Text>
                </Button>
              </View>
            </View>
            <View style={{height: hp('35%'), marginVertical: 20}}>
              {isImagesLoading ? (
                <ActivityIndicator
                  size="large"
                  animating={true}
                  color="black"
                  style={{marginVertical: hp('15%')}}
                />
              ) : images.length > 0 ? (
                <DeckSwiper
                  useNativeDriver={true}
                  ref={_deckSwiper}
                  dataSource={images}
                  renderEmpty={() => (
                    <View style={{alignSelf: 'center'}}>
                      {/* <Text>Over</Text> */}
                    </View>
                  )}
                  renderItem={(item) => (
                    <Card style={{elevation: 3}}>
                      <CardItem
                        cardBody
                        bordered
                        style={{flex: 1, height: hp('35%')}}>
                        <Thumbnail
                          square
                          source={{uri: item}}
                          style={{
                            flex: 1,
                            height: hp('35%'),
                            resizeMode: 'cover',
                          }}
                        />
                      </CardItem>
                    </Card>
                  )}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    height: hp('35%'),
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F0F0F0',
                  }}>
                  <Thumbnail small square source={ITEM} />
                </View>
              )}
            </View>
            <Card style={{elevation: 3, paddingBottom: hp('3%')}}>
              <CardItem header>
                <Text style={[styles.textStyle, {color: '#21BEDE'}]}>
                  SELLERS
                </Text>
              </CardItem>
              <ScrollView
                horizontal
                nestedScrollEnabled={true}
                style={{flex: 1}}>
                <CardItem cardBody bordered style={{flex: 1}}>
                  <Table borderStyle={{borderColor: 'transparent'}}>
                    <Row
                      data={SELLER_HEADERS}
                      style={{
                        borderColor: '#085DAD',
                        borderBottomWidth: 1,
                        borderTopWidth: 1,
                        paddingHorizontal: wp('4%'),
                      }}
                      textStyle={[styles.textStyle, {color: '#085DAD'}]}
                    />

                    {sellersList.map((rowData, index) => (
                      <TableWrapper
                        key={index}
                        style={{
                          flexDirection: 'row',
                          paddingHorizontal: wp('4%'),
                        }}>
                        {rowData.map((cellData, cellIndex) => (
                          <Cell
                            key={cellIndex}
                            data={
                              cellIndex === 3
                                ? tableButtons(cellData, index)
                                : cellData
                            }
                            textStyle={styles.textStyle}
                            style={{width: wp('30%')}}
                          />
                        ))}
                      </TableWrapper>
                    ))}
                  </Table>
                </CardItem>
              </ScrollView>
            </Card>
          </ScrollView>
        )}
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: 20, backgroundColor: '#fff'},
  head: {height: 40, backgroundColor: '#f1f8ff'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: wp('100%') - 40,
  },
  addItemsButton: {
    backgroundColor: '#8CC739',
    paddingHorizontal: 10,
  },
  headerInput: {
    borderColor: '#085DAD',
    marginVertical: 5,
    height: 30,
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
  },
  buttonIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  inputIcon: {
    position: 'absolute',
    right: 10,
    height: 30,
  },
  toolsContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: wp('88%'),
    height: 200,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
});
