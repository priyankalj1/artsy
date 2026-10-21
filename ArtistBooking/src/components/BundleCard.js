import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function BundleCard({ bundle, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={bundle.image} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{bundle.name}</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Bundle</Text>
          </View>
        </View>
        <Text style={styles.description}>{bundle.description}</Text>
        <Text style={styles.saved}>{bundle.saved} with bundle</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: 96,
    height: 88,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  tag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  description: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  saved: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
    marginTop: 6,
  },
});
