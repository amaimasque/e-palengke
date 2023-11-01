import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Container, Text, Content, Card} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import CustomHeader from 'components/headers/sellerheader';
import Market from 'modules/Market';

const MARKET = require('../../../assets/images/items.png');
const SEARCH = require('../../../assets/images/search2.png');
const CARET = require('../../../assets/images/caret.png');
const CLOSE = require('../../../assets/images/close.png');

export default function Categories(props) {
  const [marketType, setMarketType] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  // useEffect(() => {
  //   const backAction = () => {
  //     props.navigation.dispatch(DrawerActions.closeDrawer());
  //     props.navigation.goback()
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );

  //   return () => backHandler.remove();
  // }, []);

  useEffect(() => {
    let {data} = props.route.params;
    setMarketType(data.replace('_', ' ').toUpperCase());
    setLoading(true);
    Market.getSaleMarketCategories(data, (_items) => {
      console.log(_items);
      setItems(_items);
      setLoading(false);
    });
  }, [props]);

  const renderList = ({item, index}) => {
    let {category_name, stocks, id} = item;
    console.log(item)
    return (
      <TouchableOpacity
        onPress={() => props.navigation.navigate('MarketItems', {id})}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 10,
        }}>
        <Text style={styles.textStyle}>{category_name}</Text>
        <Image
          source={CARET}
          style={{height: 15, width: 15, transform: [{rotateZ: '-90deg'}]}}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={styles.mainContainer}>
          <View style={{width: wp('85%'), alignItems: 'center'}}>
            <Image
              source={MARKET}
              style={{height: 40, width: 40, resizeMode: 'contain'}}
            />
            <Text style={[styles.textStyle, {fontSize: 20, color: '#085DAD'}]}>
              {marketType}
            </Text>
            <Card
              style={{
                borderRadius: 20,
                width: wp('85%'),
                marginTop: 20,
              }}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  animating={true}
                  color="black"
                  style={{marginVertical: 20}}
                />
              ) : (
                <View style={{padding: wp('5%')}}>
                  {isSearchBarVisible ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <TextInput
                        value={keyword}
                        onChangeText={(value) => setKeyword(value)}
                        style={[
                          styles.textStyle,
                          {width: wp('60%'), height: hp('3%'), padding: 0},
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
                        alignItems: 'center',
                      }}>
                      <Text style={[styles.textStyle, {color: '#21BEDE'}]}>
                        Categories
                      </Text>
                      <TouchableOpacity
                        onPress={() => setIsSearchBarVisible(true)}>
                        <Image
                          source={SEARCH}
                          style={{height: 20, width: 20}}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                  <FlatList
                    data={
                      keyword !== ''
                        ? items.filter((i) =>
                            i.category_name.match(new RegExp(keyword, 'gmi')),
                          )
                        : items
                    }
                    renderItem={renderList}
                    listKey={(index) => `category${index}-${Date.now()}`}
                    ItemSeparatorComponent={() => (
                      <View
                        style={{
                          borderBottomColor: '#rgb(173,182,181)',
                          borderBottomWidth: 1,
                        }}
                      />
                    )}
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
            </Card>
          </View>
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'Raleway-Light',
    color: '#26A8D7',
    textAlign: 'center',
  },
  itemButton: {
    flexDirection: 'column',
    height: hp('20%'),
    width: wp('40%'),
    margin: 5,
    justifyContent: 'center',
    padding: 5,
  },
  mainContainer: {
    alignItems: 'center',
    paddingVertical: hp('5%'),
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
    fontSize: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
