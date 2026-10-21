import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SearchBar({ placeholder = 'Search artists, categories...', onPress, onFilterPress }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}>
      <Text style={styles.searchIcon}>🔍</Text>
      <Text style={styles.placeholder}>{placeholder}</Text>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
        activeOpacity={0.8}>
        <Text style={styles.filterIcon}>⚙️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  filterButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#6C63FF1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 12,
  },
});
