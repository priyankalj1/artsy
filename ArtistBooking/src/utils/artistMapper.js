export function mapArtistForUi(artist) {
  if (!artist) return null;

  const price = Number(artist.price) || 0;
  return {
    ...artist,
    id: artist.artist_id,
    artist_id: artist.artist_id,
    name: artist.name,
    stageName: artist.stage_name,
    category: artist.category,
    subcategory: artist.subcategory || '',
    rating: Number(artist.rating) || 0,
    reviews: Number(artist.reviews) || 0,
    bookings: Number(artist.bookings_count) || 0,
    price,
    priceType: artist.price_type || 'quote',
    location: artist.location || 'Bangalore',
    languages: artist.languages || [],
    events: artist.events || [],
    badges: artist.badges || [],
    verified: artist.verified === true || (artist.badges || []).includes('verified'),
    bio: artist.bio || '',
    experience: artist.experience || '',
    profilePhoto: artist.profile_photo,
    portfolioPhotos: artist.portfolio_photos || [],
    image: artist.profile_photo
      ? { uri: artist.profile_photo }
      : {
          uri: `https://picsum.photos/seed/artist-${artist.artist_id}/400/300`,
        },
  };
}

export function formatINR(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString('en-IN')}`;
}
