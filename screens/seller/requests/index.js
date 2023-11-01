import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, FlatList, Alert} from 'react-native';
import {
  Container,
  Button,
  Text,
  Content,
  Thumbnail,
  Body,
  Item,
  Input,
  Form,
  Picker,
  Card,
  CardItem,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import CustomHeader from 'components/headers/sellerheader';
import StringHelper from 'modules/StringHelper';
import AsyncHelper from 'modules/AsyncHelper';
import Requests from 'modules/Requests';
import TransactionHistory from 'modules/TransactionHistory';
import Market from 'modules/Market';

const CARET = require('assets/images/caret2.png');
const SEARCH = require('assets/images/search.png');
const SAD = require('assets/images/sad.png');
const ACCEPT = require('assets/images/accept.png');
const REJECT = require('assets/images/reject.png');
const MESSAGE = require('assets/images/messages.png');

//statuses
const PENDING = require('assets/images/pending.png');
const DELIVERY = require('assets/images/delivery.png');
const OUTFORDELIVERY = require('assets/images/outfordelivery.png');
const DELIVERED = require('assets/images/delivered.png');
const ACCEPTED = require('assets/images/tick.png');
const REJECTED = require('assets/images/add.png');

export default function ViewRequests(props) {
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    let accountType = await AsyncHelper.getItem('ACCOUNT_TYPE'),
      userID = await AsyncHelper.getItem('USER_ID');
    Requests.getRequests(accountType, userID, (data) => {
      console.warn(JSON.stringify(data, null, '\t'));
      setRequests(data);
      setFilteredRequests(data);
      // setKeyword('');
      // setFilter('');
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'out for delivery':
        return OUTFORDELIVERY;
      case 'delivered':
        return DELIVERED;
      case 'rejected':
        return REJECTED;
      case 'pending':
      default:
        return PENDING;
    }
  };

  const getTags = (item) => {
    let tags = [],
      {status, is_delivery} = item;
    is_delivery &&
      tags.push({
        title: 'for delivery',
        icon: DELIVERY,
      });
    tags.push({
      title: status,
      icon: getIcon(status),
    });
    return tags;
  };

  const showAlert = (action, onPress) => {
    Alert.alert(
      'Confirm',
      `This action is irrevirsible! Are you sure you want to ${action} this request?`,
      [
        {
          text: 'NO',
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress,
        },
      ],
    );
  };

  const handleReject = async (request) => {
    try {
      showAlert('reject', async () => {
        await Requests.updateRequest(request.id, {status: 'rejected'});
        await Market.getSpecificSaleItem(
          request.sub_category_id,
          request.sale_item_id,
          async (data) => {
            await Market.updateSaleItem(
              request.sub_category_id,
              request.sale_item_id,
              {
                stocks: data.stocks + parseInt(request.total_items),
              },
            ).then(() => props.navigation.goBack(null));
          },
        );
      });
    } catch (error) {
      console.warn('Error rejecting request', error.message);
    }
  };

  const handleAccept = async (request) => {
    await Requests.updateRequest(request.id, {status: 'accepted'});
    //TODO: if request is not for delivery (var is_delivery), add to transaction history
    if (!request?.is_delivery) {
      await TransactionHistory.addTransaction({
        ...request,
        date: new Date().toString(),
        is_payment_verified: true,
        request_id: request?.id,
      });
    }
  };

  const renderRequests = ({item}) => {
    let {
      id,
      total_items,
      measurement,
      item_name,
      total_price,
      payment_method,
      buyer_last_name,
      buyer_first_name,
      notes,
      status,
      buyer_id,
    } = item;
    let tags = getTags(item);
    let disabledRequest = status === 'rejected' || status === 'accepted' || status !== 'pending';
    return (
      <Card>
        <CardItem
          button
          onPress={() => props.navigation.navigate('ViewRequest', {id})}>
          <Body>
            <View style={styles.cardHeaderContainer}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                style={[styles.textStyle, styles.cardID]}>
                {id}
              </Text>
              <Button
                disabled={disabledRequest}
                transparent
                onPress={() => handleAccept(item)}>
                <Thumbnail
                  source={ACCEPT}
                  small
                  square
                  style={[
                    styles.buttonIcon,
                    {tintColor: disabledRequest ? '#ADB6B5' : '#31C3E7'},
                  ]}
                />
              </Button>
              <Button
                disabled={disabledRequest}
                transparent
                onPress={() => handleReject(item)}>
                <Thumbnail
                  source={REJECT}
                  small
                  square
                  style={[
                    styles.buttonIcon,
                    {
                      tintColor: disabledRequest ? '#ADB6B5' : '#085DAD',
                    },
                  ]}
                />
              </Button>
              <Button
                transparent
                onPress={() =>
                  props.navigation.navigate('ViewMessage', {
                    otherUserID: buyer_id,
                    refreshMessages: () => {},
                  })
                }>
                <Thumbnail
                  source={MESSAGE}
                  small
                  square
                  style={[styles.buttonIcon, {width: 25, height: 25}]}
                />
              </Button>
            </View>
            <Text>
              <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                Order:{' '}
              </Text>
              <Text style={styles.textStyle}>
                {total_items} {measurement}/s of {item_name}
              </Text>
            </Text>
            <Text>
              <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                Price:{' '}
              </Text>
              <Text style={styles.textStyle}>{total_price}</Text>
            </Text>
            <Text>
              <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                Payment method:{' '}
              </Text>
              <Text style={styles.textStyle}>
                {StringHelper.toProperCase(payment_method)}
              </Text>
            </Text>
            <Text>
              <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                Customer name:{' '}
              </Text>
              <Text style={styles.textStyle}>
                {buyer_first_name} {buyer_last_name}
              </Text>
            </Text>
            {notes !== '' && (
              <Text numberOfLines={1}>
                <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                  Notes:{' '}
                </Text>
                <Text style={styles.textStyle}>{notes}</Text>
              </Text>
            )}
            <FlatList
              horizontal
              data={tags}
              renderItem={({item}) => {
                console.warn(JSON.stringify(item));
                return (
                  <Button iconLeft rounded bordered style={styles.tagContainer}>
                    <Thumbnail
                      source={item.icon}
                      square
                      small
                      style={[
                        styles.buttonIcon,
                        item.title === 'rejected' && {
                          transform: [{rotateZ: '45deg'}],
                        },
                      ]}
                    />
                    <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                      {item.title}
                    </Text>
                  </Button>
                );
              }}
              contentContainerStyle={styles.tagsContainer}
            />
          </Body>
        </CardItem>
      </Card>
    );
  };

  useEffect(() => {
    switch (filter) {
      case 'wet_market':
      case 'dry_market':
        return setFilteredRequests([
          ...requests.filter((i) =>
            i.sub_category_id.match(new RegExp(filter, 'gmi')),
          ),
        ]);
      default:
        setFilteredRequests([...requests]);
    }
  }, [filter]);

  useEffect(() => {
    if (filter !== 'key0' && keyword !== '') {
      // if  (filter === 'dry_market' || filter === 'wet_market') {
      //   let requestsCopy = requests;
      //   requestsCopy = requestsCopy.filter((i) => i['sub_category_id'].match(new RegExp(keyword, 'gmi')));
      //   console.warn(JSON.stringify(requestsCopy));
      //   setFilteredRequests([
      //     ...requestsCopy.filter((i) => i['item_name'].match(new RegExp(keyword, 'gmi'))),
      //   ]);
      // } else {
      setFilteredRequests([
        ...requests.filter((i) => i[filter].match(new RegExp(keyword, 'gmi'))),
      ]);
      // }
    } else {
      setFilteredRequests([...requests]);
    }
  }, [keyword]);

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{paddingHorizontal: 20, paddingTop: 20}}>
          <Text style={[styles.textStyle, {fontSize: 20}]}>REQUESTS</Text>
          <Form style={{marginVertical: 20}}>
            <Item picker rounded style={styles.headerInput}>
              <Picker
                mode="dropdown"
                iosIcon={<Thumbnail source={CARET} small square />}
                style={{width: undefined, fontFamily: 'Raleway-Light'}}
                textStyle={{fontFamily: 'Raleway-Light'}}
                placeholder="Catgeory"
                placeholderIconColor="#007aff"
                selectedValue={filter}
                onValueChange={(value) => setFilter(value)}
                mode="dialog">
                <Picker.Item label="All" value="key0" />
                <Picker.Item label="Date" value="date" />
                <Picker.Item label="Payment Method" value="payment_method" />
                <Picker.Item label="Item" value="item_name" />
                {/* <Picker.Item label="Wet Market" value="wet_market" />
                <Picker.Item label="Dry Market" value="dry_market" /> */}
                <Picker.Item label="Status" value="status" />
              </Picker>
              <Button
                transparent
                style={[styles.inputIcon, {transform: [{rotateZ: '180deg'}]}]}>
                <Thumbnail
                  source={CARET}
                  small
                  square
                  style={styles.buttonIcon}
                />
              </Button>
            </Item>
            <Item regular rounded style={[styles.headerInput, {marginLeft: 0}]}>
              <Input
                placeholder="Enter keyword..."
                onChangeText={(value) => setKeyword(value)}
                style={[
                  styles.textStyle,
                  {paddingVertical: 5, paddingRight: 40},
                ]}
              />
              <Button transparent style={styles.inputIcon}>
                <Thumbnail
                  source={SEARCH}
                  small
                  square
                  style={styles.buttonIcon}
                />
              </Button>
            </Item>
          </Form>
          <FlatList
            data={filteredRequests}
            renderItem={renderRequests} 
            ListEmptyComponent={() => 
              <View style={styles.emptyContainer}>
                <Thumbnail source={SAD} large square style={styles.emptyIcon} />
                <Text style={[styles.textStyle, {color: '#00ACEA', fontSize: 16}]}>
                  NO REQUESTS
                </Text>
              </View>
            }
          />
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  headerInput: {
    borderColor: '#085DAD',
    marginVertical: 5,
    height: 30,
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
    fontSize: 13,
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
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('100%') - 40,
    height: hp('60%'),
  },
  emptyIcon: {
    width: wp('30%'),
    height: wp('30%'),
    resizeMode: 'contain',
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('80%'),
  },
  cardID: {
    color: '#9ECF60',
    width: wp('50%'),
    fontSize: 15,
    paddingRight: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginVertical: 10,
  },
  tagContainer: {
    height: 30,
    marginRight: 5,
    marginBottom: 5,
    padding: 5,
  },
});
