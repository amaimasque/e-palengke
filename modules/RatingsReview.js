import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

const addRating = async (data) => {
  try {
    const newReference = database().ref(`/ratings`).push();
    console.log('Auto generated key: ', newReference.key);
    newReference
      .set({
        ...data,
        date: new Date().toString(),
        id: newReference.key,
      })
      .then(() => console.log('Rating added.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const addReview = async (data) => {
  try {
    const newReference = database().ref(`/reviews`).push();
    console.log('Auto generated key: ', newReference.key);
    newReference
      .set({
        ...data,
        date: new Date().toString(),
        id: newReference.key,
      })
      .then(() => console.log('Review added.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getRatingsByUserID = async (accountType, id, callback) => {
  try {
    await database()
      .ref(`/ratings`)
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
const getRatingByItemAndUserID = async (id, userID, callback) => {
  try {
    await database()
      .ref(`/ratings`)
      .on('value', (snapshot) => {
        let data = null, found = false;
        snapshot.forEach((querySnapshot) => {
          let item = querySnapshot.val();
          // console.warn(id, item.item_id, userID, item.buyer_id)
          if (
            item?.item_id === id &&
            item?.buyer_id === userID
            // ((accountType === 'seller' && item?.seller_id === userID) ||
            //   (accountType === 'buyer' && item?.buyer_id === userID))
          ) {
            // console.warn(JSON.stringify(item))
            // found = true;
            // callback(data);
            data = item;
          }
        });
        // found === false && callback(null);
        callback(data)
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getRatingsByItemID = async (id, callback) => {
  try {
    await database()
      .ref(`/ratings`)
      .on('value', (snapshot) => {
        let transactions = [];
        snapshot.forEach((querySnapshot) => {
          let item = querySnapshot.val();
          // alert(id, JSON.stringify(item))
          if (item?.item_id === id) {
            transactions.push(item);
          }
        });
        callback(transactions);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getReviewsByUserID = async (accountType, id, callback) => {
  try {
    await database()
      .ref(`/reviews`)
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
const getReviewsByItemID = async (id, callback) => {
  try {
    await database()
      .ref(`/reviews`)
      .on('value', (snapshot) => {
        let transactions = [];
        snapshot.forEach((querySnapshot) => {
          let item = querySnapshot.val();
          // alert(JSON.stringify(item))
          if (item?.item_id === id) {
            transactions.push(item);
          }
        });
        callback(transactions);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getReviewByItemAndUserID = async (id, userID, callback) => {
  try {
    await database()
      .ref(`/reviews`)
      .on('value', (snapshot) => {
        let data = null;
        snapshot.forEach((querySnapshot) => {
          let item = querySnapshot.val();
          // alert(id, JSON.stringify(item))
          if (
            item?.item_id === id &&
            item?.buyer_id === userID
            // ((accountType === 'seller' && item?.seller_id === userID) ||
            //   (accountType === 'buyer' && item?.buyer_id === userID))
          ) {
            data = item;
          }
        });
        callback(data);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getRatingByID = async (id, callback) => {
  try {
    await database()
      .ref(`/ratings/${id}`)
      .once('value')
      .then((snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getReviewByID = async (id, callback) => {
  try {
    await database()
      .ref(`/reviews/${id}`)
      .once('value')
      .then((snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const updateRatingByID = async (id, data) => {
  try {
    await database()
      .ref(`/ratings/${id}`)
      .update(data)
      .then(() => console.log('Data updated.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const updateReviewByID = async (id, data) => {
  try {
    await database()
      .ref(`/reviews/${id}`)
      .update(data)
      .then(() => console.log('Data updated.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const deleteRating = async (id) => {
  try {
    await database().ref(`/ratings/${id}`).remove();
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const deleteReview = async (id) => {
  try {
    await database().ref(`/reviews/${id}`).remove();
  } catch (error) {
    console.warn('Error', error.message);
  }
};
export default {
  addRating,
  addReview,
  deleteRating,
  deleteReview,
  getRatingByID,
  getRatingsByItemID,
  getRatingByItemAndUserID,
  getRatingsByUserID,
  getReviewByID,
  getReviewsByItemID,
  getReviewByItemAndUserID,
  getReviewsByUserID,
  updateRatingByID,
  updateReviewByID,
}