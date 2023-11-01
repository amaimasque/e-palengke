import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
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
import Market from 'modules/Market';
import AsyncHelper from 'modules/AsyncHelper';
import Database from 'modules/Database';

const CARET = require('assets/images/caret2.png');
const SEARCH = require('assets/images/search.png');
const VIEW = require('assets/images/visibility.png');
const EDIT = require('assets/images/edit.png');
const ITEM = require('assets/images/items.png');
const EMPTY = require('assets/images/sad.png');

function ListItem(props) {
  const [isToolsVisible, setToolsVisibility] = useState(false);
  const [thumbnail, setThumbnail] = useState('');
  let {data, refreshList} = props;
  let {item_name, sub_category, images, stocks, price, measurement} = data;
  console.warn(data);

  useEffect(() => {
    if (data && images && images.length > 0) {
      fetchThumbnail();
    }
  }, []);

  const fetchThumbnail = async () => {
    let url = await Market.getDownloadURL(images[0]);
    setThumbnail(url);
  };

  return (
    <Card>
      <CardItem header style={styles.itemHeader}>
        <View>
          <Text style={[styles.textStyle, {color: '#3077BA'}]}>
            {item_name}
          </Text>
          <Text style={[styles.textStyle, {fontSize: 11}]}>
            Category: {sub_category}
          </Text>
        </View>
        <Text style={[styles.textStyle, {fontSize: 30}]}>
          {price}/{measurement}
        </Text>
      </CardItem>
      <CardItem
        cardBody
        bordered
        button
        style={{flex: 1, height: 200}}
        onPress={() => setToolsVisibility(!isToolsVisible)}>
        {isToolsVisible && (
          <View style={styles.toolsContainer}>
            <View style={{flexDirection: 'row'}}>
              <Button
                style={{margin: 5}}
                transparent
                onPress={() => props.navigation.navigate('ViewItem', {data, refreshList})}>
                <Thumbnail
                  small
                  square
                  source={VIEW}
                  style={{tintColor: 'white'}}
                />
              </Button>
              <Button
                style={{margin: 5}}
                transparent
                onPress={() => props.navigation.navigate('EditItem', {data})}>
                <Thumbnail
                  small
                  square
                  source={EDIT}
                  style={{tintColor: 'white'}}
                />
              </Button>
            </View>
          </View>
        )}
        {thumbnail === '' ? (
          <View 
            style={{
              flex: 1,
              height: 200,
              resizeMode: 'cover',
              backgroundColor: '#F0F0F0',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Thumbnail source={ITEM} small square/>
          </View>
        ) : (
          <Thumbnail
            square
            source={{uri: thumbnail}}
            style={{
              flex: 1,
              height: 200,
              resizeMode: 'cover',
              backgroundColor: '#ADB6B5',
            }}
          />
        )}
        
      </CardItem>
      <CardItem>
        <Text style={[styles.textStyle, {fontSize: 11}]}>
          Stocks available: {stocks}
        </Text>
      </CardItem>
    </Card>
  );
}

export default function Items(props) {
  const [keyword, setKeyword] = useState('');
  const [isAccountSetup, setisAccountSetup] = useState(false);
  const [filter, setFilter] = useState('key0');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const filterAndSearch = (data) => {
    data =
      filter !== 'key0'
        ? data.filter((i) => i.main_category === filter.replace('_', ' '))
        : data;
    data =
      keyword !== ''
        ? data.filter(
            (i) =>
              i.item_name.match(new RegExp(keyword, 'gmi')) ||
              i.sub_category.match(new RegExp(keyword, 'gmi')),
          ) : data;
    console.warn(data)
    return data;
  };

  const renderItems = ({item}) => {
    return <ListItem data={item} {...props} refreshList={fetchItems}/>;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchUserInfo = async () => {
    try {
      let id = await AsyncHelper.getItem('USER_ID');
      if (id) {
        await Database.getUserInfo(id, async (data) => {
          if (data) {
            data.shop_name !== '' 
              ? props.navigation.navigate('AddItem')
              : Alert.alert(
                  'Shop Setup',
                  'Please setup your shop name first in the account settings. Add your Paymaya and/or Gcash number to enable online transactions.',
                );
          }
        });
      }
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  const fetchItems = async () => {
    let id = await AsyncHelper.getItem('USER_ID');
    // alert(id);
    setLoading(true);
    Market.viewSellerItems(id, (items) => {
      setItems(items);
      setLoading(false);
    });
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchItems} />
          }
          style={{paddingHorizontal: 20, paddingTop: 20}}>
          <View style={styles.headerContainer}>
            <Text style={[styles.textStyle, {fontSize: 20}]}>ITEMS</Text>
            <Button
              rounded
              style={styles.addItemsButton}
              onPress={fetchUserInfo}>
              <Text style={{alignSelf: 'center', fontFamily: 'Raleway-Light'}}>
                ADD ITEM
              </Text>
            </Button>
          </View>
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
                onValueChange={(value) => {
                  setFilter(value);
                  setRefresh(!refresh);
                }}
                mode="dialog">
                <Picker.Item label="All" value="key0" />
                <Picker.Item label="Dry Market" value="dry_market" />
                <Picker.Item label="Wet Market" value="wet_market" />
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
                onChangeText={(value) => {
                  setKeyword(value);
                  setRefresh(!refresh);
                }}
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
          {loading ? (
            <ActivityIndicator
              size="large"
              animating={true}
              color="black"
              style={{marginVertical: hp('25%')}}
            />
          ) : (
            <FlatList
              data={filter !== 'key0' ? filterAndSearch(items) : items}
              renderItem={renderItems}
              listKey={(index) => `item${index}-${Date.now()}`}
              extraData={items}
              contentContainerStyle={{paddingBottom: 50}}
              ListEmptyComponent={() => (
                <Text
                  style={
                    (styles.textStyle,
                    {textAlign: 'center', marginVertical: hp('25%')})
                  }>
                  No item/s found
                </Text>
              )}
              extraData={refresh}
            />
          )}
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
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
});
