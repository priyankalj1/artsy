import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import WelcomeSplashScreen from './src/screens/WelcomeSplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import CustomerOnboardScreen from './src/screens/CustomerOnboardScreen';
import ArtistOnboardScreen from './src/screens/ArtistOnboardScreen';
import OnboardingStatusScreen from './src/screens/OnboardingStatusScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ArtistDashboard from './src/screens/ArtistDashboard';
import ArtistDetailScreen from './src/screens/ArtistDetailScreen';
import CreateBookingScreen from './src/screens/CreateBookingScreen';
import BottomTabBar from './src/components/BottomTabBar';
import CameraComponent from './src/components/CameraComponent';
import CropImageComponent from './src/components/CropImageComponent';
import { logout, restoreSession } from './src/auth/authService';
import { USER_ROLES } from './src/constants/auth';

const RootStack = createNativeStackNavigator();
const AuthStackNav = createNativeStackNavigator();
const AppStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabBar(props) {
  return <BottomTabBar {...props} role="user" />;
}

function ArtistTabBar(props) {
  return <BottomTabBar {...props} role="artist" />;
}

function UserTabs({ session, onLogout }) {
  return (
    <Tab.Navigator tabBar={UserTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home">
        {props => <HomeScreen {...props} user={session.user} />}
      </Tab.Screen>
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookings">
        {() => <BookingsScreen role={USER_ROLES.USER} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            user={session.user}
            role={USER_ROLES.USER}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function ArtistTabs({ session, onLogout }) {
  return (
    <Tab.Navigator tabBar={ArtistTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard">
        {props => (
          <ArtistDashboard
            {...props}
            user={session.user}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Bookings">
        {() => <BookingsScreen role={USER_ROLES.ARTIST} />}
      </Tab.Screen>
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            user={session.user}
            role={USER_ROLES.ARTIST}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthStack({ onAuthenticated, onLogout, pendingOnboarding }) {
  return (
    <AuthStackNav.Navigator
      initialRouteName={pendingOnboarding ? 'OnboardingStatus' : 'Welcome'}
      screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Welcome" component={WelcomeSplashScreen} />
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Otp">
        {props => (
          <OtpScreen {...props} onAuthenticated={onAuthenticated} />
        )}
      </AuthStackNav.Screen>
      <AuthStackNav.Screen name="OnboardingStatus">
        {props => (
          <OnboardingStatusScreen {...props} onLogout={onLogout} />
        )}
      </AuthStackNav.Screen>
      <AuthStackNav.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStackNav.Screen name="CustomerOnboard">
        {props => (
          <CustomerOnboardScreen
            {...props}
            onAuthenticated={onAuthenticated}
          />
        )}
      </AuthStackNav.Screen>
      <AuthStackNav.Screen name="ArtistOnboard">
        {props => (
          <ArtistOnboardScreen
            {...props}
            onAuthenticated={onAuthenticated}
          />
        )}
      </AuthStackNav.Screen>
      <AuthStackNav.Screen
        name="Camera"
        component={CameraComponent}
        options={{ presentation: 'fullScreenModal' }}
      />
      <AuthStackNav.Screen
        name="CropImage"
        component={CropImageComponent}
        options={{ presentation: 'fullScreenModal' }}
      />
    </AuthStackNav.Navigator>
  );
}

function AppStack({ session, onLogout, isArtist }) {
  return (
    <AppStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AppStackNav.Screen name="Tabs">
        {() =>
          isArtist ? (
            <ArtistTabs session={session} onLogout={onLogout} />
          ) : (
            <UserTabs session={session} onLogout={onLogout} />
          )
        }
      </AppStackNav.Screen>
      <AppStackNav.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <AppStackNav.Screen name="CreateBooking" component={CreateBookingScreen} />
      <AppStackNav.Screen
        name="Camera"
        component={CameraComponent}
        options={{ presentation: 'fullScreenModal' }}
      />
      <AppStackNav.Screen
        name="CropImage"
        component={CropImageComponent}
        options={{ presentation: 'fullScreenModal' }}
      />
    </AppStackNav.Navigator>
  );
}

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const restored = await restoreSession();
      if (mounted) {
        setSession(restored);
        setBootstrapping(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAuthenticated = newSession => {
    setSession(newSession);
  };

  const handleLogout = async () => {
    await logout();
    setSession(null);
  };

  const isOnboarded = Boolean(session?.isAuthenticated && session.user?.is_onboarded);
  const pendingOnboarding = Boolean(
    session?.isAuthenticated && !session.user?.is_onboarded,
  );

  if (bootstrapping) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isOnboarded ? (
          <RootStack.Screen name="Main">
            {() => (
              <AppStack
                session={session}
                onLogout={handleLogout}
                isArtist={session.user?.role === USER_ROLES.ARTIST}
              />
            )}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="Main">
            {() => (
              <AuthStack
                onAuthenticated={handleAuthenticated}
                onLogout={handleLogout}
                pendingOnboarding={pendingOnboarding}
              />
            )}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
});
