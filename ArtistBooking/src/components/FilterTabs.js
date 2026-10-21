import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FILTER_SECTIONS } from '../data/mockData';

export default function FilterTabs({
  sections = FILTER_SECTIONS,
  activeIndex = 0,
  onChange,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}>
      {sections.map((section, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={section.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange?.(index)}
            activeOpacity={0.85}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
