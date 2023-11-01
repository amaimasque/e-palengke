import React, {useState, useEffect} from 'react';
import {
  FlatList,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Container, Text, Content} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import Market from 'modules/Market';
import RootNavigation from 'modules/RootNavigation';
import CustomHeader from 'components/headers/sellerheader';

function SearchedItem(props) {
  const [thumbnail, setThumbnail] = useState('');
  let {item} = props;
  let {
    images,
    item_name,
    shop_name,
    stocks,
    measurement,
    price,
    sub_category_id,
    item_id,
  } = item;

  useEffect(() => {
    if (images.length > 0) {
      fetchThumbnail();
    }
  }, []);

  const fetchThumbnail = async () => {
    let url = await Market.getDownloadURL(images[0]);
    setThumbnail(url);
  };

  return (
    <TouchableOpacity
      onPress={() =>
        props.navigation.navigate('ViewItem', {
          sub_category_id,
          item_id,
        })
      }
      style={{flexDirection: 'row', paddingVertical: hp('2%')}}>
      <Image source={{uri: thumbnail}} style={styles.searchedItemThumbnail} />
      <View style={styles.infoContainer}>
        <View style={{ustifyContent: 'center'}}>
          <Text style={[styles.textStyle, {color: '#21BEDE'}]}>
            {item_name}
          </Text>
          <Text style={[styles.textStyle, {fontSize: 10}]}>
            From {shop_name}
          </Text>
        </View>
        <View>
          <Text style={[styles.textStyle]}>
            {price}/{measurement}
          </Text>
          <Text style={[styles.textStyle, {fontSize: 10}]}>
            Stocks available: {stocks}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
export default function SearchItem(props) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let {keyword} = props.route.params;
    keyword &&
      Market.getSearchedSaleItem(keyword, (data) => {
        setItems(data);
      });
  }, [props]);

  const renderSearchList = ({item}) => {
    return <SearchedItem item={item} {...props} />;
  };

  return (
    <Container>
      <CustomHeader {...props} />
      <Content>
        <FlatList
          data={items}
          renderItem={renderSearchList}
          keyExtractor={({index}) => `searchListItem${index}-${Date.now()}`}
          contentContainerStyle={{paddingHorizontal: wp('5%')}}
          ItemSeparatorComponent={() => (
            <View
              style={{borderBottomColor: '#ADB6B5', borderBottomWidth: 1}}
            />
          )}
        />
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
  searchedItemThumbnail: {
    width: wp('30%'),
    height: hp('10%'),
    resizeMode: 'contain',
    backgroundColor: '#ADB6B5',
  },
  infoContainer: {
    marginLeft: wp('3%'),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('55%'),
  },
});
