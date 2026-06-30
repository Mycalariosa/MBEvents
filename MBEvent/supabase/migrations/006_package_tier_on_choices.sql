-- Add package tier to all choice catalog tables so Bronze/Silver/Gold packages
-- do not share the same selectable choices.

-- NOTE:
-- `package_tier` enum already exists on `packages` table (from 001_initial_schema.sql).
-- This migration only adds the column to choice tables and backfills deterministic
-- tier assignments from current seeded rows.

ALTER TABLE venues ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM venues
)
UPDATE venues v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE catering_options ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM catering_options
)
UPDATE catering_options v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE photographers ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM photographers
)
UPDATE photographers v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE videographers ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM videographers
)
UPDATE videographers v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE makeup_artists ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM makeup_artists
)
UPDATE makeup_artists v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE wedding_dresses ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM wedding_dresses
)
UPDATE wedding_dresses v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE groom_suits ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM groom_suits
)
UPDATE groom_suits v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE bridesmaids_dresses ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM bridesmaids_dresses
)
UPDATE bridesmaids_dresses v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE groomsmen_suits ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM groomsmen_suits
)
UPDATE groomsmen_suits v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE flower_girl_dresses ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM flower_girl_dresses
)
UPDATE flower_girl_dresses v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE ring_bearer_outfits ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM ring_bearer_outfits
)
UPDATE ring_bearer_outfits v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE invitation_templates ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM invitation_templates
)
UPDATE invitation_templates v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE decorations ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM decorations
)
UPDATE decorations v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE entertainment_options ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM entertainment_options
)
UPDATE entertainment_options v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE souvenirs ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM souvenirs
)
UPDATE souvenirs v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE bridal_cars ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM bridal_cars
)
UPDATE bridal_cars v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE cakes ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM cakes
)
UPDATE cakes v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE birthday_themes ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM birthday_themes
)
UPDATE birthday_themes v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE mascots ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM mascots
)
UPDATE mascots v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE clowns ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM clowns
)
UPDATE clowns v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE hosts ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM hosts
)
UPDATE hosts v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE photo_booths ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM photo_booths
)
UPDATE photo_booths v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE candy_buffets ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM candy_buffets
)
UPDATE candy_buffets v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM giveaways
)
UPDATE giveaways v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE party_games ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM party_games
)
UPDATE party_games v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

ALTER TABLE balloon_decorations ADD COLUMN IF NOT EXISTS package_tier package_tier NOT NULL DEFAULT 'bronze';
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM balloon_decorations
)
UPDATE balloon_decorations v
SET package_tier = (CASE
  WHEN (r.rn % 3) = 1 THEN 'bronze'
  WHEN (r.rn % 3) = 2 THEN 'silver'
  ELSE 'gold'
END)::package_tier
FROM ranked r
WHERE v.id = r.id;

