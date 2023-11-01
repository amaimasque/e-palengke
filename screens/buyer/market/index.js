import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Container, Button, Text, Content} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';

import CategoryCard from './components/categorycard';
import CustomHeader from 'components/headers/sellerheader';
import Market from 'modules/Market';

const SAD = require('../../../assets/images/sad.png');

export default function ViewMarket(props) {
  const [dryMarket, setDryMarket] = useState([]);
  const [wetMarket, setWetMarket] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUSerType();
    getMarket();
  }, []);

  const getMarket = async () => {
    setLoading(true);
    let getDryMArket = await Market.getSaleMarketCategories(
      'dry_market',
      (data) => {
        // console.warn('Dry market', JSON.stringify(data));
        setDryMarket(data);
      },
    );

    let getWetMarket = await Market.getSaleMarketCategories(
      'wet_market',
      (data) => {
        setWetMarket(data.sort((a, b) => a.category_name > b.category_name));
      },
    );

    Promise.all([getDryMArket, getWetMarket]).then(() => {
      setLoading(false);
    });
  };

  const setUSerType = async () => {
    await AsyncStorage.setItem('USER_TYPE', 'buyer');
  };

  const renderCategory = ({item, index}) => {
    return <CategoryCard data={item} {...props} />;
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={getMarket} />
          }
          style={{flex: 1}}
          contentContainerStyle={styles.mainContainer}>
          {loading ? (
            <ActivityIndicator
              size="large"
              animating={true}
              color="black"
              style={{marginTop: hp('35%')}}
              />
          ) : (
            <View>
              {dryMarket.length == 0 && wetMarket.length == 0 && (
                <View style={{marginTop: hp('30%')}}>
                  <Image
                    source={SAD}
                    style={{
                      height: 100,
                      width: 100,
                      resizeMode: 'contain',
                      alignSelf: 'center',
                    }}
                  />
                  <Text
                    style={[
                      styles.textStyle,
                      {color: '#31C3E7', fontSize: 20},
                    ]}>
                    No items are on sale!
                  </Text>
                </View>
              )}
              {dryMarket.length > 0 && (
                <View
                  style={[
                    styles.rowStyle,
                    {
                      width: wp('85%'),
                    },
                  ]}>
                  <Text style={[styles.textStyle, {fontSize: 20}]}>
                    DRY MARKET
                  </Text>
                  <Button
                    onPress={() => props.navigation.navigate('MarketCategories', {data: 'dry_market'})}
                    full
                    rounded
                    small
                    style={[
                      styles.button,
                      {backgroundColor: '#8CC739', width: wp('25%')},
                    ]}>
                    <Text style={{fontFamily: 'Raleway-Light'}}>SEE ALL</Text>
                  </Button>
                </View>
              )}
              {dryMarket.map((item, index) => {
                return renderCategory({item, index});
              })}
              {/* <FlatList
                data={dryMarket}
                renderItem={renderCategory}
                extraData={[dryMarket]}
                keyExtractor={({index}) =>
                  `dryMarketCategory${index}-${Date.now()}`
                }
              /> */}
              {wetMarket.length > 0 && (
                <View
                  style={[
                    styles.rowStyle,
                    {
                      width: wp('85%'),
                      marginTop: hp('5%'),
                    },
                  ]}>
                  <Text style={[styles.textStyle, {fontSize: 20}]}>
                    WET MARKET
                  </Text>
                  <Button
                    onPress={() => props.navigation.navigate('MarketCategories', {data: 'wet_market'})}
                    full
                    rounded
                    small
                    style={[
                      styles.button,
                      {backgroundColor: '#8CC739', width: wp('25%')},
                    ]}>
                    <Text style={{fontFamily: 'Raleway-Light'}}>SEE ALL</Text>
                  </Button>
                </View>
              )}
              {wetMarket.map((item, index) => {
                return renderCategory({item, index});
              })}
              {/* <FlatList
                data={wetMarket}
                renderItem={renderCategory}
                extraData={[wetMarket]}
                keyExtractor={(index) =>
                  `wetMarketCategory${index}-${Date.now()}`
                }
              /> */}
            </View>
          )}
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    paddingVertical: hp('5%'),
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
    fontSize: 14,
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
