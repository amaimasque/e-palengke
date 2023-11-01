import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Thumbnail, Card, CardItem, DeckSwiper, Button, Icon, Text} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import Market from 'modules/Market';

export default function ImageViewerModal(props) {
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [images, setImages] = useState([]);
  const _deckSwiper = useRef(null);
  let {visible, imageList, onDismiss} = props;

  useEffect(() => {
    imageList.length > 0 && fetchImages(imageList);
  }, [props]);

  const fetchImages = async (_images) => {
    setIsImagesLoading(true);
    let imagesCopy = [];
    // console.warn(_images)
    for (let index = 0; index < _images.length; index++) {
      let url = await Market.getDownloadURL(_images[index]);
      console.log(url);
      await imagesCopy.push(url);
    }
    setImages(imagesCopy);
    setIsImagesLoading(false);
  };

  return (
    <Modal
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
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        {isImagesLoading ? (
          <ActivityIndicator
            size="large"
            animating={true}
            color="white"
          />
        ) : (
          <View style={{width: wp('90%'), height: hp('55%')}}>
            <DeckSwiper
              useNativeDriver={true}
              looping
              ref={_deckSwiper}
              dataSource={images}
              renderEmpty={() => (
                <View style={{alignSelf: 'center'}}>
                  {/* <Text>Over</Text> */}
                </View>
              )}
              renderItem={(item) => (
                <Card style={{elevation: 3}}>
                  <CardItem
                    cardBody
                    bordered
                    style={{flex: 1, height: hp('50%')}}>
                    <Thumbnail
                      square
                      source={{uri: item}}
                      style={{
                        flex: 1,
                        height: hp('35%'),
                        resizeMode: 'cover',
                      }}
                    />
                  </CardItem>
                </Card>
              )}
            />
            <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: hp('53%')}}>
              <Button onPress={() => _deckSwiper.current?._root.swipeLeft()}>
                <Icon name="arrow-back" />
              </Button>
              <Button onPress={() => _deckSwiper.current?._root.swipeRight()}>
                <Icon name="arrow-forward" />
              </Button>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({});
