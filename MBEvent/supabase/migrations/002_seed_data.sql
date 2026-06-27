-- MBEvents Seed Data

INSERT INTO event_types (slug, name, icon, sort_order) VALUES
  ('wedding', 'Wedding', 'heart', 1),
  ('birthday', 'Birthday', 'cake', 2),
  ('debut', 'Debut', 'star', 3),
  ('christening', 'Christening', 'water', 4),
  ('corporate', 'Corporate', 'briefcase', 5),
  ('anniversary', 'Anniversary', 'gift', 6),
  ('graduation', 'Graduation', 'school', 7),
  ('engagement', 'Engagement', 'diamond', 8);

-- Wedding packages
INSERT INTO packages (event_type_id, tier, name, price, max_guests, reservation_fee_pct, description)
SELECT id, 'bronze', 'Bronze Wedding', 180000, 50, 30, 'Suitable for intimate weddings.'
FROM event_types WHERE slug = 'wedding';

INSERT INTO packages (event_type_id, tier, name, price, max_guests, reservation_fee_pct, description)
SELECT id, 'silver', 'Silver Wedding', 500000, 120, 30, 'Everything in Bronze plus premium services.'
FROM event_types WHERE slug = 'wedding';

INSERT INTO packages (event_type_id, tier, name, price, max_guests, reservation_fee_pct, description)
SELECT id, 'gold', 'Gold Wedding', 1000000, 200, 30, 'Luxury wedding package with complete premium services.'
FROM event_types WHERE slug = 'wedding';

-- Birthday packages
INSERT INTO packages (event_type_id, tier, name, price, max_guests, reservation_fee_pct, description)
SELECT id, 'bronze', 'Bronze Birthday', 25000, 30, 30, 'Basic birthday celebration package.'
FROM event_types WHERE slug = 'birthday';

INSERT INTO packages (event_type_id, tier, name, price, max_guests, reservation_fee_pct, description)
SELECT id, 'silver', 'Silver Birthday', 60000, 60, 30, 'Enhanced birthday package with entertainment.'
FROM event_types WHERE slug = 'birthday';

INSERT INTO packages (event_type_id, tier, name, price, max_guests, reservation_fee_pct, description)
SELECT id, 'gold', 'Gold Birthday', 120000, 100, 30, 'Premium birthday celebration package.'
FROM event_types WHERE slug = 'birthday';

-- Sample venues
INSERT INTO venues (event_type_id, name, category, location, capacity, price, description, contact, rating)
SELECT et.id, 'Ocean View Resort', 'Beach Resort', 'Batangas', 250, 150000, 'Stunning oceanfront venue.', '09171234567', 4.8
FROM event_types et WHERE et.slug = 'wedding';

INSERT INTO venues (event_type_id, name, category, location, capacity, price, description, contact, rating)
SELECT et.id, 'Garden Venue', 'Garden', 'Tagaytay', 100, 80000, 'Beautiful garden setting.', '09181234567', 4.5
FROM event_types et WHERE et.slug = 'wedding';

INSERT INTO venues (event_type_id, name, category, location, capacity, price, description, contact, rating)
SELECT et.id, 'Hotel Ballroom', 'Hotel', 'Makati', 300, 200000, 'Elegant hotel ballroom.', '09191234567', 4.7
FROM event_types et WHERE et.slug = 'wedding';

-- Sample photographers
INSERT INTO photographers (event_type_id, name, studio_name, price, description, contact, rating)
SELECT et.id, 'Dream Studio', 'Dream Studio Photography', 50000, 'Premium wedding photography.', '09201234567', 4.9
FROM event_types et WHERE et.slug = 'wedding';

INSERT INTO photographers (event_type_id, name, studio_name, price, description, contact, rating)
SELECT et.id, 'Capture Moments', 'Capture Moments Co.', 35000, 'Cinematic wedding photos.', '09211234567', 4.6
FROM event_types et WHERE et.slug = 'wedding';

-- Sample makeup artists
INSERT INTO makeup_artists (event_type_id, name, business_name, price, years_experience, description, contact, rating)
SELECT et.id, 'Maria Santos', 'Glow Beauty', 15000, 8, 'Bridal makeup specialist.', '09221234567', 4.8
FROM event_types et WHERE et.slug = 'wedding';

-- Sample cakes
INSERT INTO cakes (event_type_id, name, tiers, flavor, price, description)
SELECT et.id, 'Classic 3 Tier', 3, 'Vanilla', 12000, 'Elegant 3-tier wedding cake.'
FROM event_types et WHERE et.slug = 'wedding';

INSERT INTO cakes (event_type_id, name, tiers, flavor, price, description)
SELECT et.id, 'Premium 5 Tier', 5, 'Red Velvet', 25000, 'Luxurious 5-tier cake.'
FROM event_types et WHERE et.slug = 'wedding';

-- Sample invitation templates
INSERT INTO invitation_templates (name, theme_color, price, description)
VALUES ('Elegant Gold', '#D4AF37', 5000, 'Luxury gold themed invitation.'),
       ('Floral', '#FFB6C1', 3500, 'Beautiful floral design.'),
       ('Modern', '#333333', 4000, 'Clean modern invitation.'),
       ('Minimalist', '#FFFFFF', 3000, 'Simple minimalist design.');

-- Sample birthday themes
INSERT INTO birthday_themes (name, price, description)
VALUES ('Princess', 8000, 'Fairy tale princess theme.'),
       ('Superhero', 8000, 'Action-packed superhero theme.'),
       ('Unicorn', 7000, 'Magical unicorn theme.'),
       ('K-pop', 9000, 'Trendy K-pop inspired theme.');

-- Default planner progress steps template (stored as reference in comments)
-- Steps: confirmed, planner_assigned, venue_reserved, cake_ordered, invitation_printed,
--        dress_fitted, suppliers_confirmed, final_meeting, event_finished
