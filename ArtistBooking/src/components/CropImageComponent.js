import React from 'react';
import {
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import global from '../global';
import {normalizeHeight, normalizeWidth} from './Responsivescreen';

export default function CropImageComponent({navigation, route}) {
  const {imagedata, doctype, frompage: returnScreen = 'ArtistOnboard', displayIns = ''} =
    route?.params ?? {};
  const imageUri = imagedata?.uri;

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const returnImage = () => {
    const payload = {
      uri: imageUri,
      base64: imagedata?.base64,
      size: imagedata?.base64?.length ?? 0,
    };

    if (navigation.popTo) {
      navigation.popTo(returnScreen, {imagedata: payload, doctype});
      return;
    }

    navigation.navigate({
      name: returnScreen,
      params: {imagedata: payload, doctype},
      merge: true,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.previewWrap}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.previewImage} />
        ) : null}
      </View>
      {displayIns ? (
        <View style={styles.hint}>
          <Text style={styles.hintText}>{displayIns}</Text>
        </View>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.buttonOutline]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.buttonPrimary]}
          onPress={returnImage}>
          <Text style={styles.buttonText}>Upload</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: global.color.dark,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: normalizeHeight(24),
  },
  spacer: {
    height: '8%',
  },
  previewWrap: {
    width: '85%',
    height: '58%',
    borderRadius: normalizeHeight(12),
    overflow: 'hidden',
    backgroundColor: global.color.blackPearl,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  hint: {
    width: '85%',
    borderRadius: 10,
    backgroundColor: global.color.treeGreen,
    paddingVertical: normalizeHeight(8),
    paddingHorizontal: normalizeWidth(12),
  },
  hintText: {
    fontFamily: global.font.font_family_fs,
    fontSize: global.fontsize.f16,
    color: global.color.white,
    textAlign: 'center',
  },
  actions: {
    width: '85%',
    flexDirection: 'row',
    gap: normalizeWidth(8),
  },
  button: {
    flex: 1,
    height: normalizeHeight(44),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: global.color.dodgerBlue,
  },
  buttonPrimary: {
    backgroundColor: global.color.dodgerBlue,
  },
  buttonText: {
    color: global.color.white,
    fontFamily: global.font.font_family_fb,
    fontSize: global.fontsize.f14,
  },
});
