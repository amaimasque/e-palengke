import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {
  Container,
  Button,
  Text,
  Content,
  Thumbnail,
  Body,
  Card,
  CardItem,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import CustomHeader from 'components/headers/sellerheader';
import StringHelper from 'modules/StringHelper';
import Requests from 'modules/Requests';

const CARET = require('assets/images/caret2.png');
const SEARCH = require('assets/images/search.png');
const SAD = require('assets/images/sad.png');
const ACCEPT = require('assets/images/accept.png');
const REJECT = require('assets/images/reject.png');
const MESSAGE = require('assets/images/messages.png');
const MAP = require('assets/images/map.png');

//statuses
const PENDING = require('assets/images/pending.png');
const DELIVERY = require('assets/images/delivery.png');
const OUTFORDELIVERY = require('assets/images/outfordelivery.png');
const DELIVERED = require('assets/images/delivered.png');
const ACCEPTED = require('assets/images/tick.png');
const REJECTED = require('assets/images/add.png');

const transactionHeaders = [
  'Date',
  'Transaction ID',
  'Total Price',
  'Items',
  'Customer Name',
  'Payment Method',
];

export default function ViewRequest(props) {
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState('');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let {id} = props.route.params;
    Requests.getRequestByID(id, (data) => {
      console.warn('item', JSON.stringify(data, null, '\t'));
      setRequest(data);
      setLoading(false);
    });
  }, []);

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

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 20}}>
          {loading ? (
            <ActivityIndicator
              size="large"
              animating={true}
              color="black"
              style={{marginVertical: hp('40%')}}
            />
          ) : (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    styles.textStyle,
                    {color: '#9ECF60', maxWidth: wp('40%')},
                  ]}>
                  (Request ID) {request.id}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Button
                    transparent
                    onPress={() =>
                      props.navigation.navigate('ViewMessage', {
                        otherUserID: request.seller_id,
                        refreshMessages: () => {
                          console.warn('Test');
                        },
                      })
                    }>
                    <Thumbnail
                      source={MESSAGE}
                      small
                      square
                      style={[styles.buttonIcon, {width: 25, height: 25}]}
                    />
                  </Button>
                  <Button
                    iconLeft
                    rounded
                    bordered
                    style={{marginLeft: 5, padding: 5, borderColor: '#31C3E7'}}>
                    <Thumbnail
                      source={getIcon(request.status)}
                      square
                      small
                      style={[styles.buttonIcon, {tintColor: '#31C3E7'}]}
                    />
                    <Text
                      style={{
                        fontFamily: 'Raleway-Light',
                        fontSize: 12,
                        color: '#31C3E7',
                      }}>
                      {request.status}
                    </Text>
                  </Button>
                </View>
              </View>
              <Card style={{marginTop: hp('2%')}}>
                <CardItem>
                  <Body>
                    <Text style={[styles.textStyle, {color: '#025DAF', fontSize: 15, marginBottom: 10}]}>OVERVIEW</Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Order:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {request.total_items} {request.measurement} of{' '}
                        {request.item_name}
                      </Text>
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Price:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {request.total_price}
                      </Text>
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Payment method:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {StringHelper.toProperCase(request.payment_method)}
                      </Text>
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Customer name:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {request.buyer_first_name} {request.buyer_last_name}
                      </Text>
                    </Text>
                    {request.notes !== '' && (
                      <Text>
                        <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                          Notes:{' '}
                        </Text>
                        <Text style={styles.textStyle}>{request.notes}</Text>
                      </Text>
                    )}
                  </Body>
                </CardItem>
              </Card>
              <Card>
                <CardItem>
                  <Body>
                    <Text
                      style={[
                        styles.textStyle,
                        {color: '#025DAF', fontSize: 15, marginBottom: 10},
                      ]}>
                      PAYMENT INFORMATION
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Payment method:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {StringHelper.toProperCase(request.payment_method)}
                      </Text>
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Reference number::{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {request.reference_number}
                      </Text>
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Transaction date:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {StringHelper.formatDate(request.transaction_date, 'MMMM DD, YYYY')}
                      </Text>
                    </Text>
                  </Body>
                </CardItem>
              </Card>
              {request.is_delivery && (
                <Card style={{marginBottom: 50}}>
                  <CardItem>
                    <Body>
                      <Text
                        style={[
                          styles.textStyle,
                          {color: '#025DAF', fontSize: 15, marginBottom: 10},
                        ]}>
                        DELIVERY INFORMATION
                      </Text>
                      <Text>
                        <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                          Address:{' '}
                        </Text>
                        <Text style={styles.textStyle}>
                          {request.delivery_address}
                        </Text>
                      </Text>
                    </Body>
                  </CardItem>
                  {/* <CardItem cardBody bordered button style={{flex: 1, height: 200}}>
                    <Thumbnail
                      square
                      source={MAP}
                      style={{flex: 1, height: 200, resizeMode: 'cover'}}
                    />
                  </CardItem> */}
                </Card>
              )}
            </View>
          )}
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
    fontSize: 14,
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
