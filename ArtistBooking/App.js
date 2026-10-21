import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NativeSplashScreen from 'react-native-splash-screen';

import { initializeApp } from './src/bootstrap/initializeApp';
import AppNavigator from './Navigation';

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
      <AppNavigator />
    </SafeAreaProvider>
  );
}
