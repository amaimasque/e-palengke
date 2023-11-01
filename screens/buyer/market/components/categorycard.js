import React, {useEffect, useState} from 'react';
import {View, FlatList, ActivityIndicator, StyleSheet} from 'react-native';
import {Button, Text, Card} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import ItemCard from './itemcard';

import StringHelper from 'modules/StringHelper';
import Market from 'modules/Market';

export default function CategoryCard(props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(true);
  let {data} = props;
  let {id, category_name} = data;

  useEffect(() => {
    Market.getMarketItemList(id, (_items) => {
      console.log(category_name, JSON.stringify(_items))
      setItems(_items);
      setLoading(false);
    });
  }, [data]);

  const renderItem = ({item, index}) => {
    // console.log(category_name, item)
    return (
      <ItemCard
        data={item}
      />
    );
  };

  return (
    <Card style={styles.cardStyle}>
      <View style={[styles.rowStyle, styles.cardHeaderContainer]}>
        <Text style={[styles.textStyle, {fontSize: 16}]}>
          {StringHelper.toProperCase(category_name)}
        </Text>
        <Button
          onPress={() => props.navigation.navigate('MarketItems', {id})}
          full
          rounded
          small
          style={[
            styles.button,
            {backgroundColor: '#21BEDE', width: wp('20%')},
          ]}>
          <Text style={{fontFamily: 'Raleway-Light', fontSize: 10}}>
            SEE ALL
          </Text>
        </Button>
      </View>
      <View style={styles.cardContent}>
        {loading ? (
          <ActivityIndicator
            size="large"
            animating={true}
            color="white"
            style={{}}
          />
        ) : (
          <FlatList
            horizontal
            data={items}
            renderItem={renderItem}
            listKey={(index) => `item${index}-${Date.now()}`}
            extraData={[items, refresh]}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
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
  cardStyle: {
    borderRadius: 20,
    height: hp('29%'),
    overflow: 'hidden',
  },
  cardHeaderContainer: {
    width: wp('85%'),
    padding: 10,
  },
  cardContent: {
    backgroundColor: '#ADB6B5',
    height: wp('43%'),
    width: wp('85%'),
    justifyContent: 'center',
  },
});
