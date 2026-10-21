import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CATEGORIES } from '../data/mockData';

export default function CategoryList({ categories = CATEGORIES, onCategoryPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse by Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.item}
            onPress={() => onCategoryPress?.(category)}
            activeOpacity={0.8}>
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{category.emoji}</Text>
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  item: {
    alignItems: 'center',
    width: 56,
  },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 13,
  },
});
