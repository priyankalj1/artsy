const { pool } = require("./db");

const SAMPLE_ARTISTS = [
  {
    phone: "9000000001",
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
    phone: "9000000002",
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
    phone: "9000000003",
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
    phone: "9000000004",
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
    phone: "9000000005",
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
    phone: "9000000006",
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

const seedDatabase = async () => {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM artists`);
  if (rows[0].count > 0) {
    console.log("✅ Artists already seeded");
    return;
  }

  for (const artist of SAMPLE_ARTISTS) {
    const userResult = await pool.query(
      `INSERT INTO users (phone, name, role, is_onboarded, onboarding_step)
       VALUES ($1, $2, 'artist', TRUE, 'complete')
       ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
       RETURNING user_id`,
      [artist.phone, artist.name]
    );
    const userId = userResult.rows[0].user_id;

    await pool.query(
      `INSERT INTO artists (
         user_id, name, stage_name, bio, category, subcategory, experience,
         languages, events, location, price, price_type, rating, reviews,
         bookings_count, badges, verified
       ) VALUES (
         $1, $2, $2, $3, $4, $5, '3–5 years',
         ARRAY['English','Hindi'], ARRAY['Wedding','Reception'],
         $6, $7, $8, $9, $10, $11, $12, TRUE
       )
       ON CONFLICT (user_id) DO NOTHING`,
      [
        userId,
        artist.name,
        `${artist.subcategory} based in ${artist.location}`,
        artist.category,
        artist.subcategory,
        artist.location,
        artist.price,
        artist.price_type,
        artist.rating,
        artist.reviews,
        artist.bookings_count,
        artist.badges,
      ]
    );
  }

  console.log("✅ Sample artists seeded into database");
};

module.exports = {
  seedDatabase,
};
