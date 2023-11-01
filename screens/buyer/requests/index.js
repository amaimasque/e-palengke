import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
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
    console.warn(userID, accountType)
    Requests.getRequests(accountType, userID, (data) => {
      console.warn(JSON.stringify(data, null, '\t'));
      setRequests(data);
      setFilteredRequests(data);
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
      seller_id,
    } = item;
    let tags = getTags(item);
    return (
      <Card>
        <CardItem
          button
          onPress={() => props.navigation.navigate('ViewRequest', {id})}>
          <Body>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: wp('70%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    styles.textStyle,
                    {
                      color: '#9ECF60',
                      fontSize: 12,
                      marginRight: 5,
                      maxWidth: wp('30%'),
                    },
                  ]}>
                  (ID) {id}
                  {/* #1 */}
                </Text>
              </View>

              <Button
                transparent
                onPress={() =>
                  props.navigation.navigate('ViewMessage', {
                    otherUserID: seller_id,
                    refreshMessages: () => {console.warn('Test')},
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
            <FlatList
              horizontal
              data={tags}
              renderItem={({item}) => {
                return (
                  <Button
                    rounded
                    style={{
                      height: 30,
                      marginRight: 5,
                      padding: 3,
                      backgroundColor: '#31C3E7',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Raleway-Bold',
                        fontSize: 10,
                        color: 'white',
                      }}>
                      {item.title}
                    </Text>
                  </Button>
                );
              }}
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                flex: 1,
                marginVertical: 10,
              }}
            />
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
      setFilteredRequests([
        ...requests.filter((i) => i[filter].match(new RegExp(keyword, 'gmi'))),
      ]);
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
});
