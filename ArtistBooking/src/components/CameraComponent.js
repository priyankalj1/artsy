import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {Svg, Rect} from 'react-native-svg';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
} from 'react-native-vision-camera';
import {rotateImage} from 'vision-camera-cropper';

import {CLOSE, GALLARY} from '../assets/images/svgs';
import global from '../global';
import AppButton from './AppButton';
import CustomSVG from './Customsvg';
import {normalizeHeight, normalizeWidth} from './Responsivescreen';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

function buildCropRegion(doctype, camType) {
  const factor = camType === true ? 180 : doctype === 'sign' ? 52 : 100;
  const frameWidth = SCREEN_WIDTH;
  const frameHeight = SCREEN_HEIGHT * 0.72;
  const regionWidth = 0.8 * frameWidth;
  const desiredRegionHeight = regionWidth / (85.6 / 54);
  const height = Math.ceil((desiredRegionHeight / frameHeight) * factor);

  return {
    left: 10,
    width: 80,
    top: 20,
    height,
  };
}

function toFileUri(path) {
  if (!path) {
    return '';
  }
  return path.startsWith('file://') ? path : `file://${path}`;
}

export default function CameraComponent({navigation, route}) {
  const {
    frompage: returnScreen = 'ArtistOnboard',
    doctype,
    gallery,
    camType,
    displayIns = '',
  } = route?.params ?? {};

  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [pressed, setPressed] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [first, setFirst] = useState(true);
  const [modalText, setModalText] = useState('');

  const isFront = camType === true;
  const cropRegion = useMemo(
    () => buildCropRegion(doctype, camType),
    [doctype, camType],
  );

  const back = useCameraDevice('back');
  const front = useCameraDevice('front');
  const device = isFront ? front : back;

  const format = useCameraFormat(device, [
    {photoAspectRatio: 4 / 3},
    {photoResolution: {width: 1920, height: 1080}},
  ]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
      setFirst(false);
    }, 300);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      clearTimeout(timer);
      backHandler.remove();
    };
  }, [navigation]);

  const rotateTakenImage = async () => {
    if (!capturedImage?.base64) {
      return;
    }

    const rotated = await rotateImage(capturedImage.base64, 90);
    setCapturedImage({
      ...capturedImage,
      uri: `data:image/jpeg;base64,${rotated}`,
      base64: rotated,
    });
  };

  const capturePhoto = async () => {
    if (isCapturing || !cameraRef.current) {
      return;
    }

    setModalText(
      doctype === 'photo'
        ? 'Photo should be in portrait (vertical) mode'
        : 'Ensure image is clear and easily readable',
    );

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        enableShutterSound: true,
      });
      const uri = toFileUri(photo.path);

      setCapturedImage({
        uri,
        base64: null,
        size: 0,
      });
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const returnImage = imagePayload => {
    if (navigation.popTo) {
      navigation.popTo(returnScreen, {imagedata: imagePayload, doctype});
      return;
    }

    navigation.navigate({
      name: returnScreen,
      params: {imagedata: imagePayload, doctype},
      merge: true,
    });
    navigation.goBack();
  };

  const openSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  };

  if (first === false && !hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Please enable camera permissions{'\n'}in your settings
        </Text>
        <AppButton name="Go To Settings" onPress={openSettings} />
      </View>
    );
  }

  const viewBox = `0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.72}`;

  return (
    <>
      {device != null && hasPermission && (
        <View style={styles.container}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            isActive={isActive}
            device={device}
            format={format}
            photo
            resizeMode="cover"
          />
          <Svg
            preserveAspectRatio={
              Platform.OS === 'android' ? 'xMidYMid slice' : undefined
            }
            style={StyleSheet.absoluteFill}
            viewBox={viewBox}>
            <Rect
              x={(cropRegion.left / 100) * SCREEN_WIDTH}
              y={(cropRegion.top / 100) * (SCREEN_HEIGHT * 0.72)}
              width={(cropRegion.width / 100) * SCREEN_WIDTH}
              height={(cropRegion.height / 100) * (SCREEN_HEIGHT * 0.72)}
              strokeWidth="4"
              stroke={global.color.treeGreen}
              fillOpacity={0}
            />
          </Svg>
          <Text style={styles.instruction}>{displayIns}</Text>
        </View>
      )}

      {device != null && hasPermission && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={async () => {
              if (gallery !== true) {
                return;
              }

              try {
                const result = await launchImageLibrary({
                  mediaType: 'photo',
                  includeBase64: true,
                  selectionLimit: 1,
                  quality: 1,
                });

                const asset = result?.assets?.[0];
                if (!asset?.uri) {
                  return;
                }

                navigation.navigate('CropImage', {
                  imagedata: {uri: asset.uri, base64: asset.base64},
                  doctype,
                  frompage: returnScreen,
                  displayIns,
                });
              } catch (error) {
                console.log(error);
              }
            }}>
            {gallery === true && (
              <CustomSVG
                name={GALLARY}
                width={normalizeWidth(40)}
                height={normalizeHeight(40)}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureOuter,
              pressed && {backgroundColor: global.color.offWhite50},
            ]}
            disabled={isCapturing}
            onPressIn={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              capturePhoto();
            }}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}>
            <CustomSVG
              name={CLOSE}
              width={normalizeWidth(40)}
              height={normalizeHeight(40)}
            />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent
        visible={capturedImage != null}
        supportedOrientations={['portrait']}
        onRequestClose={() => setCapturedImage(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalSpacer} />
          <View style={styles.previewWrap}>
            {capturedImage?.uri ? (
              <Image
                style={styles.previewImage}
                source={{uri: capturedImage.uri}}
              />
            ) : null}
          </View>
          <View style={styles.modalActions}>
            <View style={styles.modalHint}>
              <Text style={styles.modalHintText}>{modalText}</Text>
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={() => setCapturedImage(null)}>
                <Text style={styles.modalButtonText}>Back</Text>
              </Pressable>
              {capturedImage?.base64 ? (
                <Pressable
                  style={[styles.modalButton, styles.modalButtonOutline]}
                  onPress={rotateTakenImage}>
                  <Text style={styles.modalButtonText}>Rotate</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  !capturedImage?.base64 && styles.modalButtonPrimaryWide,
                ]}
                onPress={() => {
                  returnImage({
                    base64: capturedImage?.base64 ?? null,
                    uri: capturedImage?.uri,
                    size: capturedImage?.size ?? 0,
                  });
                }}>
                <Text style={styles.modalButtonText}>Upload</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    backgroundColor: global.color.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalizeWidth(24),
  },
  permissionText: {
    color: global.color.white,
    fontSize: global.fontsize.f16,
    fontFamily: global.font.font_family_fr,
    marginBottom: normalizeHeight(20),
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: global.color.primary,
  },
  camera: {
    flex: 1,
  },
  instruction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    backgroundColor: global.color.treeGreen,
    fontSize: global.fontsize.f16,
    fontFamily: global.font.font_family_fs,
    paddingVertical: normalizeHeight(4),
    color: global.color.white,
  },
  controls: {
    height: normalizeHeight(120),
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: global.color.dark,
  },
  controlButton: {
    width: normalizeHeight(60),
    height: normalizeHeight(60),
    borderRadius: normalizeHeight(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOuter: {
    width: normalizeHeight(60),
    height: normalizeHeight(60),
    borderRadius: normalizeHeight(30),
    backgroundColor: global.color.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: normalizeHeight(50),
    height: normalizeHeight(50),
    borderRadius: normalizeHeight(25),
    borderWidth: 1,
    borderColor: global.color.propertyGrey,
    backgroundColor: global.color.transparent,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: global.color.dark,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalSpacer: {
    width: '100%',
    height: '10%',
  },
  previewWrap: {
    width: '80%',
    height: '60%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalActions: {
    width: '100%',
    paddingHorizontal: normalizeWidth(16),
    marginBottom: normalizeHeight(24),
  },
  modalHint: {
    minHeight: normalizeHeight(30),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: global.color.treeGreen,
    marginBottom: normalizeHeight(12),
    paddingHorizontal: normalizeWidth(12),
    paddingVertical: normalizeHeight(8),
  },
  modalHintText: {
    fontFamily: global.font.font_family_fs,
    fontSize: global.fontsize.f16,
    width: '100%',
    textAlign: 'center',
    color: global.color.white,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalizeWidth(5),
  },
  modalButton: {
    flex: 1,
    height: normalizeHeight(40),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonOutline: {
    borderWidth: 1,
    borderColor: global.color.dodgerBlue,
  },
  modalButtonPrimary: {
    flex: 2,
    backgroundColor: global.color.dodgerBlue,
  },
  modalButtonPrimaryWide: {
    flex: 3,
  },
  modalButtonText: {
    color: global.color.white,
    textAlign: 'center',
    fontFamily: global.font.font_family_fb,
    fontSize: global.fontsize.f14,
  },
});
