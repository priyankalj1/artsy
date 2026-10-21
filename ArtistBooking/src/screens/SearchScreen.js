import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchArtistsApi, fetchCategoriesApi } from '../api/artists';
import { mapArtistForUi, formatINR } from '../utils/artistMapper';
import { colors } from '../theme/colors';

const PRICE_FILTERS = [
  { id: 'any', label: 'Any', min: '', max: '' },
  { id: 'lt10', label: '< ₹10K', min: '', max: '10000' },
  { id: '10to25', label: '₹10–25K', min: '10000', max: '25000' },
  { id: 'gt25', label: '₹25K+', min: '25000', max: '' },
];

const RATING_FILTERS = [
  { id: 'any', label: 'Any', value: '' },
  { id: '45', label: '4.5+', value: '4.5' },
  { id: '40', label: '4.0+', value: '4.0' },
  { id: '35', label: '3.5+', value: '3.5' },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState('any');
  const [ratingFilter, setRatingFilter] = useState('any');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategoriesApi()
      .then(res => setCategories(res?.data?.categories || []))
      .catch(() => {});
  }, []);

  const loadArtists = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const price = PRICE_FILTERS.find(p => p.id === priceFilter);
      const rating = RATING_FILTERS.find(r => r.id === ratingFilter);
      const result = await fetchArtistsApi({
        search: query.trim(),
        category: selectedCat || undefined,
        minPrice: price?.min,
        maxPrice: price?.max,
        minRating: rating?.value,
        sort: 'rating',
      });
      setArtists((result?.data?.artists || []).map(mapArtistForUi));
    } catch (err) {
      setError(err.message);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCat, priceFilter, ratingFilter]);

  useEffect(() => {
    const timer = setTimeout(loadArtists, 250);
    return () => clearTimeout(timer);
  }, [loadArtists]);

  const resetFilters = () => {
    setPriceFilter('any');
    setRatingFilter('any');
    setSelectedCat(null);
    setQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Find Artists</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search artists..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={styles.clear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
            onPress={() => setShowFilters(v => !v)}>
            <Text style={styles.filterIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          <Chip
            label="All"
            active={!selectedCat}
            onPress={() => setSelectedCat(null)}
          />
          {categories.map(cat => (
            <Chip
              key={cat.id || cat.name}
              label={`${cat.emoji || ''} ${cat.name}`.trim()}
              active={selectedCat === cat.name}
              onPress={() =>
                setSelectedCat(selectedCat === cat.name ? null : cat.name)
              }
            />
          ))}
        </ScrollView>

        {showFilters ? (
          <View style={styles.filtersPanel}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Filters</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.reset}>Reset all</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.filterLabel}>Rating</Text>
            <View style={styles.filterOptions}>
              {RATING_FILTERS.map(item => (
                <Chip
                  key={item.id}
                  label={item.label}
                  active={ratingFilter === item.id}
                  onPress={() => setRatingFilter(item.id)}
                />
              ))}
            </View>
            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={styles.filterOptions}>
              {PRICE_FILTERS.map(item => (
                <Chip
                  key={item.id}
                  label={item.label}
                  active={priceFilter === item.id}
                  onPress={() => setPriceFilter(item.id)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.resultMeta}>
        <Text style={styles.resultCount}>
          <Text style={styles.resultCountBold}>{artists.length}</Text> artists
          found
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#6C63FF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={item => String(item.artist_id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ArtistListItem
              artist={item}
              onPress={() =>
                navigation.navigate('ArtistDetail', { artistId: item.artist_id })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No artists found</Text>
              <Text style={styles.emptySub}>
                Try different keywords or category
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ArtistListItem({ artist, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.9}>
      <Image source={artist.image} style={styles.avatar} />
      <View style={styles.itemBody}>
        <Text style={styles.itemName}>{artist.name}</Text>
        <Text style={styles.itemCategory}>{artist.category}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemRating}>⭐ {artist.rating}</Text>
          <Text style={styles.itemLocation}>📍 {artist.location}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemPrice}>
          {artist.priceType === 'quote'
            ? 'Quote'
            : formatINR(artist.price)}
        </Text>
        <Text style={styles.itemCta}>Book →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  clear: { color: '#9CA3AF', fontSize: 14, padding: 4 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  filterIcon: { fontSize: 18 },
  chips: { gap: 8, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  chipTextActive: { color: '#FFF' },
  filtersPanel: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 14,
    marginBottom: 8,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filtersTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  reset: { fontSize: 12, fontWeight: '700', color: '#6C63FF' },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 6,
  },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  resultMeta: { paddingHorizontal: 20, marginBottom: 8 },
  resultCount: { fontSize: 14, color: '#6B7280' },
  resultCountBold: { fontWeight: '900', color: '#111827' },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#F3F4F6' },
  itemBody: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  itemCategory: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemMeta: { flexDirection: 'row', gap: 10, marginTop: 6 },
  itemRating: { fontSize: 11, fontWeight: '700', color: '#111827' },
  itemLocation: { fontSize: 11, color: '#9CA3AF' },
  itemRight: { alignItems: 'flex-end' },
  itemPrice: { fontSize: 13, fontWeight: '900', color: '#111827' },
  itemCta: { fontSize: 11, fontWeight: '700', color: '#6C63FF', marginTop: 6 },
  loader: { marginTop: 40 },
  error: { color: '#DC2626', padding: 20, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
});
