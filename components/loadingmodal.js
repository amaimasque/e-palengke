import React from 'react';
import {Modal, View, StatusBar} from 'react-native';
import {Spinner} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function LoadingModal(props) {
  let {isLoading, onDismiss} = props;
  return (
    <Modal
      visible={isLoading}
      onDismiss={() => {}}
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
        <Spinner color="#31C3E7" />
      </View>
    </Modal>
  );
}
