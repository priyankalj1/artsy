import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import {UPLOAD} from '../assets/images/svgs';
import global from '../global';
import CustomSVG from './Customsvg';
import {normalizeHeight, normalizeWidth} from './Responsivescreen';

export default function UploadTile({
  value = '',
  title,
  subtitle = 'JPEG or PNG',
  onPress,
  width = normalizeWidth(220),
  height = normalizeHeight(110),
  style,
}) {
  const hasImage = Boolean(value);

  return (
    <Pressable
      style={[
        styles.tile,
        {width, height},
        hasImage && styles.tileFilled,
        style,
      ]}
      onPress={onPress}>
      {hasImage ? (
        <Image source={{uri: value}} style={styles.previewImage} />
      ) : (
        <View style={styles.placeholder}>
          <CustomSVG
            name={UPLOAD}
            width={normalizeWidth(24)}
            height={normalizeHeight(24)}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: normalizeWidth(1),
    borderColor: global.color.propertyGrey,
    borderRadius: normalizeHeight(10),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: global.color.white,
    overflow: 'hidden',
  },
  tileFilled: {
    borderColor: global.color.seaGreen,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalizeWidth(12),
  },
  title: {
    marginTop: normalizeHeight(8),
    fontFamily: global.font.font_family_fm,
    fontSize: global.fontsize.f12,
    color: global.color.primary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: normalizeHeight(4),
    fontFamily: global.font.font_family_fr,
    fontSize: global.fontsize.f12,
    color: global.color.lunarShadow,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
