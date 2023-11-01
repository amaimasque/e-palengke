import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Container,
  Button,
  Text,
  Content,
  Thumbnail,
  Body,
  Item,
  Label,
  Picker,
  Card,
  CardItem,
  Input,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import CustomHeader from 'components/headers/sellerheader';
import StringHelper from 'modules/StringHelper';
import Requests from 'modules/Requests';
import TransactionHistory from 'modules/TransactionHistory';
import Market from 'modules/Market';

const CARET = require('assets/images/caret2.png');
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

export default function ViewRequest(props) {
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState('');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [props]);

  const fetchRequest = () => {
    setLoading(true);
    let {id} = props.route.params;
    Requests.getRequestByID(id, (data) => {
      console.warn('item', JSON.stringify(data, null, '\t'));
      setRequest(data);
      setStatus(data.status);
      setLoading(false);
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

  const handleReject = async () => {
    try {
      showAlert('reject', async () => {
        await Requests.updateRequest(request.id, {status: 'rejected'}).then(
          fetchRequest,
        );
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

  const handleAcceptRequest = async () => {
    await Requests.updateRequest(request.id, {status: 'accepted'}).then(
      fetchRequest,
    );
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

  const handleStatusChange = async (value) => {
    setStatus(value);
    let {id} = props.route.params;
    await Requests.updateRequest(id, {status: value}).then(async () => {
      fetchRequest();
      //TODO: if request is for delivery (var is_delivery) & status is delivered, add to transaction history
      if (request?.is_delivery && value === 'delivered') {
        await TransactionHistory.addTransaction({
          ...request,
          date: new Date().toString(),
          is_payment_verified: true,
          request_id: request?.id,
        });
      }
    });
  };

  let disabledRequest =
    request?.status === 'rejected' ||
    request?.status === 'accepted' ||
    request?.status !== 'pending';

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchRequest} />
          }
          showsVerticalScrollIndicator={false}
          style={{padding: 20}}>
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
                    {color: '#9ECF60', width: wp('50%')},
                  ]}>
                  (Request ID) {request.id}
                </Text>
                <Button
                  disabled={disabledRequest}
                  transparent
                  onPress={() => showAlert('accept', handleAcceptRequest)}>
                  <Thumbnail
                    source={ACCEPT}
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
                  disabled={disabledRequest}
                  transparent
                  style={{marginRight: wp('3%')}}
                  onPress={handleReject}>
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
                <Button transparent>
                  <Thumbnail
                    source={MESSAGE}
                    small
                    square
                    style={[styles.buttonIcon, {width: 25, height: 25}]}
                  />
                </Button>
              </View>
              {request.is_delivery && request?.status !== 'pending' && (
                <Card>
                  <CardItem>
                    <Body>
                      <Item picker fixedLabel disabled={true}>
                        <Label style={{fontFamily: 'Raleway-Light'}}>
                          Status
                        </Label>
                        <Picker
                          enabled={disabledRequest && !(status === 'delivered')}
                          mode="dropdown"
                          iosIcon={<Thumbnail source={CARET} small square />}
                          style={{width: 150}}
                          textStyle={{fontFamily: 'Raleway-Light'}}
                          placeholder="Pending"
                          placeholderStyle={{color: '#D0D2D2'}}
                          placeholderIconColor="#007aff"
                          selectedValue={status}
                          onValueChange={handleStatusChange}>
                          <Picker.Item label="Queued" value="queued" />
                          <Picker.Item
                            label="Out for delivery"
                            value="out for delivery"
                          />
                          <Picker.Item label="Delivered" value="delivered" />
                        </Picker>
                      </Item>
                    </Body>
                  </CardItem>
                </Card>
              )}
              {request?.status === 'pending' && (
                <Card>
                  <CardItem>
                    <Body>
                      <Item picker fixedLabel disabled={true}>
                        <Label style={{fontFamily: 'Raleway-Light'}}>
                          Status
                        </Label>
                        <Input
                          disabled={true}
                          style={{fontFamily: 'Raleway-Light', width: 150}}
                          value={
                            StringHelper.toProperCase(request?.status) ||
                            'Error'
                          }
                        />
                        {/* <Picker
                          enabled={disabledRequest}
                          mode="dropdown"
                          iosIcon={<Thumbnail source={CARET} small square />}
                          style={{width: 150}}
                          textStyle={{fontFamily: 'Raleway-Light'}}
                          placeholder="Update status..."
                          placeholderStyle={{color: '#D0D2D2'}}
                          placeholderIconColor="#007aff"
                          selectedValue={status}
                          onValueChange={(value) => setStatus(value)}>
                          <Picker.Item label="Pending" value="pending" />
                          <Picker.Item
                            label="Out for delivery"
                            value="out for delivery"
                          />
                          <Picker.Item label="Delivered" value="delivered" />
                        </Picker> */}
                      </Item>
                    </Body>
                  </CardItem>
                </Card>
              )}
              <Card>
                <CardItem>
                  <Body>
                    <Text
                      style={[
                        styles.textStyle,
                        {color: '#025DAF', fontSize: 15, marginBottom: 10},
                      ]}>
                      OVERVIEW
                    </Text>
                    <Text>
                      <Text style={[styles.textStyle, {color: '#ADB6B5'}]}>
                        Order:{' '}
                      </Text>
                      <Text style={styles.textStyle}>
                        {request.total_items} {request.measurement}/s of{' '}
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
              {request?.payment_method !== 'cash' && (
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
                          Reference number:{' '}
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
                          {StringHelper.formatDate(
                            request.transaction_date,
                            'MMMM D, YYYY',
                          )}
                        </Text>
                      </Text>
                    </Body>
                  </CardItem>
                </Card>
              )}
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
                  {/* <CardItem
                    cardBody
                    bordered
                    button
                    style={{flex: 1, height: 200}}>
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
