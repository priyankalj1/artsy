export function getCameraInstruction(doctype) {
  switch (doctype) {
    case 'photo':
    case 'profile':
      return 'Keep your face inside the box';
    case 'pan':
    case 'id':
      return 'Keep your ID inside the box';
    case 'sign':
      return 'Keep your signature inside the box';
    default:
      return 'Keep the document inside the box';
  }
}

export function openCamera(navigation, options = {}) {
  const {frompage, doctype, gallery, camType, displayIns} = options;
  const usesFrontCamera = doctype === 'photo' || doctype === 'profile';

  navigation.navigate('Camera', {
    frompage: frompage ?? 'ArtistOnboard',
    doctype,
    gallery: gallery ?? doctype !== 'photo',
    camType: camType ?? usesFrontCamera,
    displayIns: displayIns ?? getCameraInstruction(doctype),
  });
}
