import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

const uploadPhoto = async (filepath, filename) => {
  try {
    await storage().setMaxUploadRetryTime(100000);
    console.warn('Image', filepath, filename);
    let task = storage().ref(filename).putFile(filepath);

    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
    });

    return task
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.warn('Error uploading file', error.message);
        return false;
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get download URL of file
 * @param {string} ref
 */
const getDownloadURL = async (ref) => {
  try {
    await storage().setMaxDownloadRetryTime(100000);
    const url = await storage().ref(ref).getDownloadURL();
    if (url) {
      return url;
    }
    return;
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Deletes files from the storage
 * @param {string} id
 */
const deleteFiles = async (id) => {
  try {
    await storage().ref(id).delete();
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get all market categories according to market type (dry or wet)
 * Not include category if no items are for sale in the category
 * @param {string} marketType
 * @param {function} callback
 */
const getSaleMarketCategories = async (marketType, callback) => {
  try {
    await database()
      .ref(`/categories/${marketType}`)
      .once('value')
      .then(async (snapshot) => {
        let categories = [];
        snapshot.forEach(async (querySnapshot) => {
          let data = querySnapshot.val();
          if (data == null) {
            return;
          }
          let found = false;
          await database()
            .ref(`/sale_items/${data['id']}`)
            .once('value')
            .then((catSnapshot) => {
              catSnapshot.forEach((itemSnapshot) => {
                let item = itemSnapshot.val();
                if (item == null) {
                  return;
                }
                console.log(item['sub_category_id']);
                if (item['sub_category_id'] === data['id']) {
                  // console.log('Category has an item');
                  found = item['stocks'] == 0 ? false : true;
                }
              });
            });
          found && categories.push(data);
        });
        setTimeout(() => {
          console.log(JSON.stringify(categories))
          callback(categories);
        }, 1000);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get all market categories according to market type (dry or wet)
 * @param {string} marketType
 * @param {function} callback
 */
const getMarketCategories = async (marketType, callback) => {
  try {
    let categories = [];
    await database()
      .ref(`/categories/${marketType}`)
      .once('value')
      .then((snapshot) => {
        snapshot.forEach((querySnapshot) => {
          let data = querySnapshot.val();
          categories.push(data);
        });
        callback(categories);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get subcategories by main catageory
 * @param {string} id
 * @param {function} callback
 */
const getSubcategoriesByMain = async (id, callback) => {
  try {
    let items = [];
    await database()
      .ref(`/categories/${id}`)
      .once('value')
      .then((snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get sale item according to subcategory ID and item ID
 * @param {string} subCategoryID
 * @param {string} itemID
 * @param {function} callback
 */
const getSpecificSaleItem = async (subCategoryID, itemID, callback) => {
  try {
    await database()
      .ref(`/sale_items/${subCategoryID}/${itemID}`)
      .once('value')
      .then((snapshot) => {
        console.warn('Item', snapshot.val());
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get items name list
 * @param {string} id
 * @param {function} callback
 */
const getAllMarketItemList = async (id, callback) => {
  try {
    let items = [];
    await database()
      .ref('/items')
      .once('value')
      .then((snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get items name list according to subcategory ID
 * @param {string} id
 * @param {function} callback
 */
const getMarketItemListBySub = async (id, callback) => {
  try {
    let items = [];
    await database()
      .ref('/items')
      .once('value')
      .then((snapshot) => {
        snapshot.forEach(async (querySnapshot) => {
          let data = querySnapshot.val();
          if (data !== null && data['sub_category_id'] === id) {
            items.push(data);
          }
        });
        setTimeout(() => {
          callback(items);
        }, 1000);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get items name list according to subcategory ID
 * Returns item name when stocks are available
 * @param {string} id
 * @param {function} callback
 */
const getMarketItemList = async (id, callback) => {
  try {
    let items = [];
    await database()
      .ref('/items')
      .once('value')
      .then((snapshot) => {
        snapshot.forEach(async (querySnapshot) => {
          let data = querySnapshot.val();
          if (data === null) {
            return;
          }
          if (data['sub_category_id'] === id) {
            //check if category has items stock
            let stocks = 0;
            await database()
              .ref(`/sale_items/${id}`)
              .once('value')
              .then((saleItemsSnapshot) => {
                saleItemsSnapshot.forEach((itemSnapshot) => {
                  let i = itemSnapshot.val();
                  console.log(i, '\n', data)
                  if (i !== null && i['item_id'] === data['id']) {
                    stocks += parseInt(i['stocks']);
                    // console.log(i['id'], stocks)
                  }
                });
              });
            stocks !== 0 && items.push({...data, stocks});
          }
        });
        setTimeout(() => {
          callback(items);
        }, 1000);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get all on sale items
 * @param {string} id
 * @param {function} callback
 */
const getAllMarketItems = async (callback) => {
  try {
    await database()
      .ref(`/sale_items`)
      .on('value', (snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get all items for sale according to subcategory
 * @param {string} id
 * @param {function} callback
 */
const getMarketItems = async (id, callback) => {
  try {
    await database()
      .ref(`/sale_items/${id}`)
      .on('value', (snapshot) => {
        // callback(snapshot.val());
        let items = [];
        snapshot.forEach((querySnapshot) => {
          let itemNameData = querySnapshot.val();
          if (itemNameData !== null) {
            getItemNameInfoByID(itemNameData.item_id, (data) => {
              console.log(JSON.stringify(itemNameData));
              // delete data.id;
              items.push({...itemNameData, ...data});
            });
          }
        });
        setTimeout(() => {
          // alert(JSON.stringify(items));
          callback(items);
        }, 1000);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Unscubscribe listening to func according to subcategory ID
 * @param {string} id
 * @param {function} func
 */
const getMarketItemsUnsubscribe = async (id, func) => {
  try {
    let items = [];
    await database().ref(`/sale_items/${id}`).off('child_changed', func);
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get item name info by item passing item ID
 * @param {string} id
 * @param {function} callback
 */
const getItemNameInfoByID = async (id, callback) => {
  try {
    await database()
      .ref(`/items/${id}`)
      .on('value', (snapshot) => {
        callback(snapshot.val());
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get all items for sale according to subcategory and item id
 * @param {string} id
 * @param {function} callback
 */
const getMarketItemsByID = async (subcategoryID, itemID, callback) => {
  try {
    await database()
      .ref(`/sale_items/${subcategoryID}`)
      .on('value', (snapshot) => {
        // callback(snapshot.val());
        let items = [];
        snapshot.forEach((querySnapshot) => {
          let itemData = querySnapshot.val();
          // console.log(itemNameData);
          if (itemData !== null && itemData.item_id === itemID) {
            getItemNameInfoByID(itemData.item_id, (data) => {
              delete data.id;
              items.push({...itemData, ...data});
            });
          }
        });
        setTimeout(() => {
          // alert(JSON.stringify(items));
          callback(items);
        }, 1000);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const addSaleItem = async (subCategoryID, data) => {
  try {
    const newReference = database().ref(`/sale_items/${subCategoryID}`).push();
    console.log('Auto generated key: ', newReference.key);
    newReference
      .set({
        ...data,
        id: newReference.key,
      })
      .then(() => console.log('Item added.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const addItemName = async (data, callback) => {
  try {
    const newReference = database().ref('/items').push();
    console.log('Auto generated key: ', newReference.key);
    newReference
      .set({
        ...data,
        id: newReference.key,
      })
      .then(() => {
        console.log('Item name added.');
        callback(newReference.key);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};

const getItemNames  = async () => {
  try {
    let items = [];
    await database()
      .ref(`/items`)
      .once('value')
      .then((snapshot) => {
        snapshot.forEach((querySnapshot) => {
          let itemData = querySnapshot.val();
          if (itemData !== null) {
            items.push(itemData);
          }
        });
      })
      .finally(() => callback(items));
  } catch (error) {
    console.warn('Error', error.message);
  }
}

const viewSellerItems = async (sellerID, callback) => {
  try {
    await database()
      .ref(`/sale_items`)
      .on('value', (snapshot) => {
        // callback(snapshot.val());
        let items = [];
        snapshot.forEach((querySnapshot) => {
          // let itemData = querySnapshot.val();
          // console.log(JSON.stringify(itemData, null, '\t'));
          querySnapshot.forEach((itemSnapshot) => {
            let itemData = itemSnapshot.val();
            if (itemData !== null && itemData.seller_id === sellerID) {
              console.log(itemData);
              items.push(itemData);
              // getItemNameInfoByID(itemData.item_id, (data) => {
              //   delete data.id;
              //   items.push({...itemData, ...data});
              // });
            }
          });
        });
        setTimeout(() => {
          // alert(JSON.stringify(items));
          callback(items);
        }, 5000);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const updateSaleItem = async (subCategoryID, itemID, data) => {
  try {
    await database()
      .ref(`/sale_items/${subCategoryID}/${itemID}`)
      .update(data)
      .then(() => console.log('Data updated.'));
  } catch (error) {
    console.warn('Error', error.message);
  }
};
const deleteItem = async (subCategoryID, itemID) => {
  try {
    console.warn(`/sale_items/${subCategoryID}/${itemID}`)
    let response = await database().ref(`/sale_items/${subCategoryID}/${itemID}`).set(null);
    console.warn(response);
    return response;
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Get all on sale items
 * @param {string} id
 * @param {function} callback
 */
const getSearchedSaleItem = async (keyword, callback) => {
  try {
    await database()
      .ref(`/sale_items`)
      .once('value')
      .then((snapshot) => {
        let items = [];
        snapshot.forEach((querySnapshot) => {
          querySnapshot.forEach((itemSnapshot) => {
            let itemData = itemSnapshot.val();
            if (
              (itemData !== null &&
                itemData.item_name.match(new RegExp(keyword, 'gmi'))) ||
              itemData.shop_name.match(new RegExp(keyword, 'gmi')) ||
              itemData.sub_category.match(new RegExp(keyword, 'gmi')) ||
              itemData.main_category.match(new RegExp(keyword, 'gmi'))
            ) {
              items.push(itemData);
            }
          });
        });
        console.log(JSON.stringify(items))
        callback(items);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
/**
 * Search same item name
 * @param {string} id
 * @param {function} callback
 */
const getSameItemName = async (keyword, callback) => {
  try {
    await database()
      .ref(`/items`)
      .once('value')
      .then((snapshot) => {
        let items = [];
        snapshot.forEach((querySnapshot) => {
          let itemData = querySnapshot.val();
          if (
            itemData !== null &&
              itemData.name.match(new RegExp(keyword, 'gmi'))
          ) {
            items.push(itemData);
          }
        });
        console.log(JSON.stringify(items))
        callback(items);
      });
  } catch (error) {
    console.warn('Error', error.message);
  }
};
export default {
  addItemName,
  addSaleItem,
  deleteFiles,
  deleteItem,
  getAllMarketItemList,
  getDownloadURL,
  getItemNameInfoByID,
  getAllMarketItems,
  getMarketCategories,
  getSaleMarketCategories,
  getSameItemName,
  getSearchedSaleItem,
  getSpecificSaleItem,
  getSubcategoriesByMain,
  getMarketItems,
  getMarketItemsByID,
  getMarketItemList,
  getMarketItemListBySub,
  getMarketItemsUnsubscribe,
  uploadPhoto,
  updateSaleItem,
  viewSellerItems,
};
