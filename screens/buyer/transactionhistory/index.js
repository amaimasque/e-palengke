import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
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
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Table, Row} from 'react-native-table-component';

import CustomHeader from 'components/headers/sellerheader';
import StringHelper from 'modules/StringHelper';
import TransactionHistory from 'modules/TransactionHistory';
import AsyncHelper from 'modules/AsyncHelper';
import InformationModal from './components/viewinfomodal';

const CARET = require('assets/images/caret2.png');
const SEARCH = require('assets/images/search.png');
const SAD = require('assets/images/sad.png');

const transactionHeaders = [
  'Date',
  'Transaction ID',
  'Total Price',
  'Items',
  'Customer Name',
  'Payment Method',
];

export default function Items(props) {
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [sortedTransactions, setSortedTransactions] = useState([]);
  const [isInfoModalVisible, setInfoModalVisiblity] = useState(false);
  const [selectedRowIndex, setRowIndex] = useState(0);
  // useEffect(() => {
  //   viewTransactions();
  // }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setSortedTransactions([]);
    let accountType = await AsyncHelper.getItem('ACCOUNT_TYPE'),
      userID = await AsyncHelper.getItem('USER_ID');
    TransactionHistory.getTransactions(accountType, userID, (data) => {
      // console.warn(JSON.stringify(data, null, '\t'));
      setTransactions(data);
      setSortedTransactions(data);
      // let sortedTransactionsCopy = [];
      // transactions.map((i) => {
      //   sortedTransactionsCopy.push([
      //     StringHelper.formatDate(i.date, 'MMMM D, YYYY, h:mm A'),
      //     i.id,
      //     i.total_price,
      //     i.total_items,
      //     StringHelper.toProperCase(
      //       `${i.buyer_first_name} ${i.buyer_last_name}`,
      //     ),
      //     StringHelper.toProperCase(i.payment_method),
      //   ]);
      // });
      // setSortedTransactions([...sortedTransactionsCopy]);
    });
  };

  useEffect(() => {
    // switch (filter) {
    //   case 'wet_market':
    //   case 'dry_market':
    //     return setSortedTransactions([
    //       ...transactions.filter((i) =>
    //         i.sub_category_id.match(new RegExp(filter, 'gmi')),
    //       ),
    //     ]);
    //   default:
    //     setSortedTransactions([...transactions]);
    // }
    setSortedTransactions([...transactions]);
  }, [filter]);

  useEffect(() => {
    if (filter !== 'key0' && keyword !== '') {
      setSortedTransactions([
        ...transactions.filter((i) =>
          i[filter].match(new RegExp(keyword, 'gmi')),
        ),
      ]);
      // }
    } else {
      setSortedTransactions([...transactions]);
    }
  }, [keyword]);

  return (
    <Container>
      <CustomHeader {...props} />
      <Content contentContainerStyle={{flex: 1}}>
				{isInfoModalVisible && (
          <InformationModal
            visible={isInfoModalVisible}
            onDismiss={() => {
              setInfoModalVisiblity(false);
						}}
						data={transactions[selectedRowIndex]}
          />
        )}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchTransactions} />
          }
          showsVerticalScrollIndicator={false}
          style={{paddingHorizontal: 20, paddingTop: 20}}>
          <Text style={[styles.textStyle, {fontSize: 20}]}>
            TRANSACTION HISTORY
          </Text>
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
                onValueChange={(value) => setFilter(value)}
                mode="dialog">
                <Picker.Item label="All" value="key0" />
                <Picker.Item label="Date" value="date" />
                <Picker.Item label="Payment Method" value="payment_method" />
                <Picker.Item label="Item" value="item_name" />
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
                onChangeText={(value) => setKeyword(value)}
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
          <ScrollView horizontal nestedScrollEnabled={true} style={{flex: 1}}>
            {sortedTransactions.length > 0 ? (
              <View style={styles.container}>
                <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                  <Row
                    data={transactionHeaders}
                    style={styles.head}
                    textStyle={[
                      styles.textStyle,
                      {textAlign: 'center', width: 150},
                    ]}
                  />
                  {sortedTransactions.map((i, index) => {
                    let item = [
                      StringHelper.formatDate(i.date, 'MMMM D, YYYY, h:mm A'),
                      i.id,
                      i.total_price,
                      i.total_items,
                      StringHelper.toProperCase(
                        `${i.buyer_first_name} ${i.buyer_last_name}`,
                      ),
                      StringHelper.toProperCase(i.payment_method),
                    ];
                    return (
                      <Row
                        onPress={() => {
													setRowIndex(index);
													setInfoModalVisiblity(true);
												}}
                        data={item}
                        textStyle={[
                          styles.textStyle,
                          {textAlign: 'center', width: 150},
                        ]}
                      />
                    );
                  })}
                </Table>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Thumbnail source={SAD} large square style={styles.emptyIcon} />
                <Text style={[styles.textStyle, {color: '#00ACEA'}]}>
                  NO TRANSACTIONS
                </Text>
              </View>
            )}
          </ScrollView>
        </ScrollView>
      </Content>
    </Container>
  );
}

const styles = StyleSheet.create({
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
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('100%') - 40,
    height: hp('60%'),
  },
  emptyIcon: {
    width: wp('30%'),
    height: wp('30%'),
    resizeMode: 'contain',
  },
});
