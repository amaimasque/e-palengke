import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Container,
  Button,
  Content,
  Thumbnail,
  Card,
  CardItem,
  DeckSwiper,
  Text,
  Toast,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
  Cell,
} from 'react-native-table-component';

import CustomHeader from 'components/headers/sellerheader';
import StringHelper from 'modules/StringHelper';
import Market from 'modules/Market';
import TransactionHistory from 'modules/TransactionHistory';
import RatingModal from './components/ratingsmodal';

const transactionHeaders = [
  'Date',
  'Transaction ID',
  'Total Price',
  'Items',
  'Customer Name',
  'Payment Method',
];

const ITEM = require('assets/images/items.png');

export default function ViewItem(props) {
  const _deckSwiper = React.useRef(null);
  const [item, setItem] = useState(null);
  const [images, setImages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isTransactionShown, setTransactionVisiblity] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRatingModalVisible, setRatingModalVisibility] = useState(false);
  const [sortedTransactions, setSortedTransactions] = useState([]);

  const viewTransactions = () => {
    let sortedTransactionsCopy = [];
    transactions.map((i) => {
      sortedTransactionsCopy.push([
        StringHelper.formatDate(i.date, 'MMMM D, YYYY, h:mm A'),
        i.id,
        i.total_price,
        i.total_items,
        StringHelper.toProperCase(i.buyer_first_name + ' ' + i.buyer_last_name),
        StringHelper.toProperCase(i.payment_method),
      ]);
    });
    console.warn(JSON.stringify(sortedTransactionsCopy))
    setSortedTransactions(sortedTransactionsCopy);
  };

  const handleTransactions = () => {
    if (!isTransactionShown) {
      viewTransactions();
      setTransactionVisiblity(true);
    } else {
      setTransactionVisiblity(false);
      setSortedTransactions([]);
    }
  };

  // useEffect(() => {
  //   let {data} = props.route.params;
  //   console.log(data);
  //   setItem(data);
  //   data.images.length > 0 && fetchImages(data.images);

  // }, [props.route.params]);

  useEffect(() => {
    fetchItem();
    fetchTransactions();
  }, []);

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

  const fetchTransactions = async () => {
    setSortedTransactions([]);
    TransactionHistory.getTransactionsBySaleItemID(item?.id, (data) => {
      setTransactions(data);
    });
  }; 

  const handleDeleteItem = async () => {
    try {
      let response = Market.deleteItem(item?.sub_category_id, item?.id);
      if (response) {
        Toast.show({
          text: 'Item deleted successfully!',
        });
        props.route.params.refreshList();
        props.navigation.goBack(null);
      }
    } catch (error) {
      console.warn('Error deleting item', error.message);
    }
  };

  const fetchItem = async () => {
    let {data} = props.route.params;
    // alert(JSON.stringify(data));
    setLoading(true);
    Market.getSpecificSaleItem(data.sub_category_id, data.id, (i) => {
      console.warn('Item fetched', i);
      setItem(i);
      setLoading(false);
      i.images.length > 0 && fetchImages(i.images);
    });
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1, padding: 20}}>
        {isRatingModalVisible && (
          <RatingModal
            visible={isRatingModalVisible}
            onDismiss={() => {
              setRatingModalVisibility(false);
            }}
            data={item}
          />
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchItem} />
          }>
          {loading ? (
            <ActivityIndicator
              size="large"
              animating={true}
              color="black"
              style={{marginVertical: hp('40%')}}
            />
          ) : (
            <View>
              <Text style={styles.textStyle}>
                {item !== null &&
                  StringHelper.toProperCase(item?.main_category)}{' '}
                > {item?.sub_category}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={[styles.textStyle, {color: '#3077BA', fontSize: 25}]}>
                  {item?.item_name}
                </Text>
                <Text style={[styles.textStyle, {fontSize: 30}]}>
                  {item?.price}/{item?.measurement}
                </Text>
              </View>
              <Text style={[styles.textStyle, {fontSize: 13}]}>
                Stocks Available: {item?.stocks}
              </Text>
              <Text style={[styles.textStyle, {fontSize: 13}]}>Tags</Text>
              <FlatList
                horizontal
                data={item?.tags}
                renderItem={({item}) => {
                  return (
                    <Button rounded bordered style={{height: 30, margin: 5}}>
                      <Text style={styles.textStyle}>{item}</Text>
                    </Button>
                  );
                }}
                contentContainerStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  flex: 1,
                }}
                ListEmptyComponent={() => (
                  <Button rounded bordered style={{height: 30, margin: 5}}>
                    <Text style={styles.textStyle}>NONE</Text>
                  </Button>
                )}
              />
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
                    loopin
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
              <Button
                onPress={() =>
                  props.navigation.navigate('EditItem', {
                    data: props.route.params.data,
                    refresh: fetchItem,
                  })
                }
                full
                rounded
                style={[styles.button, {backgroundColor: '#21BEDE'}]}>
                <Text style={{fontFamily: 'Raleway-Light'}}>Edit item</Text>
              </Button>
              <Button
                onPress={() =>
                  Alert.alert(
                    'Confirm',
                    'Are you sure you want to delete this item?',
                    [
                      {
                        text: 'NO',
                        style: 'cancel',
                      },
                      {
                        text: 'YES',
                        onPress: handleDeleteItem,
                      },
                    ],
                  )
                }
                full
                rounded
                style={[styles.button, {backgroundColor: '#ADB6B5'}]}>
                <Text style={{fontFamily: 'Raleway-Light'}}>Delete item</Text>
              </Button>
              <Button
                full
                rounded
                style={[styles.button, {backgroundColor: '#085DAD'}]}
                onPress={() => setRatingModalVisibility(true)}>
                <Text style={{fontFamily: 'Raleway-Light'}}>
                  RATINGS & REVIEWS
                </Text>
              </Button>
              <Button
                full
                rounded
                style={[styles.button, {backgroundColor: '#8CC739'}]}
                onPress={handleTransactions}>
                <Text style={{fontFamily: 'Raleway-Light'}}>
                  {isTransactionShown ? 'Close' : 'View'} transaction history
                </Text>
              </Button>
              <ScrollView
                horizontal
                nestedScrollEnabled={true}
                style={{flex: 1}}>
                {isTransactionShown && sortedTransactions.length > 0 && (
                  <View style={styles.container}>
                    <Table
                      borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                      <Row
                        data={transactionHeaders}
                        style={styles.head}
                        textStyle={[
                          styles.textStyle,
                          {textAlign: 'center', width: 150},
                        ]}
                      />
                      <Rows
                        data={sortedTransactions}
                        textStyle={[
                          styles.textStyle,
                          {textAlign: 'center', width: 150},
                        ]}
                      />
                    </Table>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </ScrollView>
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
