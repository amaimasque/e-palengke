import React from 'react';
import {
  Modal,
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {Text, Button, Thumbnail} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CLOSE = require('assets/images/close.png');
export default function RatingsModal(props) {
  let {visible, onDismiss} = props;

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onDismiss}
      transparent={true}
      style={styles.modalStyle}>
      <KeyboardAvoidingView behavior={'padding'} style={styles.modalContent}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Button onPress={onDismiss} transparent style={styles.closeButton}>
              <Thumbnail
                source={CLOSE}
                small
                square
                style={{height: wp('5%'), width: wp('5%')}}
              />
            </Button>
            <View style={{marginVertical: hp('2%')}}>
              <Text
                style={[
                  styles.boldTextStyle,
                  {
                    color: '#00ACEA',
                    textAlign: 'center',
                    marginHorizontal: wp('10%'),
                  },
                ]}>
                E-PALENGKE FOR LINGAYEN MARKET
              </Text>
              <Text
                style={[
                  styles.boldTextStyle,
                  {fontSize: 20, textAlign: 'center'},
                ]}>
                TERMS AND POLICIES
              </Text>
            </View>
            <View style={{marginTop: hp('2%')}}>
              <Text style={[styles.boldTextStyle]}>NO LIABILITY</Text>
              <Text style={styles.textStyle}>
                Subject to applicable law, including with respect to liability
                for personal injury or no-waivable statutory rights under
                Philippine law, on no occasion might E-Palengke or its officers,
                executives, employees, shareholders or agents (A) be liable to
                the user with regard to utilizing of the locales, the substance
                of the materials contained in or gotten to through the
                application (including without limitation any damages caused by
                the result from reliance by a user on any informed obtained from
                E-Palengke), or any damages that result from mistakes,
                exclusions, interruptions, deletion of files or emails, errors,
                defects, viruses, delays in operation or transmission or any
                failure of performance. Whether or not resulting from acts of
                God, communication failure, theft, destruction, or unauthorized
                access to E-Palengke’s records, programs or services; and (B) be
                liable to the user for any indirect, special, incidental,
                significant, correctional or exemplary damages, including,
                without restriction, harms for loss of goodwill, lost profits,
                loss theft or corruptive of user information, or the inability
                to use the sites or any of their features, the user’s sole
                remedy is to cease using the sites.
              </Text>
            </View>
            <View style={{marginTop: hp('2%')}}>
              <Text style={[styles.boldTextStyle]}>PRODUCT INFORMATION</Text>
              <Text style={styles.textStyle}>
                Most of the E-Palengke products uploaded in the application are
                available in Lingayen public market stores while supplies last.
                In some cases, merchandise displayed for sale at the application
                may not be available in municipal’s public market stores. The
                prices displayed in the mobile app are quoted in Philippine Peso
                and are based on the Department of Trade and Industry (DTI)
                suggested retail price (SRP).{' '}
              </Text>
            </View>
            <View style={{marginTop: hp('2%')}}>
              <Text style={[styles.boldTextStyle]}>WARRANTIES</Text>
              <Text style={styles.textStyle}>
                E-Palengke is dedicated to making our services the leading they
                can be, but we’re not culminating and, in some cases,, things
                can go off-base. You understand that our administrations are
                provided “as is” and without any kind of warranty (express or
                implied). We are explicitly disclaiming any warranties of title,
                non-infringement, merchantability, and fitness for a particular
                purpose, as well as any warranties implied by a course of
                performance, course of dealing, or usage of trade.{'\n\n'}
                We do not guarantee that (i) the services will be secure or
                available at any specific time or location; (ii) any defects or
                blunders will be corrected; (iii) the services will be free of
                viruses or other destructive materials; (iv) the result of using
                services will meet your expectations. You see the services
                solely at your own risk. Some jurisdictions do not permit
                limitations on implied warranties, so the above limitations may
                not apply to you.{'\n\n'}
                We don't ensure that (i) the administrations will be secure or
                accessible at any specific time or area; (ii) any abandons or
                blunders will be rectified; (iii) the administrations will be
                free of infections or other destructive materials; (iv) the
                result of utilizing administrations will meet your desires. You
                see the administrations exclusively at your possess risk. Some
                wards don't permit restrictions on suggested guarantees, so the
                over restrictions may not apply to you.
              </Text>
            </View>
            <View style={{marginTop: hp('2%')}}>
              <Text style={[styles.boldTextStyle]}>LIABILITY LIMITS</Text>
              <Text style={styles.textStyle}>
                To the fullest extent permitted by law, neither E-Palengke, nor
                our employees or directors shall be liable to you for any lost
                profits or revenues, or for any consequential, incidental,
                special, or punitive damages, arising out of or in connection
                with services or these terms.
              </Text>
            </View>
            <View style={{marginTop: hp('2%')}}>
              <Text style={[styles.boldTextStyle]}>
                INTELLECTUAL PROPERTY / TRADEMARKS
              </Text>
              <Text style={styles.textStyle}>
                The intellectual property in the application and content made
                accessible to you remains the property of E-Palengke. You may
                store, print, and display the content supplied exclusively for
                your own personal use. You are not allowed to publish,
                manipulate, distribute or otherwise reproduce, in any format,
                any of the content or copies of the content supplied to you or
                which appears on this application nor may you use any such
                content in connection with any business or commercial
                enterprise.{'\n\n'}
                You shall not alter, translate, reverse engineer, decompile,
                disassemble, or create derivative works based on any software or
                accompanying documentation supplied by E-Palengke. No consent is
                granted to you to utilize these marks in any way, and you agree
                not to use these marks or any marks which are colorably similar
                without the written permission,
              </Text>
            </View>
            <View style={{marginTop: hp('2%')}}>
              <Text style={[styles.boldTextStyle]}>
                PRICING AND PAYMENT TERMS
              </Text>
              <Text style={styles.textStyle}>
                The price of E-Palengke products is as quoted on the application
                from time to time.{'\n\n'}
                Prices include VAT but exclude delivery costs which will be
                automatically added (at the cost shown) to the total amount due
                when you view the items and have selected a different payment
                method.{'\n\n'}
                Prices and delivery costs are liable to change at any time, but
                changes will not affect orders in respect which we have already
                sent in Proceed to Payment tab. As of the moment, delivery costs
                are only subject inside Lingayen area and is fixed by each
                seller until further notice.{'\n\n'}
                Payment for all orders must be made thru Online Transfer from
                Paymaya/Gcash app or Cash on Delivery on the checkout module.
                Verification of payment are held by the seller and no middleman
                is engaged in the process. Secured payment processing and
                validation will be held for the next releases of E-Palengke.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalStyle: {
    height: hp('100%') - StatusBar.currentHeight,
    width: wp('100%'),
  },
  modalContent: {
    height: hp('100%') - StatusBar.currentHeight,
    width: wp('100%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: wp('100%'),
    backgroundColor: 'white',
    padding: wp('5%'),
    height: hp('100%'),
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    // right: wp('4%'),
    // top: wp('2%'),
  },
  textStyle: {
    fontFamily: 'Raleway-Light',
    color: 'black',
  },
  boldTextStyle: {
    fontFamily: 'Raleway-Bold',
    color: 'black',
  },
  priceSummary: {
    color: '#3077BA',
    fontSize: 20,
    marginVertical: hp('2%'),
    textAlign: 'center',
  },
  saveButton: {
    width: wp('85%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: hp('30%'),
  },
  emptyIcon: {
    width: wp('30%'),
    height: wp('30%'),
    resizeMode: 'contain',
  },
});
