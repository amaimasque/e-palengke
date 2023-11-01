import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import {
  Container,
  Button,
  Text,
  Content,
  Thumbnail,
  Left,
  Right,
  Body,
  Title,
  Toast,
  Header,
  Item,
  Label,
  Input,
  Form,
  Footer,
  Picker,
  Icon,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import MultiSelect from 'react-native-multiple-select';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
var RNFS = require('react-native-fs');

import LoadingModal from 'components/loadingmodal';
import Market from 'modules/Market';
import Database from 'modules/Database';
import AsyncHelper from 'modules/AsyncHelper';
import StringHelper from 'modules/StringHelper';
import TermsModal from './components/termsmodal';

const ADD = require('assets/images/add.png');
const CARET = require('assets/images/caret.png');
const PHOTOS = require('assets/images/upload_photos.png');
const POLICY = require('assets/images/upload_policy.png');
const DELETE = require('assets/images/close.png');
const TAGS = [
  {
    id: '1',
    name: 'Cash only',
  },
  {
    id: '2',
    name: 'Open for delivery',
  },
  {
    id: '3',
    name: 'Dry Market',
  },
  {
    id: '4',
    name: 'Wet Market',
  },
  {
    id: '5',
    name: 'Paymaya',
  },
  {
    id: '6',
    name: 'Gcash',
  },
];

export default function AddItem(props) {
  const [isLoadingModalVisible, setLoadingModalVisibility] = useState(false);
  const [item, setItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState(0);
  const [selectedMeasurement, setMeasurement] = useState('');
  const [selectedTags, setTags] = useState([]);
  const [stocks, setStocks] = useState(0);
  const [isCategoryInputVisible, setCategoryInputVisibility] = useState(false);
  const [isTermsModalVisible, setTermsModalVisibility] = useState(false);
  const multiSelect = React.useRef(null);
  const [photos, setPhotos] = useState([]);
  const [termsAndPolicy, serttermsAndPolicy] = useState(null);
  const [mainCategory, setmainCategory] = useState('key0');
  const [subCategory, setsubCategory] = useState('key0');
  const [itemsList, setitemsList] = useState([]);
  const [subCategories, setsubCategories] = useState([]);
  const [refreshPhotos, setRefreshPhotos] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState('');

  useEffect(() => {
    Alert.alert(
      'Tips',
      'You may add your Gcash/Paymaya number in your account settings to enable faster transactions to buyers.',
    );
  }, []);

  let isButtonDisabled =
    itemName == '' ||
    price === 0 ||
    selectedMeasurement === '' ||
    stocks === 0 ||
    mainCategory === 'key0' ||
    subCategory === 'key0' || 
    (selectedTags.includes('2') && deliveryFee === '');

  const handlePrice = (value) => {
    value = value.replace(/[,-]/gi, '');
    setPrice(value.trim());
  };

  const handlePhotoSelection = async () => {
    const options = {
      quality: 1.0, // range is 0.1 - 1.0
      maxWidth: 800,
      maxHeight: 800,
      noData: true,
    };
    await ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        setPhotos(
          photos.concat({
            uri: response.uri,
            path: response.path,
            type: response.type,
          }),
        );
      }
    });
  };

  const handleRemovePhoto = (index) => {
    console.log('Test');
    let photosCopy = photos;
    photosCopy.splice(index, 1);
    setPhotos(photosCopy);
    setRefreshPhotos(!refreshPhotos);
  };

  const renderPhotos = ({item, index}) => {
    console.warn(item.uri);
    return (
      <View style={styles.photoContainer}>
        <Button
          rounded
          style={styles.deleteButton}
          onPress={() => handleRemovePhoto(index)}>
          <Image source={DELETE} style={styles.deleteIcon} />
        </Button>
        <Image source={{uri: item.uri}} style={styles.listPhoto} />
      </View>
    );
  };

  const handleAddItem = async () => {
    setLoadingModalVisibility(true);
    let id = await AsyncHelper.getItem('USER_ID');
    let photoURLs = [];
    let uploadPromises = photos.map(async (p) => {
      let lastIndex = p.path.lastIndexOf('.');
      let reference = `${id}/items/${StringHelper.generateID()}${
        lastIndex === -1 ? '.jpg' : p.path.slice(lastIndex)
      }`;
      photoURLs.push(reference);
      let url = await Market.uploadPhoto(p.path, reference);
      return url;
    });
    const resolvedFinalArray = await Promise.all(uploadPromises);
    if (resolvedFinalArray.every((i) => i) || photos.length === 0) {
      if (item === null) {
        try {
          await Market.addItemName(
            {
              category: StringHelper.toProperCase(
                mainCategory.replace('_', ' '),
              ),
              measurement: selectedMeasurement,
              name: itemName,
              sub_category: subCategories.filter((i) => i.id === subCategory)[0]
                .category_name,
              sub_category_id: subCategory,
            },
            (itemNameID) => {
              addItem(photoURLs, itemNameID).then(() =>
                setLoadingModalVisibility(false),
              );
            },
          );
        } catch (error) {
          console.warn('Error adding item', error.message);
          alert('Error adding item!');
          setLoadingModalVisibility(false);
        }
      } else {
        addItem(photoURLs).then(() => setLoadingModalVisibility(false));
      }
    }
  };

  const addItem = async (photoURLs, itemNameID = null) => {
    try {
      let id = await AsyncHelper.getItem('USER_ID');
      let userInfo = await AsyncHelper.getItem('USER_INFO');
      await Market.addSaleItem(subCategory, {
        item_id:
          item !== null
            ? itemsList.filter((i) => i.id === item.id)[0].id
            : itemNameID,
        item_name:
          item !== null
            ? itemsList.filter((i) => i.id === item.id)[0].name
            : itemName,
        sub_category: subCategories.filter((i) => i.id === subCategory)[0]
          .category_name,
        price,
        seller_id: id,
        shop_name: JSON.parse(userInfo).shop_name,
        stocks,
        sub_category: subCategories.filter((i) => i.id === subCategory)[0]
          .category_name,
        sub_category_id: subCategory,
        images: photoURLs,
        tags: TAGS.map((i) => selectedTags.includes(i.id) && i.name).filter(
          (i) => typeof i !== 'boolean',
        ),
        measurement: selectedMeasurement,
        main_category: mainCategory.replace('_', ' '),
        delivery_fee: deliveryFee,
      }).then(() => {
        Toast.show({
          text: 'Item added successfully!',
        });
        // setTimeout(() => {
        goBack();
        // }, 1000);
      });
    } catch (error) {
      console.warn('Error adding item', error.message);
      alert('Error adding item!');
    }
  };

  const goBack = () => {
    setItem(null);
    setItemName('');
    setPrice(0);
    setMeasurement('');
    setTags([]);
    setStocks(0);
    setPhotos([]);
    setRefreshPhotos(!refreshPhotos);
    setTags([]);
    setmainCategory('key0');
    setsubCategory('key0');
    setitemsList([]);
    setsubCategories([]);
    props.navigation.goBack(null);
  };

  const handleItemNameInputEndEditing = () => {
    Market.getSameItemName(itemName, (data) => {
      if (data.length > 0) {
        setItemName('');
        Toast.show({
          text: 'Item name already exists!',
        });
      }
    });
  };

  const handleMainCategoryChange = (value) => {
    setItem(null);
    setItemName('');
    setitemsList([]);
    setmainCategory(value);
    if (value !== mainCategory) {
      setsubCategory('');
      setsubCategories([]);
      Market.getSubcategoriesByMain(value, (data) => {
        data[0] === null && data.splice(0, 1);
        setsubCategories(
          data.sort((a, b) => a.category_name > b.category_name),
        );
      });
    }
  };

  const handleSubCategoryChange = (value) => {
    setsubCategory(value);
    if (value !== subCategory) {
      setItem(null);
      setItemName('');
      setitemsList([]);
      Market.getMarketItemListBySub(value, (data) => {
        console.warn('Sale items', data);
        setitemsList(data);
        data.length > 0 && setCategoryInputVisibility(false);
      });
    }
  };

  const handleItemNamePickerChange = (value) => {
    setItemName(value);
    setCategoryInputVisibility(false);
    if (value !== '') {
      let item = itemsList.filter((i) => i.id === value)[0];
      setItem(item);
      setMeasurement(item.measurement);
    } else {
      setItem(null);
    }
  };

  const handleDownload = async () => {
    let url = await Database.getDownloadURL('ep_terms_and_policies.pdf');
    // const supported = await Linking.canOpenURL(url);

    // if (supported) {
    //   await Linking.openURL(url);
    // } else {
    //   Alert.alert(`Don't know how to open this URL: ${url}`);
    // }
    if (url) {
      let downloadDest = `${RNFS.ExternalStorageDirectoryPath}/Download/ep_terms_policy.pdf`;
      RNFetchBlob.config({
        // fileCache: true,
        // android only options, these options be a no-op on IOS
        addAndroidDownloads: {
          // Show notification when response data transmitted
          notification: true,
          // Title of download notification
          title: 'ep_terms_policy.pdf',
          // File description (not notification description)
          description: 'Terms and policy for e-Palengke app.',
          mime: 'application/pdf',
          useDownloadManager: true,
          path: downloadDest,
          // Make the file scannable  by media scanner
          // mediaScannable: true,
        },
      })
        .fetch('GET', url)
        .then((res) => {
          Alert.alert(
            'Success',
            'Terms and policy document successfully downloaded! Please preview before submitting an item.',
          );
          RNFetchBlob.android.actionViewIntent(res.path(), '/');
        })
        .catch((e) => {
          Alert.alert(
            'Error',
            'File not successfully downloaded! Please contact adminstrator.',
          );
          console.warn(e.message);
        });
    }
  };

  return (
    <Container>
      {isLoadingModalVisible && (
        <LoadingModal visible={isLoadingModalVisible} />
      )}
      {isTermsModalVisible && (
        <TermsModal
          visible={isTermsModalVisible}
          onDismiss={() => setTermsModalVisibility(false)}
        />
      )}
      <Header style={{backgroundColor: 'white'}}>
        <Left>
          <Button transparent onPress={goBack}>
            <Thumbnail
              small
              square
              source={CARET}
              style={[styles.buttonIcon, {transform: [{rotateZ: '90deg'}]}]}
            />
          </Button>
        </Left>
        <Body>
          <Title style={styles.textStyle}>Add Item</Title>
        </Body>
        <Right>
          <Button transparent>
            <Text>Cancel</Text>
          </Button>
        </Right>
      </Header>
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView style={{padding: 20, flex: 1, paddingBottom: hp('5%')}}>
          <View>
            <Form>
              <Item picker>
                <Picker
                  mode="dropdown"
                  iosIcon={<Thumbnail source={CARET} small square />}
                  style={{width: undefined}}
                  textStyle={{fontFamily: 'Raleway-Light'}}
                  placeholder="Select main category"
                  placeholderStyle={{color: '#D0D2D2'}}
                  placeholderIconColor="#007aff"
                  selectedValue={mainCategory}
                  onValueChange={handleMainCategoryChange}>
                  <Picker.Item label="Select main category" value="key0" />
                  <Picker.Item label="Dry Market" value="dry_market" />
                  <Picker.Item label="Wet Market" value="wet_market" />
                </Picker>
              </Item>
              <Item picker style={{marginVertical: hp('2%')}}>
                <Picker
                  iosIcon={<Thumbnail source={CARET} small square />}
                  style={{width: undefined}}
                  textStyle={{fontFamily: 'Raleway-Light'}}
                  placeholder="Select subcategory"
                  placeholderStyle={{color: '#D0D2D2'}}
                  placeholderIconColor="#007aff"
                  selectedValue={subCategory}
                  onValueChange={handleSubCategoryChange}
                  mode="dialog">
                  <Picker.Item label="Select subcategory" value="key0" />
                  {subCategories.map((item) => {
                    return (
                      <Picker.Item label={item.category_name} value={item.id} />
                    );
                  })}
                </Picker>
              </Item>
              <View
                style={{
                  flexDirection: 'row',
                  display: itemsList.length === 0 ? 'none' : 'flex',
                }}>
                <Item picker style={{width: wp('100%') - 60}}>
                  <Picker
                    enabled={!isCategoryInputVisible}
                    mode="dropdown"
                    iosIcon={<Thumbnail source={CARET} small square />}
                    style={{width: undefined}}
                    textStyle={{fontFamily: 'Raleway-Light'}}
                    placeholder="Select item name or add new"
                    placeholderStyle={{color: '#D0D2D2'}}
                    placeholderIconColor="#007aff"
                    selectedValue={itemName}
                    onValueChange={handleItemNamePickerChange}>
                    <Picker.Item label="Select item name or add new" value="" />
                    {itemsList.map((item) => {
                      return <Picker.Item label={item.name} value={item.id} />;
                    })}
                  </Picker>
                </Item>
                <Button
                  transparent
                  onPress={() => {
                    setItem(null);
                    !isCategoryInputVisible && setItemName('');
                    setCategoryInputVisibility(!isCategoryInputVisible);
                  }}>
                  <Thumbnail
                    source={ADD}
                    small
                    square
                    style={[
                      styles.buttonIcon,
                      {
                        transform: [
                          {rotateZ: isCategoryInputVisible ? '45deg' : '0deg'},
                        ],
                      },
                    ]}
                  />
                </Button>
              </View>
              {(isCategoryInputVisible || itemsList.length === 0) && (
                <Item
                  stackedLabel
                  style={{marginLeft: 0}}
                  disabled={subCategory === 'key0'}>
                  <Label style={[styles.textStyle, {color: '#31C3E7'}]}>
                    New item name
                  </Label>
                  <Input
                    disabled={subCategory === 'key0'}
                    value={itemName}
                    onChangeText={(value) => setItemName(value)}
                    style={[styles.textStyle, {paddingVertical: 5}]}
                    onEndEditing={handleItemNameInputEndEditing}
                  />
                </Item>
              )}
              <Item
                error={isNaN(parseInt(stocks))}
                stackedLabel
                style={{marginLeft: 0}}>
                <Label style={[styles.textStyle, {color: '#31C3E7'}]}>
                  Number of stocks
                </Label>
                <Input
                  value={stocks.toString()}
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    setStocks(value.replace(/[,-.]/gi, '').trim())
                  }
                  style={[styles.textStyle, {paddingVertical: 5}]}
                />
              </Item>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Item
                  error={isNaN(parseFloat(price))}
                  stackedLabel
                  style={{width: wp('60%') - 40, marginLeft: 0}}>
                  <Label style={[styles.textStyle, {color: '#31C3E7'}]}>
                    Price
                  </Label>
                  <Input
                    value={price.toString()}
                    onChangeText={handlePrice}
                    keyboardType="number-pad"
                    style={[styles.textStyle, {paddingVertical: 5}]}
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
                <Item picker style={{width: wp('30%'), alignSelf: 'flex-end'}}>
                  <Picker
                    enabled={item === null}
                    mode="dropdown"
                    iosIcon={<Thumbnail source={CARET} small square />}
                    style={{width: undefined}}
                    textStyle={{fontFamily: 'Raleway-Light'}}
                    placeholder="kg..."
                    placeholderStyle={{color: '#D0D2D2'}}
                    placeholderIconColor="#007aff"
                    selectedValue={selectedMeasurement}
                    onValueChange={(value) => setMeasurement(value)}>
                    <Picker.Item label="" value="" />
                    <Picker.Item label="kg" value="kg" />
                    <Picker.Item label="g" value="g" />
                    <Picker.Item label="l" value="l" />
                    <Picker.Item label="ml" value="ml" />
                    <Picker.Item label="pc" value="pc" />
                  </Picker>
                </Item>
              </View>
            </Form>
            <MultiSelect
              styleMainWrapper={{marginVertical: 10}}
              items={TAGS}
              uniqueKey="id"
              ref={multiSelect}
              onSelectedItemsChange={async (value) => {
                let userInfo = JSON.parse(
                  await AsyncHelper.getItem('USER_INFO'),
                );
                if (value.includes('1') && (value.includes('5') || value.includes('6'))) {
                  value.splice(value.indexOf('1'), 1);
                  Toast.show({
                    text:
                      'Cash only is disabled when Paymaya/Gcash options are selected!',
                  });
                }
                if (userInfo.paymaya_number === '' && value.includes('5')) {
                  value.splice(value.indexOf('5'), 1);
                  Toast.show({
                    text:
                      'Please input your Payamaya number in the account settings!',
                  });
                }
                if (userInfo.gcash_number === '' && value.includes('6')) {
                  value.splice(value.indexOf('6'), 1);
                  Toast.show({
                    text:
                      'Please input your Gcash number in the account settings!',
                  });
                }
                console.warn(value);
                setTags(value);
              }}
              selectedItems={selectedTags}
              selectText="Tags"
              searchInputPlaceholderText="Search Items..."
              onChangeInput={(text) => console.log(text)}
              altFontFamily="ProximaNova-Light"
              tagRemoveIconColor="#CCC"
              tagBorderColor="#CCC"
              tagTextColor="#CCC"
              selectedItemTextColor="#CCC"
              selectedItemIconColor="#CCC"
              itemTextColor="#000"
              displayKey="name"
              searchInputStyle={{color: '#CCC'}}
              submitButtonColor="#CCC"
              submitButtonText="Submit"
              itemFontFamily="Raleway-Light"
              selectedItemFontFamily="Raleway-Light"
              searchInputStyle={{fontFamily: 'Raleway-Light'}}
            />
            {
              selectedTags.includes('2') && (
                <Item
                  error={isNaN(parseInt(deliveryFee))}
                  stackedLabel
                  style={{marginLeft: 0}}>
                  <Label style={[styles.textStyle, {color: '#31C3E7'}]}>
                    Delivery fee
                  </Label>
                  <Input
                    value={deliveryFee.toString()}
                    keyboardType="number-pad"
                    onChangeText={(value) =>
                      setDeliveryFee(value.replace(/[,-.]/gi, '').trim())
                    }
                    style={[styles.textStyle, {paddingVertical: 5}]}
                  />
                </Item>
              )
            }
            <Button
              onPress={handlePhotoSelection}
              iconRight
              light
              bordered
              full
              style={{marginVertical: 10, marginTop: 20}}>
              <Text style={styles.textStyle}>
                {photos.length > 0 ? 'Add More Photos' : 'Upload Photos'}
              </Text>
              <Thumbnail
                source={PHOTOS}
                small
                square
                style={styles.buttonIcon}
              />
            </Button>
            <FlatList
              data={photos}
              renderItem={renderPhotos}
              horizontal
              extraData={refreshPhotos}
            />
            <Button
              iconRight
              light
              bordered
              full
              style={{marginVertical: 10}}
              onPress={() => setTermsModalVisibility(true)}>
              <Text style={styles.textStyle}>View Terms & Policy</Text>
              <Icon
                name={'eye-outline'}
                small
                square
                color='black'
                fontSize={20}
              />
            </Button>
            <Button
              iconRight
              light
              bordered
              full
              style={{marginVertical: 10, marginBottom: hp('5%')}}
              onPress={handleDownload}>
              <Text style={styles.textStyle}>Download Terms & Policy</Text>
              <Thumbnail
                source={POLICY}
                small
                square
                style={styles.buttonIcon}
              />
            </Button>
          </View>
        </ScrollView>
      </Content>
      <Footer style={{backgroundColor: 'white	', paddingVertical: 5}}>
        <Button
          disabled={isButtonDisabled}
          rounded
          style={[
            styles.saveButton,
            {
              backgroundColor: isButtonDisabled ? '#ADB6B5' : '#31C3E7',
              opacity: isButtonDisabled ? 0.5 : 1,
            },
          ]}
          onPress={handleAddItem}>
          <Text
            style={{
              alignSelf: 'center',
              color: isButtonDisabled ? 'black' : 'white',
            }}>
            Save
          </Text>
        </Button>
      </Footer>
    </Container>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    width: wp('90%'),
    alignItems: 'center',
    justifyContent: 'center',
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
  photoContainer: {
    width: wp('35%'),
    height: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    marginRight: wp('3%'),
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    height: wp('7%'),
    width: wp('7%'),
    padding: wp('2%'),
    backgroundColor: '#21BEDE',
    zIndex: 5,
  },
  deleteIcon: {
    width: wp('3%'),
    height: wp('3%'),
    resizeMode: 'contain',
  },
  listPhoto: {
    width: wp('35%'),
    height: wp('35%'),
    resizeMode: 'cover',
  },
});
