import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NativeSplashScreen from 'react-native-splash-screen';

import { initializeApp } from './src/bootstrap/initializeApp';
import AppNavigator from './Navigation';
import ToastHost from './src/components/ToastHost';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    initializeApp()
      .then(() => {
        if (isMounted) {
          setIsReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsReady(true);
        }
      })
      .finally(() => {
        NativeSplashScreen.hide();
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <AppNavigator />
        <ToastHost />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

