import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import global from '../global';
import {normalizeHeight, normalizeWidth} from './Responsivescreen';

export default function AppButton({
  name,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      style={({pressed}) => [
        styles.button,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text
        style={[
          styles.text,
          isPrimary && styles.primaryText,
          isOutline && styles.outlineText,
          textStyle,
        ]}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: normalizeWidth(160),
    height: normalizeHeight(48),
    borderRadius: normalizeHeight(10),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalizeWidth(20),
  },
  primary: {
    backgroundColor: global.color.dodgerBlue,
  },
  outline: {
    backgroundColor: global.color.transparent,
    borderWidth: 1,
    borderColor: global.color.dodgerBlue,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: global.font.font_family_fs,
    fontSize: global.fontsize.f16,
  },
  primaryText: {
    color: global.color.white,
  },
  outlineText: {
    color: global.color.dodgerBlue,
  },
});
