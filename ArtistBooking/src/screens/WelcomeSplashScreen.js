import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeSplashScreen({ navigation }) {
  return (
    // <LinearGradient
    //   colors={['#7C5CFF', '#8B6CFF']}
    //   start={{ x: 0, y: 0 }}
    //   end={{ x: 1, y: 1 }}
    //   style={styles.container}>
      
    <View style={[styles.container, { backgroundColor: '#7C5CFF' }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/artsy-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          Artist{'\n'}Booking
        </Text>

        <Text style={styles.subtitle}>
          Book verified artists for every{'\n'}
          occasion — weddings, events &{'\n'}
          more.
        </Text>

        <View style={styles.artistRow}>
          <Image
            source={require('../../assets/artist1.jpg')}
            style={styles.artistImage}
          />

          <Image
            source={require('../../assets/artist2.jpg')}
            style={styles.artistImage}
          />

          <Image
            source={require('../../assets/artist3.jpg')}
            style={styles.artistImage}
          />
        </View>

        <Text style={styles.countText}>
          500+ verified artists in Bangalore
        </Text>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>
            Get Started
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Trusted by 10,000+ event organisers
        </Text>
      </SafeAreaView>
    {/* </LinearGradient> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
  },

  circleTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -70,
  },

  circleBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -60,
    left: -80,
  },

  logoContainer: {
    marginTop: 40,
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 60,
    height: 60,
  },

  title: {
    marginTop: 35,
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 25,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
  },

  artistRow: {
    flexDirection: 'row',
    marginTop: 50,
  },

  artistImage: {
    width: 70,
    height: 70,
    borderRadius: 22,
    marginHorizontal: 6,
  },

  countText: {
    marginTop: 25,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 18,
    fontWeight: '600',
  },

  spacer: {
    flex: 1,
  },

  button: {
    width: width - 70,
    height: 65,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  buttonText: {
    color: '#7157FF',
    fontSize: 22,
    fontWeight: '700',
  },

  footer: {
    marginBottom: 16,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '500',
  },
});