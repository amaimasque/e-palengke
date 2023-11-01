import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
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
  Textarea,
  CheckBox,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CLOSE = require('assets/images/close.png');

export default function BuyModal(props) {
  const [selectedSeller, setSeller] = useState('key0');
  const [price, setPrice] = useState('0');
  const [quantity, setQuantity] = useState('0');
  const [notes, setNotes] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  let {visible, onDismiss, onProceed, items, data} = props;

  console.warn(items)

  useEffect(() => {
    if (data !== null) {
      setSeller(data.seller_id);
      setPrice(data.total_price);
      setQuantity(data.total_items);
      setNotes(data.notes);
      setIsDelivery(data.is_delivery);
      setDeliveryAddress(data.delivery_address);
    }
  }, [props, data]);

  const handleText = (action, value) => {
    if (value === '') {
      action(0);
    } else {
      let recentValue = value.slice(0, value.length - 1);
      console.warn(recentValue);
      value =
        recentValue.includes('.') && value.endsWith('.')
          ? value.slice(0, value.length - 1)
          : value;
      console.warn(recentValue.includes('.'));
      value =
        action === setQuantity && items[0].measurement === 'pc'
          ? value.replace(/[.,-]/gi, '')
          : value.replace(/[,-]/gi, '');
      // action === setQuantity && items[0].measurement === 'pc' ? action(value.trim()) : action(parseFloat(value.trim()));
      action(value.trim());
    }
  };

  useEffect(() => {
    setIsButtonDisabled(
      price === '0' ||
        quantity === '0' ||
        price === 0 ||
        quantity === 0 ||
        selectedSeller === 'key0' ||
        (isDelivery && deliveryAddress === ''),
    );
  }, [price, quantity, selectedSeller, isDelivery, deliveryAddress]);

  const handleProceed = () => {
    const selectedItem = items.filter((i) => i.seller_id === selectedSeller)[0];
    onProceed({
      seller_id: selectedSeller,
      total_price: price,
      base_price: selectedItem.price,
      total_items: quantity,
      is_delivery: isDelivery,
      measurement: selectedItem.measurement,
      delivery_address: deliveryAddress,
      notes,
    });
  };

  const handlePrice = (value) => {
    handleText(setPrice, value);
  };

  const handleQuantity = (value) => {
   handleText(setQuantity, value);
  };

  useEffect(() => {
    if (selectedSeller !== 'key0') {
      const selectedItem = items.filter((i) => i.seller_id === selectedSeller)[0];
      if (selectedItem.stocks < parseInt(quantity)) {
        return handleQuantity(selectedItem.stocks.toString());
      }
      let constPrice = selectedItem.price * parseInt(quantity);
      setPrice(constPrice);
    }
  }, [quantity]);

  useEffect(() => {
    if (selectedSeller !== 'key0') {
      const selectedItem = items.filter((i) => i.seller_id === selectedSeller)[0];
      let constQty =
        selectedItem.measurement === 'pc'
          ? parseInt(price / selectedItem.price)
          : parseFloat(price / selectedItem.price).toFixed(2);
      setQuantity(constQty);
    }
  }, [price])

  // useEffect(() => {
  //   const selectedItem = items.filter((i) => i.seller_id === selectedSeller)[0];
    
  // }, [price, quantity])

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onDismiss}
      transparent={true}
      style={{
        height: hp('100%') - StatusBar.currentHeight,
        width: wp('100%'),
      }}>
      <View
        style={{
          height: hp('100%') - StatusBar.currentHeight,
          width: wp('100%'),
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <View
          style={{
            width: wp('100%'),
            // height: hp('70%'),
            backgroundColor: 'white',
            padding: wp('5%'),
          }}>
          <Button
            onPress={onDismiss}
            transparent
            style={{
              position: 'absolute',
              right: wp('4%'),
              top: wp('4%'),
              zIndex: 5,
            }}>
            <Thumbnail
              source={CLOSE}
              small
              square
              style={{height: wp('5%'), width: wp('5%')}}
            />
          </Button>
          <Text style={[styles.textStyle, {fontSize: 13}]}>
            {items[0].category} > {items[0].sub_category}
          </Text>
          <Text style={[styles.textStyle, {color: '#3077BA', fontSize: 20}]}>
            {items[0].item_name}
          </Text>
          <Form>
            <Label
              style={[styles.textStyle, {fontSize: 13, marginTop: hp('3%')}]}>
              Buy From
            </Label>
            <Item picker>
              <Picker
                mode="dropdown"
                iosIcon={<Icon name="arrow-down" />}
                style={{width: undefined}}
                placeholder="Select from sellers"
                placeholderStyle={{color: '#bfc6ea'}}
                placeholderIconColor="#007aff"
                selectedValue={selectedSeller}
                onValueChange={(value) => setSeller(value)}>
                <Picker.Item label="Select from sellers" value="key0" />
                {items.map((i) => {
                  return (
                    <Picker.Item label={i.shop_name} value={i.seller_id} />
                  );
                })}
              </Picker>
            </Item>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Item
                error={isNaN(parseFloat(price))}
                stackedLabel
                style={{width: wp('50%') - 40, marginLeft: 0}}>
                <Label style={[styles.textStyle, {fontSize: 13}]}>Price</Label>
                <Input
                  value={price.toString()}
                  onChangeText={(value) => handlePrice(value)}
                  keyboardType="number-pad"
                  style={[styles.textStyle, {paddingVertical: 5}]}
                  editable={selectedSeller !== 'key0'}
                />
              </Item>
              <Text
                style={[
                  styles.textStyle,
                  {
                    width: wp('10%'),
                    textAlign: 'center',
                    alignSelf: 'flex-end',
                    paddingBottom: 15,
                  },
                ]}>
                /
              </Text>
              <Item style={{width: wp('30%'), alignSelf: 'flex-end'}}>
                <Input
                  value={quantity.toString()}
                  onChangeText={(value) => handleQuantity(value)}
                  keyboardType="number-pad"
                  style={[styles.textStyle, {paddingVertical: 5}]}
                  editable={selectedSeller !== 'key0'}
                />
              </Item>
              <Text
                style={[
                  styles.textStyle,
                  {
                    width: wp('10%'),
                    textAlign: 'center',
                    alignSelf: 'flex-end',
                    paddingBottom: 15,
                  },
                ]}>
                {items[0].measurement}
              </Text>
            </View>
            <Textarea
              rowSpan={4}
              bordered
              placeholder="Additional notes..."
              style={[styles.textStyle, {marginTop: hp('3%')}]}
              onChangeText={(value) => setNotes(value)}
              editable={selectedSeller !== 'key0'}
            />
            <View
              style={{
                display:
                  selectedSeller !== 'key0' &&
                  items
                    .filter((i) => i.seller_id === selectedSeller)[0]
                    ?.tags?.includes('Open for delivery')
                    ? 'flex'
                    : selectedSeller === 'key0'
                    ? 'flex'
                    : 'none',
              }}>
              <View style={{flexDirection: 'row', marginTop: hp('3%')}}>
                <CheckBox
                  checked={isDelivery}
                  color="#31C3E7"
                  style={{borderRadius: 100}}
                  onPress={() => setIsDelivery(!isDelivery)}
                />
                <Text style={[styles.textStyle, {marginLeft: wp('5%')}]}>
                  Deliver to
                </Text>
              </View>
              <Item>
                <Input
                  value={deliveryAddress}
                  onChangeText={(value) => setDeliveryAddress(value)}
                  style={[styles.textStyle, {fontSize: 15}]}
                  placeholder="Delivery Address"
                  editable={isDelivery}
                />
              </Item>
            </View>
          </Form>
          <Button
            disabled={isButtonDisabled}
            rounded
            style={[
              styles.saveButton,
              {backgroundColor: isButtonDisabled ? '#ADB6B5' : '#31C3E7'},
            ]}
            onPress={handleProceed}>
            <Text
              style={{
                alignSelf: 'center',
                color: isButtonDisabled ? 'black' : 'white',
              }}>
              Proceed to Payment
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
  },
  saveButton: {
    width: wp('90%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp('2%'),
  },
});
