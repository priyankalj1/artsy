import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchArtistByIdApi,
  fetchArtistGalleryApi,
} from '../api/artists';
import { mapArtistForUi, formatINR } from '../utils/artistMapper';

export default function ArtistDetailScreen({ route, navigation }) {
  const artistId = route.params?.artistId;
  const [artist, setArtist] = useState(
    route.params?.artist ? mapArtistForUi(route.params.artist) : null,
  );
  const [gallery, setGallery] = useState([]);
  const [tab, setTab] = useState('about');
  const [loading, setLoading] = useState(!artist);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!artistId) return;
    let mounted = true;
    setLoading(true);
    fetchArtistByIdApi(artistId)
      .then(res => {
        if (!mounted) return;
        const mapped = mapArtistForUi(res?.data?.artist);
        setArtist(mapped);
        const fromDetail = mapped?.portfolioPhotos || [];
        if (fromDetail.length) {
          setGallery(fromDetail);
        }
      })
      .catch(err => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [artistId]);

  useEffect(() => {
    if (!artistId || tab !== 'gallery') return;
    let mounted = true;
    setGalleryLoading(true);
    fetchArtistGalleryApi(artistId)
      .then(res => {
        if (!mounted) return;
        const photos = res?.data?.photos || [];
        const fallback = (res?.data?.gallery || [])
          .filter(item => item.document_type === 'profile')
          .map(item => item.url);
        setGallery(photos.length ? photos : fallback);
      })
      .catch(() => {
        // Keep whatever we already have from artist detail
      })
      .finally(() => {
        if (mounted) setGalleryLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [artistId, tab]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#6C63FF" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error || 'Artist not found'}</Text>
      </SafeAreaView>
    );
  }

  const displayGallery =
    gallery.length > 0
      ? gallery
      : [artist.image?.uri].filter(Boolean);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <Image source={artist.image} style={styles.heroImage} />
          <SafeAreaView style={styles.heroTop} edges={['top']}>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => navigation.goBack()}>
              <Text style={styles.roundBtnText}>←</Text>
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <Text style={styles.heroName}>{artist.name}</Text>
            <Text style={styles.heroMeta}>
              {artist.category} · 📍 {artist.location}
            </Text>
          </View>
        </View>

        <View style={styles.statsBar}>
          <Stat value={artist.rating} label={`${artist.reviews} reviews`} />
          <Stat value={`${artist.bookings}+`} label="events done" />
          <Stat value={artist.experience || '—'} label="experience" />
        </View>

        <View style={styles.tabs}>
          {['about', 'gallery', 'reviews'].map(item => (
            <TouchableOpacity
              key={item}
              style={styles.tab}
              onPress={() => setTab(item)}>
              <Text
                style={[styles.tabText, tab === item && styles.tabTextActive]}>
                {item}
              </Text>
              {tab === item ? <View style={styles.tabUnderline} /> : null}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {tab === 'about' ? (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>{artist.bio || 'No bio yet.'}</Text>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.chips}>
                {(artist.languages || []).map(l => (
                  <Chip key={l} label={l} />
                ))}
              </View>
              <Text style={styles.sectionTitle}>Event Types</Text>
              <View style={styles.chips}>
                {(artist.events || []).map(e => (
                  <Chip key={e} label={e} accent />
                ))}
              </View>
            </>
          ) : null}

          {tab === 'gallery' ? (
            galleryLoading ? (
              <ActivityIndicator color="#6C63FF" style={{ marginTop: 20 }} />
            ) : displayGallery.length === 0 ? (
              <Text style={styles.bio}>No gallery images yet.</Text>
            ) : (
              <View style={styles.gallery}>
                {displayGallery.map((uri, index) => (
                  <Image
                    key={`${uri}-${index}`}
                    source={{ uri }}
                    style={[
                      styles.galleryImage,
                      index === 0 && styles.galleryImageWide,
                    ]}
                  />
                ))}
              </View>
            )
          ) : null}

          {tab === 'reviews' ? (
            <Text style={styles.bio}>
              Reviews will appear here as customers leave feedback.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <View>
          <Text style={styles.ctaLabel}>
            {artist.priceType === 'fixed' ? 'Starting from' : 'Pricing'}
          </Text>
          <Text style={styles.ctaPrice}>
            {artist.priceType === 'fixed'
              ? formatINR(artist.price)
              : 'Request Quote'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() =>
            navigation.navigate('CreateBooking', {
              artistId: artist.artist_id,
              artist,
            })
          }>
          <Text style={styles.ctaBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Chip({ label, accent }) {
  return (
    <View style={[styles.chip, accent && styles.chipAccent]}>
      <Text style={[styles.chipText, accent && styles.chipTextAccent]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  hero: { height: 280, backgroundColor: '#E5E7EB' },
  heroImage: { width: '100%', height: '100%' },
  heroTop: { position: 'absolute', top: 0, left: 16, right: 16 },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  roundBtnText: { fontSize: 18, fontWeight: '700' },
  heroBottom: { position: 'absolute', left: 20, right: 20, bottom: 18 },
  heroName: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  heroMeta: { color: 'rgba(255,255,255,0.8)', marginTop: 4, fontSize: 13 },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: '#FFF' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  tabTextActive: { color: '#6C63FF' },
  tabUnderline: {
    marginTop: 8,
    height: 2,
    width: '60%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  tabContent: { padding: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
    marginTop: 12,
  },
  bio: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipAccent: { backgroundColor: '#6C63FF1A' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  chipTextAccent: { color: '#6C63FF' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryImage: {
    width: '48%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  galleryImageWide: { width: '100%', height: 180 },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaLabel: { fontSize: 11, color: '#6B7280' },
  ctaPrice: { fontSize: 22, fontWeight: '900', color: '#111827' },
  ctaBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  ctaBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  error: { color: '#DC2626', padding: 20, fontWeight: '600' },
});
