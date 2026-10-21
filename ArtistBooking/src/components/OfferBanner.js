import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { OFFER } from '../data/mockData';

export default function OfferBanner({ offer = OFFER, images = [] }) {
  return (
    <LinearGradient
      colors={['#6C63FF', '#8B5CF6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.tag}>{offer.tag}</Text>
        <Text style={styles.title}>{offer.title}</Text>
        <TouchableOpacity style={styles.codeButton} activeOpacity={0.85}>
          <Text style={styles.codeText}>{offer.code}</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <View style={styles.imagesRow}>
          {images.slice(0, 2).map((source, index) => (
            <View key={index} style={[styles.imageWrap, index === 1 && styles.imageWrapOffset]}>
              <Image source={source} style={styles.image} resizeMode="cover" />
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 130,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    lineHeight: 24,
  },
  codeButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  codeText: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '800',
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingRight: 12,
    gap: 4,
  },
  imageWrap: {
    width: 48,
    height: 64,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  imageWrapOffset: {
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
