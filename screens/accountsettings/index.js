import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, TextInput, Alert} from 'react-native';
import {
  Container,
  Button,
  Text,
  Content,
  Thumbnail,
  Body,
  Item,
  Label,
  Toast,
  Card,
  CardItem,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Table, Row, Rows} from 'react-native-table-component';
import ImagePicker from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';

import CustomHeader from 'components/headers/sellerheader';
import ChangePasswordModal from 'components/changepasswordmodal';

import StringHelper from 'modules/StringHelper';
import Database from 'modules/Database';
import AsyncHelper from 'modules/AsyncHelper';
import * as RootNavigation from 'modules/RootNavigation';

const DELETE = require('assets/images/trash.png');
const SAD = require('assets/images/sad.png');
const transactionHeaders = ['Date', 'Action'];

export default function AccountSettings(props) {
  const [userLogs, setUserLogs] = useState([]);
  const [sortedUserLogs, setSortedUserLogs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [emailAddress, setemailAddress] = useState('');
  const [password, setpassword] = useState('');
  const [paymayaNumber, setpaymayaNumber] = useState('');
  const [gcashNumber, setgcashNumber] = useState('');
  const [userID, setuserID] = useState('');
  const [profilePic, setprofilePic] = useState('');
  const [accountType, setaccountType] = useState('');
  const [shopName, setshopName] = useState('');
  const [provider, setProvider] = useState('');

  const [accountNumberVerified, setaccountNumberVerified] = useState(false);
  const [
    isChangePasswordModalVisible,
    setisChangePasswordModalVisible,
  ] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchUserLogs();
    setProvider(auth().currentUser.providerData[0]?.providerId);
  }, []);

  const fetchUserInfo = async () => {
    try {
      let id = await AsyncHelper.getItem('USER_ID');
      let type = await AsyncHelper.getItem('ACCOUNT_TYPE');
      setaccountType(type);
      if (id) {
        setuserID(id);
        await Database.getUserInfo(id, async (data) => {
          if (data) {
            setUserInfo(data);
            setfirstName(data.first_name);
            setlastName(data.last_name);
            setemailAddress(data.email_address);
            setpassword(data.password);
            setgcashNumber(data.gcash_number);
            setpaymayaNumber(data.paymaya_number);
            setaccountNumberVerified(data.is_account_number_verified);
            setshopName(data.shop_name);
            console.log('Profile', data.profile_pic);
            if (data.profile_pic !== '') {
              let url = await Database.getDownloadURL(data.profile_pic);
              console.warn('Download url', url);
              setprofilePic(url);
            }
          }
        });
      }
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  const fetchUserLogs = async () => {
    try {
      let id = await AsyncHelper.getItem('USER_ID');
      if (id) {
        await Database.getUserLogs(id, (data) => {
          if (data.length > 0) {
            setUserLogs(data);
            let sortedUserLogsCopy = [];
            data.map((item) => {
              console.warn(item);
              sortedUserLogsCopy.push([
                StringHelper.formatDate(item.date, 'MMMM D, YYYY h:mm A'),
                item.action,
              ]);
            });
            setSortedUserLogs(sortedUserLogsCopy);
          }
        });
      }
    } catch (error) {
      console.warn('Error', error.message);
    }
  };

  const showToast = (text) => {
    Toast.show({
      text,
      buttonText: 'OK',
    });
  };

  const handleChangePassword = (data) => {
    setisChangePasswordModalVisible(false);
    Database.updateUserByID(userID, {
      password: data,
    }).then(() => {
      showToast('Password has been successfully updated');
    });
  };

  const handleChangeProfile = async () => {
    let id = await AsyncHelper.getItem('USER_ID');
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
        let lastIndex = response.path.lastIndexOf('.');
        console.warn('Image type', response.path.slice(lastIndex));
        let reference = `${id}/${StringHelper.generateID()}${response.path.slice(
          lastIndex,
        )}`;
        setprofilePic(response);
        Database.uploadPhoto(response.path, reference, async () => {
          handleChangeInfo({profile_pic: reference});
          let url = await Database.getDownloadURL(reference);
          console.warn('Download url', url);
          setprofilePic(url);
        });
      }
    });
  };

  const handleChangeInfo = async (data) => {
    let id = await AsyncHelper.getItem('USER_ID');
    await Database.updateUserByID(id, data).then(async () => {
      let info = await AsyncHelper.getItem('USER_INFO');
      let parsedInfo = JSON.parse(info);
      parsedInfo = {...parsedInfo, ...data};
      await AsyncHelper.setItem('USER_INFO', JSON.stringify(parsedInfo));
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm',
      'This action is irreversible! Are you sure you want to delete your account?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            let id = await AsyncHelper.getItem('USER_ID');
            Database.deleteAuthUser(() => {
              Database.logout();
            });
            Database.deleteUserAccount(id);
            Database.deleteFiles(id);
            RootNavigation.reset('Login');
          },
        },
      ],
    );
  };
  return (
    <Container>
      {isChangePasswordModalVisible && (
        <ChangePasswordModal
          visible={isChangePasswordModalVisible}
          onDismiss={() => setisChangePasswordModalVisible(false)}
          onPressContinue={handleChangePassword}
          oldPassword={password}
        />
      )}
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} style={{padding: 20}}>
          <Button
            onPress={handleChangeProfile}
            transparent
            style={[
              styles.profileIcon,
              {alignSelf: 'center', marginVertical: 20},
            ]}>
            <Thumbnail
              circle
              source={{
                uri:
                  profilePic === '' || typeof profilePic === 'string'
                    ? profilePic
                    : profilePic.uri,
              }}
              style={styles.profileIcon}
            />
          </Button>
          <Card>
            <CardItem>
              <Body>
                <Text style={[styles.textStyle, {fontSize: 18}]}>
                  Account Information
                </Text>
                <Item fixedLabel>
                  <Label style={[styles.textStyle]}>First Name</Label>
                  <TextInput
                    style={[styles.textStyle, {width: wp('60%')}]}
                    value={firstName}
                    onChangeText={(value) => setfirstName(value)}
                    onEndEditing={() => {
                      handleChangeInfo({
                        first_name: firstName,
                      });
                    }}
                  />
                </Item>
                <Item fixedLabel>
                  <Label style={[styles.textStyle]}>Last Name</Label>
                  <TextInput
                    style={[styles.textStyle, {width: wp('60%')}]}
                    value={lastName}
                    onChangeText={(value) => setlastName(value)}
                    onEndEditing={() => {
                      handleChangeInfo({
                        last_name: lastName,
                      });
                    }}
                  />
                </Item>
                <Item
                  fixedLabel
                  onPress={() =>
                    Toast.show({text: 'Email address cannot be edited!'})
                  }>
                  <Label style={styles.textStyle}>Email Address</Label>
                  <TextInput
                    editable={false}
                    style={[styles.textStyle, {width: wp('60%')}]}
                    value={emailAddress}
                    onChangeText={(value) => setemailAddress(value)}
                    onEndEditing={() => {
                      Database.checkUserExist((data) => {
                        if (data === null) {
                          handleChangeInfo({
                            email_address: emailAddress,
                          });
                        } else {
                          showToast('Email is already taken!');
                          setemailAddress(userInfo.email_address);
                        }
                      }, emailAddress);
                    }}
                  />
                </Item>
                <Button
                  onPress={() =>
                    provider !== 'password'
                      ? Alert.alert(
                          'Error',
                          'Accout is binded on Facebook, cannot setup password!',
                        )
                      : setisChangePasswordModalVisible(true)
                  }
                  full
                  rounded
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        provider !== 'password' ? '#ADB6B5' : '#21BEDE',
                      marginTop: 20,
                    },
                  ]}>
                  <Text style={{fontFamily: 'Raleway-Light'}}>
                    Change password
                  </Text>
                </Button>
                <Button
                  full
                  rounded
                  onPress={handleDeleteAccount}
                  style={[
                    styles.button,
                    {backgroundColor: '#8CC739', marginBottom: 20},
                  ]}>
                  <Text style={{fontFamily: 'Raleway-Light'}}>
                    Delete Account
                  </Text>
                </Button>

                {accountType === 'seller' && (
                  <View style={{width: wp('78%')}}>
                    <Text
                      style={[
                        styles.textStyle,
                        {
                          fontSize: 18,
                        },
                      ]}>
                      Shop Information
                    </Text>
                    <Item fixedLabel>
                      <Label style={styles.textStyle}>Shop name</Label>
                      <TextInput
                        style={[styles.textStyle, {width: wp('60%')}]}
                        value={shopName}
                        onChangeText={(value) => setshopName(value)}
                        onEndEditing={() => {
                          handleChangeInfo({
                            shop_name: shopName,
                          });
                        }}
                      />
                    </Item>
                    <Text style={[styles.textStyle, {fontSize: 18}]}>
                      Payment Information
                    </Text>
                    <Item fixedLabel>
                      <Label style={styles.textStyle}>Paymaya No.</Label>
                      <TextInput
                        placeholder="09*********"
                        keyboardType="number-pad"
                        style={[styles.textStyle, {width: wp('50%')}]}
                        value={paymayaNumber}
                        onChangeText={(value) =>
                          setpaymayaNumber(value.replace(/[^A-Z0-9]/gi, ''))
                        }
                        onEndEditing={() => {
                          handleChangeInfo({
                            paymaya_number: paymayaNumber.trim(),
                          });
                        }}
                      />
                    </Item>
                    <Item fixedLabel>
                      <Label style={styles.textStyle}>Gcash No.</Label>
                      <TextInput
                        placeholder="09*********"
                        keyboardType="number-pad"
                        style={[styles.textStyle, {width: wp('50%')}]}
                        value={gcashNumber}
                        onChangeText={(value) =>
                          setgcashNumber(value.replace(/[^A-Z0-9]/gi, ''))
                        }
                        onEndEditing={() => {
                          handleChangeInfo({
                            gcash_number: gcashNumber.trim(),
                          });
                        }}
                      />
                    </Item>
                  </View>
                )}
              </Body>
            </CardItem>
          </Card>
          <Card style={{marginBottom: 40}}>
            <CardItem>
              <Body>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: wp('83%'),
                  }}>
                  <Text style={[styles.textStyle, {fontSize: 18}]}>
                    User Logs
                  </Text>
                  <Button
                    transparent
                    onPress={() => {
                      Database.deleteUserLogs(userLogs).then(() =>
                        Toast.show({text: 'User logs deleted'}),
                      );
                      setSortedUserLogs([]);
                      fetchUserLogs();
                    }}>
                    <Thumbnail
                      source={DELETE}
                      small
                      square
                      style={styles.buttonIcon}
                    />
                  </Button>
                </View>
                <ScrollView
                  horizontal
                  nestedScrollEnabled={true}
                  style={{flex: 1}}>
                  {sortedUserLogs.length > 0 ? (
                    <View style={{marginVertical: 10}}>
                      <Table
                        borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                        <Row
                          data={transactionHeaders}
                          style={styles.head}
                          textStyle={[
                            styles.textStyle,
                            {textAlign: 'center', width: 150},
                          ]}
                        />
                        <Rows
                          data={sortedUserLogs}
                          textStyle={[
                            styles.textStyle,
                            {textAlign: 'center', width: 150},
                          ]}
                        />
                      </Table>
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Thumbnail
                        source={SAD}
                        large
                        square
                        style={styles.emptyIcon}
                      />
                      <Text style={[styles.textStyle, {color: '#00ACEA'}]}>
                        NO LOGS
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </Body>
            </CardItem>
          </Card>
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
  profileIcon: {
    backgroundColor: 'grey',
    width: wp('50%'),
    height: wp('50%'),
    borderRadius: wp('25%'),
  },
  headerInput: {
    borderColor: '#085DAD',
    marginVertical: 5,
    height: 30,
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
    fontSize: 14,
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
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('100%') - 80,
    height: hp('60%'),
  },
  emptyIcon: {
    width: wp('30%'),
    height: wp('30%'),
    resizeMode: 'contain',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
});
