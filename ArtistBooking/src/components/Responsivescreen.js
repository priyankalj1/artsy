import { Dimensions, PixelRatio } from 'react-native';
const baseWidth = 375;
const baseHeight = 812;


let screenWidth = Dimensions.get('window').width;


let screenHeight = Dimensions.get('window').height;


const normalizeHeight = height => {
  const scale = screenHeight / baseHeight;
  const newheight = Math.round(PixelRatio.roundToNearestPixel(scale * height));
  return newheight;
};

const normalizeWidth = width => {
  const scale = screenWidth / baseWidth;
  const newwidth = Math.round(PixelRatio.roundToNearestPixel(scale * width));
  return newwidth;
};

export {
  normalizeHeight,
  normalizeWidth,
};
