import AsyncStorage from '@react-native-community/async-storage';

async function setItem(item, value) {
  await AsyncStorage.setItem(item, value);
}

async function getItem(item) {
  let value = await AsyncStorage.getItem(item);
  return value;
}

async function clearItems() {
	await AsyncStorage.clear();
}

export default {
	clearItems,
  getItem,
  setItem,
}