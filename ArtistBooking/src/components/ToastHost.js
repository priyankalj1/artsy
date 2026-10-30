import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerToastHandler } from '../utils/toast';
import { colors } from '../theme/colors';

/**
 * Top toast host — same idea as Floatr's <Toasts />:
 * overlay sibling (not Modal), pointerEvents="box-none" so the app
 * stays fully interactive while the toast is visible.
 */
export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const hideTimer = useRef(null);

  const hide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -12,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    ({ message, type, duration = 6000 }) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      setToast({ message, type });
      opacity.setValue(0);
      translateY.setValue(-12);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });

      hideTimer.current = setTimeout(hide, duration);
    },
    [hide, opacity, translateY],
  );

  useEffect(() => {
    registerToastHandler(show);
    return () => {
      registerToastHandler(null);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [show]);

  if (!toast) {
    return null;
  }

  const isError = toast.type !== 'success';

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        { paddingTop: Math.max(insets.top, 12) + 8 },
      ]}>
      <Animated.View
        pointerEvents="auto"
        style={[
          styles.toast,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}>
        <TouchableOpacity activeOpacity={0.9} onPress={hide}>
          <Text
            style={[
              styles.text,
              { color: isError ? colors.error : '#15803D' },
            ]}>
            {toast.message}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  toast: {
    maxWidth: '92%',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});
