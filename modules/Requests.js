import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

const addRequest = async (data) => {
  try {
    const newReference = database().ref(`/requests`).push();
    console.log('Auto generated key: ', newReference.key);
    newReference
      .set({
        ...data,
        id: newReference.key,
      })
      .then(() => console.log('Request added.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getRequests = async (accountType, id, callback) => {
  try {
    await database()
      .ref(`/requests`)
      .on('value', (snapshot) => {
        let requests = [];
        snapshot.forEach((querySnapshot) => {
          let requestData = querySnapshot.val();
          if (accountType === 'seller' && requestData?.seller_id === id) {
            (requestData.status !== 'accepted' || requestData.status !== 'rejected') && requests.push(requestData);
          } else if (accountType === 'buyer' && requestData?.buyer_id === id) {
            requests.push(requestData);
            // alert(requestData)
          }
        });
        callback(requests);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const getRequestByID = async (requestID, callback) => {
  try {
    await database()
      .ref(`/requests/${requestID}`)
      .once('value')
      .then((snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const updateRequest = async (requestID, data) => {
  try {
    await database()
      .ref(`/requests/${requestID}`)
      .update(data)
      .then(() => console.log('Data updated.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
}; 
export default {
	addRequest,
	getRequestByID,
	getRequests,
	updateRequest,
}