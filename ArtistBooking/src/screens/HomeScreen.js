import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import OfferBanner from '../components/OfferBanner';
import CategoryList from '../components/CategoryList';
import FilterTabs from '../components/FilterTabs';
import ArtistCard from '../components/ArtistCard';
import BundleCard from '../components/BundleCard';
import { BUNDLES, FILTER_SECTIONS } from '../data/mockData';
import { fetchArtistsApi } from '../api/artists';
import { mapArtistForUi } from '../utils/artistMapper';
import {
  filterArtistsBySection,
  loadFavourites,
  subscribeFavourites,
  toggleFavourite,
} from '../utils/favourites';

export default function HomeScreen({ user, navigation }) {
  const [activeSection, setActiveSection] = useState(0);
  const [artists, setArtists] = useState([]);
  const [favouriteIds, setFavouriteIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const userName = user?.name ?? 'Guest';

  const sectionId = FILTER_SECTIONS[activeSection]?.id || 'trending';

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [result, favs] = await Promise.all([
        fetchArtistsApi({ sort: 'rating' }),
        loadFavourites(),
      ]);
      setArtists((result?.data?.artists || []).map(mapArtistForUi));
      setFavouriteIds(new Set(favs));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    return subscribeFavourites(next => setFavouriteIds(new Set(next)));
  }, []);

  const filteredArtists = useMemo(
    () => filterArtistsBySection(artists, sectionId, favouriteIds),
    [artists, sectionId, favouriteIds],
  );
console.log(filteredArtists,'filteredArtistsss')
  const bannerImages = artists.slice(0, 2).map(artist => artist.image);

  const handleToggleFavourite = async artistId => {
    await toggleFavourite(artistId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <Header userName={userName} />

      <SearchBar
        onPress={() => navigation?.navigate('Search')}
        onFilterPress={() => navigation?.navigate('Search')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }>
        {bannerImages.length > 0 ? (
          <View style={styles.section}>
            <OfferBanner images={bannerImages} />
          </View>
        ) : null}

        <CategoryList onCategoryPress={() => navigation?.navigate('Search')} />

        <FilterTabs activeIndex={activeSection} onChange={setActiveSection} />

        {loading ? (
          <ActivityIndicator color="#6C63FF" style={{ marginVertical: 24 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : filteredArtists.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {sectionId === 'favourite'
                ? 'No favourites yet'
                : 'No artists in this filter'}
            </Text>
            <Text style={styles.emptySub}>
              {sectionId === 'favourite'
                ? 'Tap 🤍 on an artist card to save them here'
                : 'Try another tab or refresh'}
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistRow}
            style={styles.artistScroll}>
            {filteredArtists.map(artist => (
              <ArtistCard
                key={artist.artist_id}
                artist={artist}
                isFavourite={favouriteIds.has(String(artist.artist_id))}
                onToggleFavourite={handleToggleFavourite}
                onPress={() =>
                  navigation?.navigate('ArtistDetail', {
                    artistId: artist.artist_id,
                    artist,
                  })
                }
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.bundleSection}>
          <Text style={styles.sectionTitle}>Perfect for your event</Text>
          <View style={styles.bundleList}>
            {BUNDLES.map(bundle => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onPress={() => navigation?.navigate('Search')}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 8,
  },
  artistScroll: {
    marginTop: 8,
  },
  artistRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  empty: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bundleSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  bundleList: {
    gap: 12,
  },
  error: {
    color: '#DC2626',
    paddingHorizontal: 20,
    fontWeight: '600',
  },
});
