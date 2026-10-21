import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { BADGE_STYLES } from '../data/mockData';

function Badge({ type }) {
  const badge = BADGE_STYLES[type] ?? {
    label: type,
    bg: '#F3F4F6',
    color: '#6B7280',
  };

  return (
    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
    </View>
  );
}

function formatPrice(price, priceType) {
  if (priceType === 'quote') {
    return 'Request Quote';
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ArtistCard({
  artist,
  onPress,
  isFavourite = false,
  onToggleFavourite,
}) {
  const handleToggleFavourite = () => {
    onToggleFavourite?.(artist.artist_id ?? artist.id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image source={artist.image} style={styles.image} resizeMode="cover" />
        {artist.badges?.[0] ? (
          <View style={styles.badgeOverlay}>
            <Badge type={artist.badges[0]} />
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleToggleFavourite}
          activeOpacity={0.8}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Text style={styles.likeIcon}>{isFavourite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {artist.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {artist.category}
        </Text>

        <View style={styles.row}>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{artist.rating}</Text>
          </View>
          <Text style={styles.reviews}>({artist.reviews})</Text>
        </View>

        <View style={styles.row}>
          <Text
            style={[
              styles.price,
              artist.priceType === 'quote' && styles.priceQuote,
            ]}>
            {formatPrice(artist.price, artist.priceType)}
          </Text>
          <Text style={styles.bookings}>{artist.bookings} booked</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 185,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrap: {
    height: 130,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: {
    fontSize: 14,
  },
  body: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  category: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    fontSize: 11,
  },
  rating: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  reviews: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  price: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  priceQuote: {
    color: '#6C63FF',
  },
  bookings: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
