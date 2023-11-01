import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Container,
  Button,
  Text,
  Content,
  Thumbnail,
  Card,
  CardItem,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import CustomHeader from 'components/headers/sellerheader';
import Market from 'modules/Market';
import * as RootNavigation from 'modules/RootNavigation';

const MARKET = require('assets/images/items.png');
const SEARCH = require('assets/images/search2.png');
const CLOSE = require('assets/images/close.png');

function ListItem(props) {
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  let {item} = props;
  let {item_name, data, category, item_id} = item;
  let priceList = data.map((i) => i.price),
    stocksList = data.map((i) => i.stocks);
  console.warn(JSON.stringify(data))

  useEffect(() => {
    data[0].images !== undefined && getThumbnail(data[0].images[0]);
  }, []);

  const getThumbnail = async (image) => {
    let url = await Market.getDownloadURL(image);
    setThumbnailUrl(url);
  };

  return (
    <Card onPress>
      <CardItem header style={styles.itemHeader}>
        <Text style={[styles.textStyle, {color: '#3077BA'}]}>{item_name}</Text>
        <Text style={[styles.textStyle, {fontSize: 30}]}>
          {priceList.reduce((total, num) => {
            return total + parseInt(num);
          }, 0) / data.length}
          /{data[0].measurement}
        </Text>
      </CardItem>
      <CardItem
        cardBody
        bordered
        button
        style={{flex: 1, height: 200}}
        onPress={() =>
          RootNavigation.navigate('ViewItem', {
            data,
            sub_category_id: props.route.params.id,
            item_id,
            category,
          })
        }>
        {thumbnailUrl === '' ? (
          <View 
            style={{
              flex: 1,
              height: 200,
              resizeMode: 'cover',
              backgroundColor: '#F0F0F0',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Thumbnail source={MARKET} small square/>
          </View>
        ) : (
          <Thumbnail
            square
            source={{uri: thumbnailUrl}}
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
          Stocks available:{' '}
          {stocksList.reduce((total, num) => {
            return total + parseInt(num);
          }, 0)}
        </Text>
      </CardItem>
    </Card>
  );
}

export default function ViewMarketItems(props) {
  const [isSearchBarVisible, setIsSearchBarVisible] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);
  const [headerText, setheaderText] = React.useState('');

  useEffect(() => {
    fetchItems();
  }, [props]);

  const fetchItems = () => {
    let {id} = props.route.params;
    setLoading(true);
    Market.getMarketItems(id, (_items) => {
      console.log(_items);
      _items[0] === null && _items.splice(0, 1);
      if (_items.length > 0) {
        setheaderText(`${_items[0].category} > ${_items[0].sub_category}`);
        let itemNames = _items.map((i) => i.item_name),
          itemsMap = [];
        itemNames = itemNames.filter((a, b) => itemNames.indexOf(a) === b);
        itemNames.map((item) => {
          itemsMap.push({
            item_name: item,
            item_id: _items.filter((i) => i.item_name === item)[0].item_id,
            data: _items.filter((i) => i.item_name === item),
            category: `${_items[0].category} > ${_items[0].sub_category}`,
          });
        });
        setItems(itemsMap);
        // alert(JSON.stringify(itemsMap, null, '\t'))
      }
      setLoading(false);
    });
  };

  const renderItems = ({item}) => {
    // console.warn(item);
    return <ListItem item={item} {...props} />;
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchItems} />
          }
          style={{paddingHorizontal: 20}}>
          {loading ? (
            <ActivityIndicator
              size="large"
              animating={true}
              color="black"
              style={{marginTop: hp('35%')}}
            />
          ) : (
            <View style={{paddingVertical: 20}}>
              <View style={{flexDirection: 'row', paddingBottom: 20}}>
                <Image
                  source={MARKET}
                  style={{
                    height: wp('15%'),
                    width: wp('15s%'),
                    resizeMode: 'contain',
                  }}
                />
                <View>
                  <Text style={[styles.textStyle, {fontSize: 20}]}>ITEMS</Text>
                  {isSearchBarVisible ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: wp('70%'),
                      }}>
                      <TextInput
                        value={keyword}
                        onChangeText={(value) => setKeyword(value)}
                        style={[
                          styles.textStyle,
                          {height: hp('4%'), padding: 0, width: wp('60%')},
                        ]}
                        placeholder="Search items..."
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setIsSearchBarVisible(false);
                          setKeyword('');
                        }}>
                        <Image source={CLOSE} style={{height: 15, width: 15}} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: wp('70%'),
                      }}>
                      <Text style={[styles.textStyle, {color: '#085DAD'}]}>
                        {headerText}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setIsSearchBarVisible(!isSearchBarVisible)
                        }>
                        <Image
                          source={SEARCH}
                          style={{height: 20, width: 20}}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              <FlatList
                data={
                  keyword !== ''
                    ? items.filter((i) =>
                        i.item_name.match(new RegExp(keyword, 'gmi')),
                      )
                    : items
                }
                renderItem={renderItems}
                listKey={(index) => `item${index}-${Date.now()}`}
                extraData={items}
                ListEmptyComponent={() =>
                  keyword !== '' && (
                    <Text
                      style={
                        (styles.textStyle,
                        {textAlign: 'center', marginVertical: 20})
                      }>
                      No item found
                    </Text>
                  )
                }
              />
            </View>
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
