import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

const addTransaction = async (data) => {
  try {
    const newReference = database().ref(`/transaction_history`).push();
    console.log('Auto generated key: ', newReference.key);
    newReference
      .set({
        ...data,
        id: newReference.key,
      })
      .then(() => console.log('Transaction history added.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getTransactions = async (accountType, id, callback) => {
  try {
    await database()
      .ref(`/transaction_history`)
      .on('value', (snapshot) => {
        let transactions = [];
        snapshot.forEach((querySnapshot) => {
          let item = querySnapshot.val();
          // alert(JSON.stringify(item))
          if (accountType === 'seller' && item?.seller_id === id) {
            transactions.push(item);
          } else if (accountType === 'buyer' && item?.buyer_id === id) {
            transactions.push(item);
          }
        });
        callback(transactions);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getTransactionByID = async (id, callback) => {
  try {
    await database()
      .ref(`/transaction_history/${id}`)
      .once('value')
      .then((snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getTransactionsBySaleItemID = async (id, callback) => {
  try {
    await database()
      .ref(`/transaction_history`)
      .on('value', (snapshot) => {
        let transactions = [];
        snapshot.forEach((querySnapshot) => {
          let item = querySnapshot.val();
          // alert(JSON.stringify(item))
          if (item?.sale_item_id === id) {
            transactions.push(item);
          }
        });
        callback(transactions);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
export default {
  addTransaction,
  getTransactions,
  getTransactionByID,
  getTransactionsBySaleItemID,
};
