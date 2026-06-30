-- Tiered catalog seed: 2+ choices per tier with images, plus package_inclusions.
-- Replaces sparse sample data from 002. Safe to run after 006 (package_tier column).
--
-- Supabase may warn about "destructive operations" because this uses DELETE.
-- That only clears the service catalog (venues, cakes, photographers, etc.)
-- so fresh tiered rows can be inserted. It does NOT drop tables or schemas.
--
-- NOT deleted (your real app data stays):
--   profiles, auth.users, packages, event_types, bookings, booking_selections,
--   payments, notifications, favorites
--
-- Deleted then re-inserted (catalog / demo choices only):
--   venues, catering_options, photographers, videographers, makeup_artists,
--   wedding_dresses, groom_suits, cakes, invitation_templates, souvenirs, decorations,
--   entertainment_options, bridal_cars, birthday_themes, balloon_decorations,
--   mascots, clowns, hosts, party_games, photo_booths, candy_buffets,
--   giveaways, package_inclusions
--
-- Wedding tier quality matrix:
--   Cake:         Bronze 1-2 tier | Silver 3 tier | Gold 4-5 tier
--   Decorations:  Bronze basic    | Silver themed | Gold luxury
--   Makeup:       Bronze basic MUA (no trial) | Silver trial+glam | Gold premium full day
--   Dress:        Bronze simple rental | Silver mid-range designer | Gold couture/premium
--   Suit:         Bronze basic black/navy | Silver tailored modern | Gold tuxedo/luxury linen
--   Videography:  Bronze NOT included | Silver included | Gold premium
--   Bridal car:   Bronze/Silver NOT included | Gold included
--
-- Run once after 001-007. Safe to re-run to refresh catalog (replaces old sample rows).

BEGIN;

DELETE FROM package_inclusions;
DELETE FROM bridal_cars;
DELETE FROM entertainment_options;
DELETE FROM decorations;
DELETE FROM invitation_templates;
DELETE FROM souvenirs;
DELETE FROM cakes;
DELETE FROM groom_suits;
DELETE FROM wedding_dresses;
DELETE FROM makeup_artists;
DELETE FROM videographers;
DELETE FROM photographers;
DELETE FROM catering_options;
DELETE FROM venues;
DELETE FROM birthday_themes;
DELETE FROM balloon_decorations;
DELETE FROM mascots;
DELETE FROM clowns;
DELETE FROM hosts;
DELETE FROM party_games;
DELETE FROM photo_booths;
DELETE FROM candy_buffets;
DELETE FROM giveaways;

-- ===================== WEDDING VENUES =====================
INSERT INTO venues (event_type_id, name, category, location, capacity, price, description, contact, rating, package_tier, images)
SELECT et.id, v.name, v.category, v.location, v.capacity, v.price, v.description, v.contact, v.rating, v.tier::package_tier, v.images
FROM event_types et,
(VALUES
  ('Cebu Community Hall', 'Function Hall', 'Cebu City', 80, 35000, 'Affordable hall for intimate weddings in Cebu City.', '09171111101', 4.2, 'bronze', ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']),
  ('Talisay Garden Pavilion', 'Garden', 'Talisay City, Cebu', 60, 45000, 'Simple outdoor garden setup south of Cebu City.', '09171111102', 4.3, 'bronze', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800']),
  ('Mactan View Terrace', 'Garden', 'Lapu-Lapu City, Cebu', 120, 95000, 'Scenic Mactan terrace with upgraded styling.', '09171111103', 4.6, 'silver', ARRAY['https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800']),
  ('Cebu Heritage Manor', 'Heritage', 'Cebu City', 150, 120000, 'Elegant manor with coordinator support.', '09171111104', 4.7, 'silver', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Cordova Beach Resort', 'Beach Resort', 'Cordova, Cebu', 250, 180000, 'Premium beachfront ceremony and reception on Mactan Island.', '09171111105', 4.9, 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']),
  ('Cebu Grand Hotel Ballroom', 'Hotel', 'Cebu City', 300, 220000, 'Luxury ballroom with full production team.', '09171111106', 4.8, 'gold', ARRAY['https://images.unsplash.com/photo-1566737236508-acf08810a0f0?w=800'])
) AS v(name, category, location, capacity, price, description, contact, rating, tier, images)
WHERE et.slug = 'wedding';

-- ===================== WEDDING CATERING =====================
INSERT INTO catering_options (event_type_id, name, menu, price_per_guest, min_guests, max_guests, price, description, package_tier, images)
SELECT et.id, c.name, c.menu, c.ppg, c.min_g, c.max_g, c.price, c.description, c.tier::package_tier, c.images
FROM event_types et,
(VALUES
  ('Essential Buffet', 'Filipino favorites: adobo, pancit, rice', 450, 30, 80, 18000, 'Budget-friendly buffet for small weddings.', 'bronze', ARRAY['https://images.unsplash.com/photo-1555244160-7500e7209891?w=800']),
  ('Garden Lunch Set', 'Grilled chicken, pasta, salad bar', 520, 30, 60, 22000, 'Light lunch menu for daytime ceremonies.', 'bronze', ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800']),
  ('Signature Feast', 'Beef salpicao, seafood, carving station', 850, 50, 150, 55000, 'Upgraded menu with live carving.', 'silver', ARRAY['https://images.unsplash.com/photo-1544025162-d76694265947?w=800']),
  ('Chef''s Table Silver', 'Premium Filipino-European fusion', 920, 60, 180, 68000, 'Curated courses plus cocktail hour bites.', 'silver', ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']),
  ('Royal Banquet', 'Lobster, wagyu, full dessert bar', 1500, 80, 250, 120000, 'Luxury banquet with dedicated chef.', 'gold', ARRAY['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800']),
  ('Grand Epicure', 'International stations + champagne toast', 1800, 100, 300, 150000, 'Five-star catering experience.', 'gold', ARRAY['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800'])
) AS c(name, menu, ppg, min_g, max_g, price, description, tier, images)
WHERE et.slug = 'wedding';

-- ===================== WEDDING PHOTOGRAPHERS =====================
INSERT INTO photographers (event_type_id, name, studio_name, price, description, contact, rating, package_tier, images)
SELECT et.id, p.name, p.studio, p.price, p.description, p.contact, p.rating, p.tier::package_tier, p.images
FROM event_types et,
(VALUES
  ('Snap & Go Studio', 'Snap & Go', 18000, '4-hour coverage, 200 edited photos.', '09201111101', 4.4, 'bronze', ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800']),
  ('Simple Moments Co.', 'Simple Moments', 22000, 'Half-day coverage with online gallery.', '09201111102', 4.5, 'bronze', ARRAY['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800']),
  ('Capture Moments', 'Capture Moments Co.', 45000, 'Full-day, 2 shooters, same-day highlights.', '09201111103', 4.7, 'silver', ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800']),
  ('Frame & Light', 'Frame & Light Studio', 52000, 'Cinematic edits plus engagement session.', '09201111104', 4.8, 'silver', ARRAY['https://images.unsplash.com/photo-1542038784453-92f4809a3f0f?w=800']),
  ('Dream Studio', 'Dream Studio Photography', 85000, 'Premium album, drone, pre-wedding shoot.', '09201111105', 4.9, 'gold', ARRAY['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800']),
  ('Luxe Lens Collective', 'Luxe Lens', 95000, 'Editorial-style coverage with art director.', '09201111106', 5.0, 'gold', ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'])
) AS p(name, studio, price, description, contact, rating, tier, images)
WHERE et.slug = 'wedding';

-- ===================== WEDDING VIDEOGRAPHERS (Silver + Gold) =====================
INSERT INTO videographers (event_type_id, name, price, description, contact, rating, package_tier, images)
SELECT et.id, v.name, v.price, v.description, v.contact, v.rating, v.tier::package_tier, v.images
FROM event_types et,
(VALUES
  ('Reel Wedding Films', 35000, 'Included videography — highlight reel and ceremony coverage.', '09211111101', 4.5, 'silver', ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800']),
  ('Cinematic Vows', 42000, 'Included videography — same-day edit plus drone footage.', '09211111102', 4.6, 'silver', ARRAY['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800']),
  ('Motion Heritage', 75000, 'Premium videography — full documentary and cinematic trailer.', '09211111103', 4.9, 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']),
  ('Platinum Reels', 88000, 'Premium videography — multi-cam, audio booth, feature film.', '09211111104', 5.0, 'gold', ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'])
) AS v(name, price, description, contact, rating, tier, images)
WHERE et.slug = 'wedding';

-- ===================== WEDDING MAKEUP (All tiers — always included) =====================
INSERT INTO makeup_artists (event_type_id, name, business_name, price, years_experience, description, contact, rating, package_tier, images)
SELECT et.id, m.name, m.biz, m.price, m.years, m.description, m.contact, m.rating, m.tier::package_tier, m.images
FROM event_types et,
(VALUES
  ('Ana Rivera', 'Fresh Face Studio', 6500, 3, 'Basic MUA — natural bridal look, no trial included.', '09221111001', 4.3, 'bronze', ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800']),
  ('Bea Lim', 'Classic Glow MUA', 8500, 4, 'Basic MUA — simple glam with lashes, no trial.', '09221111002', 4.4, 'bronze', ARRAY['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800']),
  ('Maria Santos', 'Glow Beauty', 12000, 6, 'Trial + glam — bridal trial session and full glam on wedding day.', '09221111101', 4.6, 'silver', ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800']),
  ('Jen Cruz', 'Blush & Bloom', 15000, 8, 'Trial + glam — radiant look with trial and touch-ups.', '09221111102', 4.7, 'silver', ARRAY['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800']),
  ('Elaine Reyes', 'Elaine Bridal Atelier', 25000, 12, 'Premium artist — full day on-site with airbrush and entourage touch-ups.', '09221111103', 4.9, 'gold', ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800']),
  ('Sofia Mendoza', 'Sofia Luxe Beauty', 28000, 15, 'Premium artist — celebrity stylist, full day on-site.', '09221111104', 5.0, 'gold', ARRAY['https://images.unsplash.com/photo-1516975080664-ed2fc6a13783?w=800'])
) AS m(name, biz, price, years, description, contact, rating, tier, images)
WHERE et.slug = 'wedding';

-- ===================== WEDDING DRESSES (All tiers — always included) =====================
INSERT INTO wedding_dresses (name, style, size, color, rental_price, description, package_tier, images)
VALUES
  ('Simple Satin Gown', 'A-Line', '10', 'Ivory', 4500, 'Simple rental gown — clean satin A-line for budget weddings.', 'bronze', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']),
  ('Budget Lace Dress', 'A-Line', '8', 'White', 5500, 'Simple rental gown — modest lace, comfortable fit.', 'bronze', ARRAY['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800']),
  ('Grace A-Line', 'A-Line', '8', 'Ivory', 8000, 'Mid-range designer gown — elegant A-line with delicate details.', 'silver', ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800']),
  ('Lace Romance', 'Mermaid', '6', 'Champagne', 12000, 'Mid-range designer gown — lace mermaid with train.', 'silver', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']),
  ('Celeste Couture', 'Ball Gown', '4', 'White', 25000, 'Couture premium gown — designer ball gown with crystal detailing.', 'gold', ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800']),
  ('Serena Elite', 'Sheath', '6', 'Ivory', 32000, 'Couture premium gown — luxury silk sheath with cathedral veil.', 'gold', ARRAY['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800']);

-- ===================== GROOM SUITS (All tiers — always included) =====================
INSERT INTO groom_suits (name, style, color, rental_price, description, package_tier, images)
VALUES
  ('Standard Black Suit', 'Two-Piece', 'Black', 2500, 'Basic black suit — standard formal rental.', 'bronze', ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800']),
  ('Basic Navy Two-Piece', 'Regular Fit', 'Navy', 3000, 'Basic navy suit — affordable two-piece rental.', 'bronze', ARRAY['https://images.unsplash.com/photo-1593030760758-fcf2615445d8?w=800']),
  ('Classic Charcoal', 'Two-Piece', 'Charcoal', 3500, 'Tailored modern — slim charcoal suit with pocket square.', 'silver', ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800']),
  ('Navy Modern', 'Slim Fit', 'Navy', 4000, 'Tailored modern — slim navy cut, contemporary styling.', 'silver', ARRAY['https://images.unsplash.com/photo-1593030760758-fcf2615445d8?w=800']),
  ('Black Tie Luxe', 'Tuxedo', 'Black', 7500, 'Tuxedo — premium black tie with satin lapels.', 'gold', ARRAY['https://images.unsplash.com/photo-1620799140408-edc089dfb6c5?w=800']),
  ('Ivory Summer', 'Linen Suit', 'Ivory', 6500, 'Luxury linen — premium ivory linen for beach weddings.', 'gold', ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800']);

-- ===================== WEDDING CAKES =====================
INSERT INTO cakes (event_type_id, name, tiers, flavor, price, description, package_tier, images)
SELECT et.id, c.name, c.tiers, c.flavor, c.price, c.description, c.tier::package_tier, c.images
FROM event_types et,
(VALUES
  ('Simple Buttercream', 1, 'Vanilla', 4500, '1-tier cake — single-tier classic buttercream.', 'bronze', ARRAY['https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800']),
  ('Petite Floral', 2, 'Chocolate', 6500, '2-tier cake — two-tier with fresh florals.', 'bronze', ARRAY['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800']),
  ('Classic 3 Tier', 3, 'Red Velvet', 12000, '3-tier cake — elegant wedding centerpiece.', 'silver', ARRAY['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800']),
  ('Rose Gold Elegance', 3, 'Strawberry', 15000, '3-tier cake — metallic accents and sugar flowers.', 'silver', ARRAY['https://images.unsplash.com/photo-1464349095431-e9a21285b5bb?w=800']),
  ('Premium 4 Tier', 4, 'Vanilla-Raspberry', 24000, '4-tier cake — show-stopping tiered centerpiece.', 'gold', ARRAY['https://images.unsplash.com/photo-1521017432531-fbd921d2bfa5?w=800']),
  ('Grand 5 Tier', 5, 'Salted Caramel', 35000, '5-tier cake — custom sculpted luxury wedding cake.', 'gold', ARRAY['https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800'])
) AS c(name, tiers, flavor, price, description, tier, images)
WHERE et.slug = 'wedding';

-- ===================== INVITATION STYLES (Silver + Gold) =====================
INSERT INTO invitation_templates (name, theme_color, price, description, package_tier, images)
VALUES
  ('Modern', '#333333', 3500, 'Modern style — clean typography and minimalist layout, 100 prints.', 'silver', ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e7?w=800']),
  ('Floral', '#FFB6C1', 4500, 'Floral style — soft watercolor botanical design, 100 prints.', 'silver', ARRAY['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800']),
  ('Elegant Gold', '#D4AF37', 8500, 'Elegant gold style — foil embossing, 150 prints.', 'gold', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800']),
  ('Classic Letterpress', '#1a1a2e', 12000, 'Classic letterpress style — handmade paper with wax seal.', 'gold', ARRAY['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800']);

-- ===================== SOUVENIRS (All tiers — browse/admin catalog) =====================
INSERT INTO souvenirs (name, price, description, package_tier, images)
VALUES
  ('Personalized Keychain', 2500, 'Custom acrylic keychains, 50 pieces.', 'bronze', ARRAY['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800']),
  ('Thank You Card Set', 3000, 'Printed thank-you cards with envelope, 75 sets.', 'bronze', ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e7?w=800']),
  ('Mini Succulent Favor', 5500, 'Potted succulent souvenirs for each guest, 80 pieces.', 'silver', ARRAY['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800']),
  ('Custom Mug Favor', 6500, 'Personalized ceramic mug favors, 60 pieces.', 'silver', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800']),
  ('Premium Gift Box', 12000, 'Luxury boxed favors with chocolates and trinkets, 100 sets.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']),
  ('Engraved Crystal Keepsake', 15000, 'Crystal memento engraved with names and date, 80 pieces.', 'gold', ARRAY['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800']);

-- ===================== WEDDING DECORATIONS =====================
INSERT INTO decorations (event_type_id, theme_name, price, description, package_tier, images)
SELECT et.id, d.theme, d.price, d.description, d.tier::package_tier, d.images
FROM event_types et,
(VALUES
  ('White & Green Basic', 8000, 'Basic décor — simple aisle and altar florals.', 'bronze', ARRAY['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800']),
  ('Rustic Charm Lite', 10000, 'Basic décor — burlap accents and candle centerpieces.', 'bronze', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800']),
  ('Blush Garden', 25000, 'Themed décor — full ceremony arch and coordinated styling.', 'silver', ARRAY['https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800']),
  ('Classic Romance', 32000, 'Themed décor — crystal chandeliers and draped backdrop.', 'silver', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Crystal Palace', 65000, 'Luxury décor — premium florals, lighting design, lounge area.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']),
  ('Royal Opulence', 85000, 'Luxury décor — full production design with custom signage.', 'gold', ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'])
) AS d(theme, price, description, tier, images)
WHERE et.slug = 'wedding';

-- ===================== WEDDING ENTERTAINMENT (Silver + Gold) =====================
INSERT INTO entertainment_options (event_type_id, name, type, price, description, package_tier, images)
SELECT et.id, e.name, e.type, e.price, e.description, e.tier::package_tier, e.images
FROM event_types et,
(VALUES
  ('Acoustic Duo', 'Live Music', 15000, '2-hour acoustic set during cocktail hour.', 'silver', ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800']),
  ('DJ Pulse', 'DJ', 18000, '4-hour DJ with basic lights.', 'silver', ARRAY['https://images.unsplash.com/photo-1571266023763-9c2a1d4e8b0a?w=800']),
  ('Manila String Quartet', 'Live Band', 45000, 'Classical quartet for ceremony and reception.', 'gold', ARRAY['https://images.unsplash.com/photo-1511379938543-c1f69419868d?w=800']),
  ('Platinum Live Band', 'Live Band', 65000, '8-piece band with full sound system.', 'gold', ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'])
) AS e(name, type, price, description, tier, images)
WHERE et.slug = 'wedding';

-- ===================== BRIDAL CARS (Gold only) =====================
INSERT INTO bridal_cars (model, capacity, price, description, package_tier, images)
VALUES
  ('Mercedes-Benz S-Class', 4, 25000, 'Included bridal car — luxury chauffeured transport.', 'gold', ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800']),
  ('Rolls-Royce Phantom', 4, 45000, 'Included bridal car — ultimate VIP bridal transport.', 'gold', ARRAY['https://images.unsplash.com/photo-1631297862468-43e196af1157?w=800']);

-- ===================== BIRTHDAY VENUES =====================
INSERT INTO venues (event_type_id, name, category, location, capacity, price, description, package_tier, images)
SELECT et.id, v.name, v.category, v.location, v.capacity, v.price, v.description, v.tier::package_tier, v.images
FROM event_types et,
(VALUES
  ('Cebu Kids Party Room', 'Party Room', 'Cebu City', 25, 8000, 'Colorful room for small parties.', 'bronze', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9de7d5b5?w=800']),
  ('Mandaue Playzone Hall', 'Indoor Play', 'Mandaue City, Cebu', 30, 10000, 'Play area included.', 'bronze', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('IT Park Party Loft', 'Loft', 'Cebu City', 50, 22000, 'Stylish loft with themed setup.', 'silver', ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']),
  ('Cebu Rooftop Celebration', 'Rooftop', 'Cebu City', 60, 28000, 'City views and lounge seating.', 'silver', ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800']),
  ('Cebu Grand Event Hall', 'Ballroom', 'Cebu City', 100, 45000, 'Full production birthday venue.', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Mactan Resort Pavilion', 'Resort', 'Lapu-Lapu City, Cebu', 80, 55000, 'Premium outdoor celebration space.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'])
) AS v(name, category, location, capacity, price, description, tier, images)
WHERE et.slug = 'birthday';

-- ===================== BIRTHDAY THEMES =====================
INSERT INTO birthday_themes (name, price, description, package_tier, images)
VALUES
  ('Rainbow Fun', 5000, 'Bright rainbow colors for kids.', 'bronze', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9de7d5b5?w=800']),
  ('Jungle Safari', 5500, 'Animal adventure theme.', 'bronze', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('Princess Dream', 8000, 'Fairy tale princess theme.', 'silver', ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']),
  ('Superhero Squad', 8000, 'Action-packed superhero theme.', 'silver', ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800']),
  ('K-pop Star', 12000, 'Trendy K-pop inspired theme.', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Hollywood Glam', 15000, 'Red carpet celebrity party theme.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']);

-- ===================== BIRTHDAY CAKES =====================
INSERT INTO cakes (event_type_id, name, tiers, flavor, price, description, package_tier, images)
SELECT et.id, c.name, c.tiers, c.flavor, c.price, c.description, c.tier::package_tier, c.images
FROM event_types et,
(VALUES
  ('Funfetti Single', 1, 'Vanilla', 2500, 'Colorful funfetti birthday cake.', 'bronze', ARRAY['https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800']),
  ('Chocolate Fudge', 1, 'Chocolate', 3000, 'Rich chocolate fudge cake.', 'bronze', ARRAY['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800']),
  ('Character 2-Tier', 2, 'Vanilla', 5500, 'Custom character themed cake.', 'silver', ARRAY['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800']),
  ('Rainbow Layers', 2, 'Mixed', 6500, 'Vibrant rainbow layer cake.', 'silver', ARRAY['https://images.unsplash.com/photo-1464349095431-e9a21285b5bb?w=800']),
  ('Sculpted 3D Cake', 3, 'Red Velvet', 12000, 'Custom 3D sculpted centerpiece.', 'gold', ARRAY['https://images.unsplash.com/photo-1521017432531-fbd921d2bfa5?w=800']),
  ('Premium Drip Cake', 3, 'Cookies & Cream', 15000, 'Luxury drip cake with gold accents.', 'gold', ARRAY['https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800'])
) AS c(name, tiers, flavor, price, description, tier, images)
WHERE et.slug = 'birthday';

-- ===================== BIRTHDAY CATERING =====================
INSERT INTO catering_options (event_type_id, name, menu, price_per_guest, min_guests, max_guests, price, description, package_tier, images)
SELECT et.id, c.name, c.menu, c.ppg, c.min_g, c.max_g, c.price, c.description, c.tier::package_tier, c.images
FROM event_types et,
(VALUES
  ('Snack Box Party', 'Sandwiches, chips, juice boxes', 180, 15, 40, 4500, 'Simple snacks for kids parties.', 'bronze', ARRAY['https://images.unsplash.com/photo-1555244160-7500e7209891?w=800']),
  ('Pizza & Pasta', 'Pizza slices, pasta, soft drinks', 220, 15, 35, 5500, 'Kid-friendly pizza party menu.', 'bronze', ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800']),
  ('Buffet Fiesta', 'Filipino party favorites buffet', 380, 25, 60, 12000, 'Full buffet for medium parties.', 'silver', ARRAY['https://images.unsplash.com/photo-1544025162-d76694265947?w=800']),
  ('BBQ & Grill', 'Grilled meats, sides, desserts', 450, 30, 70, 15000, 'Outdoor BBQ party catering.', 'silver', ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']),
  ('Gourmet Buffet', 'International cuisine stations', 650, 40, 100, 28000, 'Premium buffet with dessert bar.', 'gold', ARRAY['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800']),
  ('Chef Live Station', 'Live cooking plus cocktail bites', 750, 50, 100, 35000, 'Interactive chef stations.', 'gold', ARRAY['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800'])
) AS c(name, menu, ppg, min_g, max_g, price, description, tier, images)
WHERE et.slug = 'birthday';

-- ===================== BALLOON DECORATIONS (All birthday tiers) =====================
INSERT INTO balloon_decorations (name, price, description, package_tier, images)
VALUES
  ('Basic Balloon Bouquet', 2500, 'Simple balloon bouquets at entrance.', 'bronze', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9de7d5b5?w=800']),
  ('Color Pop Arches', 3500, 'Two small balloon arches.', 'bronze', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('Themed Balloon Wall', 8000, 'Custom themed balloon backdrop.', 'silver', ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']),
  ('Organic Balloon Garland', 10000, 'Full organic balloon garland setup.', 'silver', ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800']),
  ('Grand Balloon Installation', 18000, 'Ceiling and wall balloon installation.', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Luxury Balloon Arch', 22000, 'Oversized luxury arch with florals.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']);

-- ===================== BIRTHDAY PHOTOGRAPHERS (Silver + Gold) =====================
INSERT INTO photographers (event_type_id, name, studio_name, price, description, contact, rating, package_tier, images)
SELECT et.id, p.name, p.studio, p.price, p.description, p.contact, p.rating, p.tier::package_tier, p.images
FROM event_types et,
(VALUES
  ('Party Snaps', 'Party Snaps Studio', 8000, '2-hour party coverage.', '09301111101', 4.4, 'silver', ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800']),
  ('Happy Lens', 'Happy Lens Co.', 10000, 'Candid party photos with online gallery.', '09301111102', 4.5, 'silver', ARRAY['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800']),
  ('Celebration Pro', 'Celebration Pro', 18000, 'Full event coverage with photo book.', '09301111103', 4.8, 'gold', ARRAY['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800']),
  ('Memory Makers', 'Memory Makers', 22000, 'Premium party photography package.', '09301111104', 4.9, 'gold', ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'])
) AS p(name, studio, price, description, contact, rating, tier, images)
WHERE et.slug = 'birthday';

-- ===================== HOSTS (Silver + Gold) =====================
INSERT INTO hosts (event_type_id, name, price, description, contact, package_tier, images)
SELECT et.id, h.name, h.price, h.description, h.contact, h.tier::package_tier, h.images
FROM event_types et,
(VALUES
  ('Kuya Mike', 5000, 'Energetic kids party host.', '09311111101', 'silver', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('Ate Joy', 5500, 'Friendly host with games facilitation.', '09311111102', 'silver', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9de7d5b5?w=800']),
  ('Host Marco', 10000, 'Professional emcee for all ages.', '09311111103', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Celebrity Host Bella', 15000, 'TV personality party host.', '09311111104', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'])
) AS h(name, price, description, contact, tier, images)
WHERE et.slug = 'birthday';

-- ===================== MASCOTS (Silver + Gold) =====================
INSERT INTO mascots (name, price, description, package_tier, images)
VALUES
  ('Friendly Bear', 6000, 'Cuddly bear mascot appearance.', 'silver', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9de7d5b5?w=800']),
  ('Magic Clown Ben', 7000, 'Clown with magic tricks and balloons.', 'silver', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('Superhero Mascot', 12000, 'Custom superhero character appearance.', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Princess Character', 12000, 'Live princess character with storytime.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']);

-- ===================== PARTY GAMES (Silver + Gold) =====================
INSERT INTO party_games (name, price, description, package_tier, images)
VALUES
  ('Classic Party Games', 4000, 'Pinata, musical chairs, and prizes.', 'silver', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9de7d5b5?w=800']),
  ('Mini Candy Buffet', 5500, 'Small candy buffet station.', 'silver', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('Adventure Game Zone', 10000, 'Inflatable games and obstacle course.', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('Deluxe Candy Buffet', 12000, 'Full candy buffet with custom jars.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']);

-- ===================== PHOTO BOOTHS (Gold only) =====================
INSERT INTO photo_booths (name, price, description, package_tier, images)
VALUES
  ('Classic Photo Booth', 8000, '2-hour booth with props and prints.', 'gold', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('360 Video Booth', 15000, '360 video booth with instant sharing.', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']);

-- ===================== BIRTHDAY MUSIC (Silver + Gold) =====================
INSERT INTO entertainment_options (event_type_id, name, type, price, description, package_tier, images)
SELECT et.id, e.name, e.type, e.price, e.description, e.tier::package_tier, e.images
FROM event_types et,
(VALUES
  ('Party DJ Mix', 'DJ', 6000, '3-hour DJ with party playlist.', 'silver', ARRAY['https://images.unsplash.com/photo-1571266023763-9c2a1d4e8b0a?w=800']),
  ('Acoustic Trio', 'Live Music', 8000, 'Live acoustic set for celebrations.', 'silver', ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800']),
  ('Full Band Party', 'Live Band', 15000, '5-piece band for high-energy parties.', 'gold', ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800']),
  ('Premium Sound System', 'DJ', 12000, 'Pro DJ with lights and fog machine.', 'gold', ARRAY['https://images.unsplash.com/photo-1511379938543-c1f69419868d?w=800'])
) AS e(name, type, price, description, tier, images)
WHERE et.slug = 'birthday';

-- ===================== BIRTHDAY TABLES & CHAIRS (Silver + Gold) =====================
INSERT INTO decorations (event_type_id, theme_name, price, description, package_tier, images)
SELECT et.id, d.theme, d.price, d.description, d.tier::package_tier, d.images
FROM event_types et,
(VALUES
  ('Kids Table Setup', 5000, 'Themed table covers and centerpieces.', 'silver', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9de7d5b5?w=800']),
  ('Party Lounge Corner', 6500, 'Kids lounge with cushions and decor.', 'silver', ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e6a7c2?w=800']),
  ('Premium Table Styling', 12000, 'Full table styling with linens and florals.', 'gold', ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']),
  ('VIP Lounge Setup', 15000, 'Adult and kids lounge areas with styling.', 'gold', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'])
) AS d(theme, price, description, tier, images)
WHERE et.slug = 'birthday';

-- ===================== PACKAGE INCLUSIONS: WEDDING =====================

-- Bronze: 8 included steps (makeup, dress, suit always on)
INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, true
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('venue'), ('catering'), ('photography'),
  ('makeup'), ('dress'), ('suit'),
  ('cake'), ('decoration')
) AS s(service_type)
WHERE et.slug = 'wedding' AND p.tier = 'bronze';

INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, false
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('videography'), ('invitation'), ('entertainment'), ('transportation')
) AS s(service_type)
WHERE et.slug = 'wedding' AND p.tier = 'bronze';

-- Silver: 11 included steps
INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, true
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('venue'), ('catering'), ('photography'), ('videography'),
  ('makeup'), ('dress'), ('suit'),
  ('cake'), ('invitation'), ('decoration'), ('entertainment')
) AS s(service_type)
WHERE et.slug = 'wedding' AND p.tier = 'silver';

INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, 'transportation', false
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
WHERE et.slug = 'wedding' AND p.tier = 'silver';

-- Gold: all 12 steps included
INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, true
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('venue'), ('catering'), ('photography'), ('videography'),
  ('makeup'), ('dress'), ('suit'),
  ('cake'), ('invitation'), ('decoration'), ('entertainment'), ('transportation')
) AS s(service_type)
WHERE et.slug = 'wedding' AND p.tier = 'gold';

-- ===================== PACKAGE INCLUSIONS: BIRTHDAY =====================

-- Bronze: 5 steps
INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, true
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('venue'), ('theme'), ('cake'), ('catering'), ('balloon')
) AS s(service_type)
WHERE et.slug = 'birthday' AND p.tier = 'bronze';

INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, false
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('photography'), ('host'), ('entertainment'), ('games'),
  ('photo-booth'), ('music'), ('tables')
) AS s(service_type)
WHERE et.slug = 'birthday' AND p.tier = 'bronze';

-- Silver: 11 steps
INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, true
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('venue'), ('theme'), ('cake'), ('catering'), ('balloon'),
  ('photography'), ('host'), ('entertainment'), ('games'),
  ('music'), ('tables')
) AS s(service_type)
WHERE et.slug = 'birthday' AND p.tier = 'silver';

INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, 'photo-booth', false
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
WHERE et.slug = 'birthday' AND p.tier = 'silver';

-- Gold: all 12 steps
INSERT INTO package_inclusions (package_id, service_type, included)
SELECT p.id, s.service_type, true
FROM packages p
JOIN event_types et ON p.event_type_id = et.id
CROSS JOIN (VALUES
  ('venue'), ('theme'), ('cake'), ('catering'), ('balloon'),
  ('photography'), ('host'), ('entertainment'), ('games'),
  ('photo-booth'), ('music'), ('tables')
) AS s(service_type)
WHERE et.slug = 'birthday' AND p.tier = 'gold';

COMMIT;
