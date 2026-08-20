const store = {
  users: new Map(),
  artists: new Map(),
  customers: new Map(),
  bookings: new Map(),
  categories: [],
  otps: new Map(),
  sequences: {
    user: 1,
    artist: 1,
    customer: 1,
    booking: 1,
  },
};

const nextId = (key) => {
  const id = store.sequences[key];
  store.sequences[key] += 1;
  return id;
};

const seedMemoryStore = () => {
  store.categories = [
    { id: "makeup", name: "Makeup", emoji: "💄" },
    { id: "mehendi", name: "Mehendi", emoji: "🌿" },
    { id: "singer", name: "Singer", emoji: "🎤" },
    { id: "dancer", name: "Dancer", emoji: "💃" },
    { id: "dj", name: "DJ", emoji: "🎧" },
    { id: "photo", name: "Photo", emoji: "📷" },
    { id: "mc", name: "MC/Anchor", emoji: "🎙️" },
    { id: "choreo", name: "Choreographer", emoji: "🕺" },
    { id: "music", name: "Instrumental", emoji: "🎻" },
  ];

  const seedArtists = [
    {
      name: "Priya Sharma",
      category: "Makeup Artist",
      subcategory: "Bridal Specialist",
      rating: 4.9,
      reviews: 234,
      bookings_count: 412,
      price: 8000,
      price_type: "fixed",
      location: "Indiranagar",
      badges: ["verified", "top-rated"],
    },
    {
      name: "Aarti Bose",
      category: "Mehendi Artist",
      subcategory: "Rajasthani & Arabic",
      rating: 4.8,
      reviews: 189,
      bookings_count: 305,
      price: 5500,
      price_type: "fixed",
      location: "Koramangala",
      badges: ["verified", "customer-favorite"],
    },
    {
      name: "Rahul Verma",
      category: "Singer",
      subcategory: "Bollywood & Classical",
      rating: 4.9,
      reviews: 156,
      bookings_count: 198,
      price: 18000,
      price_type: "fixed",
      location: "HSR Layout",
      badges: ["verified", "trending"],
    },
    {
      name: "DJ Karan Mehta",
      category: "DJ",
      subcategory: "Bollywood & EDM",
      rating: 4.7,
      reviews: 312,
      bookings_count: 520,
      price: 28000,
      price_type: "fixed",
      location: "Whitefield",
      badges: ["verified", "top-rated"],
    },
    {
      name: "Meghna Rao",
      category: "Photographer",
      subcategory: "Wedding & Candid",
      rating: 4.9,
      reviews: 278,
      bookings_count: 340,
      price: 25000,
      price_type: "fixed",
      location: "Jayanagar",
      badges: ["verified", "customer-favorite"],
    },
    {
      name: "Neha Gupta",
      category: "Dancer",
      subcategory: "Bollywood & Fusion",
      rating: 4.8,
      reviews: 124,
      bookings_count: 167,
      price: 0,
      price_type: "quote",
      location: "Marathahalli",
      badges: ["verified", "trending"],
    },
  ];

  seedArtists.forEach((artist) => {
    const userId = nextId("user");
    const artistId = nextId("artist");
    const phone = `900000000${artistId}`;

    store.users.set(userId, {
      user_id: userId,
      phone,
      name: artist.name,
      role: "artist",
      is_onboarded: true,
      created_at: new Date().toISOString(),
    });

    store.artists.set(artistId, {
      artist_id: artistId,
      user_id: userId,
      stage_name: artist.name,
      bio: `${artist.subcategory} based in ${artist.location}`,
      category: artist.category,
      experience: "3–5 years",
      languages: ["English", "Hindi"],
      events: ["Wedding", "Reception"],
      profile_photo: null,
      id_image: null,
      selfie_image: null,
      verified: true,
      ...artist,
      created_at: new Date().toISOString(),
    });
  });
};

module.exports = {
  store,
  nextId,
  seedMemoryStore,
};
