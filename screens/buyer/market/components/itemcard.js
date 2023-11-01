import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Text,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import Market from 'modules/Market';
import * as RootNavigation from 'modules/RootNavigation';

export default function ItemCard(props) {
  const [thumbnail, setThumbnail] = useState('');
  let {data} = props;
  let {id, name, stocks, sub_category_id} = data;

  useEffect(() => {
    Market.getMarketItems(sub_category_id, (data) => {
      if (data.length > 0) {
        data = data.filter((i) => i.item_id === id);
        for (let index = 0; index < data.length; index++) {
          if (
            data[index].images !== undefined &&
            data[index].images.length > 0
          ) {
            fetchThumbnail(data[index].images[0]);
            break;
          } else continue;
        }
      }
      // alert(JSON.stringify(data));
    });
  }, []);

  const fetchThumbnail = async (item) => {
    try {
      let url = await Market.getDownloadURL(item);
      // console.warn(url);
      await setThumbnail(url);
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        RootNavigation.navigate('ViewItem', {
          sub_category_id,
          item_id: id,
        })
      }>
      <ImageBackground source={{uri: thumbnail}} style={styles.thumbnail}>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.textStyle,
              {textAlign: 'center'},
            ]}>{`${name}\n(${stocks})`}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
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
  thumbnail: {
    height: wp('37.5%'),
    width: wp('37.5%'),
    backgroundColor: '#F0F0F0',
    margin: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    // backgroundColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'white',
    elevation: 5,
    width: wp('37.5%'),
    paddingVertical: 10,
  },
});
