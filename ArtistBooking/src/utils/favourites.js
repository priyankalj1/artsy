import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVOURITES_KEY = '@artist_booking/favourites';

let cache = null;
const listeners = new Set();

function notify() {
  const snapshot = new Set(cache || []);
  listeners.forEach(listener => listener(snapshot));
}

export async function loadFavourites() {
  if (cache) {
    return cache;
  }

  try {
    const raw = await AsyncStorage.getItem(FAVOURITES_KEY);
    const ids = JSON.parse(raw || '[]');
    cache = new Set((Array.isArray(ids) ? ids : []).map(String));
  } catch {
    cache = new Set();
  }

  return cache;
}

export function getFavouriteIds() {
  return cache ? new Set(cache) : new Set();
}

export async function toggleFavourite(artistId) {
  const set = await loadFavourites();
  const id = String(artistId);

  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }

  cache = set;
  await AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify([...set]));
  notify();
  return set.has(id);
}

export function subscribeFavourites(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function filterArtistsBySection(artists, sectionId, favouriteIds) {
  const list = artists || [];
  const favs = favouriteIds || new Set();

  switch (sectionId) {
    case 'top-rated':
      return list
        .filter(
          a =>
            (a.badges || []).includes('top-rated') || Number(a.rating) >= 4.8,
        )
        .sort((a, b) => Number(b.rating) - Number(a.rating));

    case 'favourite':
      return list.filter(a => favs.has(String(a.artist_id ?? a.id)));

    case 'verified':
      return list.filter(
        a => a.verified === true || (a.badges || []).includes('verified'),
      );

    case 'fast':
      return list.filter(a => (a.badges || []).includes('fast-responder'));

    case 'trending':
    default:
      return list
        .filter(
          a =>
            (a.badges || []).includes('trending') ||
            Number(a.bookings || a.bookings_count || 0) > 0,
        )
        .sort(
          (a, b) =>
            Number(b.bookings || b.bookings_count || 0) -
            Number(a.bookings || a.bookings_count || 0),
        );
  }
}
