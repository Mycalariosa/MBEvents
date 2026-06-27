-- MBEvents Initial Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('gcash', 'maya', 'card', 'cash');
CREATE TYPE package_tier AS ENUM ('bronze', 'silver', 'gold');

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event types
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0
);

-- Packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  tier package_tier NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  max_guests INT NOT NULL,
  reservation_fee_pct DECIMAL(5,2) NOT NULL DEFAULT 30,
  description TEXT,
  cover_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE package_inclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  included BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(package_id, service_type)
);

-- Generic service item pattern helper macro via individual tables
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  category TEXT,
  location TEXT,
  capacity INT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  contact TEXT,
  availability_dates DATE[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE catering_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  menu TEXT,
  price_per_guest DECIMAL(12,2),
  min_guests INT,
  max_guests INT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  contact TEXT,
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE photographers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  studio_name TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  contact TEXT,
  packages JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE videographers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  contact TEXT,
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE makeup_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  business_name TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  years_experience INT,
  description TEXT,
  contact TEXT,
  social_links JSONB DEFAULT '{}',
  availability_dates DATE[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wedding_dresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  style TEXT,
  size TEXT,
  color TEXT,
  rental_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE groom_suits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  style TEXT,
  color TEXT,
  rental_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bridesmaids_dresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  style TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  rental_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE groomsmen_suits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  style TEXT,
  rental_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flower_girl_dresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  style TEXT,
  rental_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ring_bearer_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  style TEXT,
  rental_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invitation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  theme_color TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  preview_url TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE decorations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  theme_name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entertainment_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  type TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE souvenirs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bridal_cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  capacity INT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  tiers INT,
  flavor TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE birthday_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mascots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  contact TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE photo_booths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candy_buffets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE party_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE balloon_decorations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id),
  package_id UUID REFERENCES packages(id),
  event_date DATE,
  event_time TIME,
  guest_count INT,
  status booking_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  reservation_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method payment_method,
  payment_ref TEXT,
  additional_requests TEXT,
  assigned_planner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_item_id UUID,
  item_name TEXT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  price_delta DECIMAL(12,2) NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE booking_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  step_label TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  reference_number TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_item_id UUID NOT NULL,
  item_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, service_type, service_item_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_item_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile trigger on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE videographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE makeup_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE groom_suits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridesmaids_dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE groomsmen_suits ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_girl_dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ring_bearer_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE decorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entertainment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE souvenirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridal_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mascots ENABLE ROW LEVEL SECURITY;
ALTER TABLE clowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE candy_buffets ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE balloon_decorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Helper: is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON profiles FOR ALL USING (is_admin());

-- Public read for catalog tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'event_types','packages','package_inclusions','venues','catering_options',
    'photographers','videographers','makeup_artists','wedding_dresses','groom_suits',
    'bridesmaids_dresses','groomsmen_suits','flower_girl_dresses','ring_bearer_outfits',
    'invitation_templates','decorations','entertainment_options','souvenirs','bridal_cars',
    'cakes','birthday_themes','mascots','clowns','hosts','photo_booths','candy_buffets',
    'giveaways','party_games','balloon_decorations'
  ] LOOP
    EXECUTE format('CREATE POLICY "Public read %I" ON %I FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Admin write %I" ON %I FOR ALL USING (is_admin())', t, t);
  END LOOP;
END $$;

-- Bookings policies
CREATE POLICY "Customers read own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id OR is_admin());
CREATE POLICY "Customers create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers update own pending" ON bookings FOR UPDATE USING (auth.uid() = customer_id AND status = 'pending');
CREATE POLICY "Admins manage bookings" ON bookings FOR ALL USING (is_admin());

CREATE POLICY "Booking selections via booking" ON booking_selections FOR ALL
  USING (EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR is_admin())));

CREATE POLICY "Booking progress via booking" ON booking_progress FOR ALL
  USING (EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR is_admin())));

CREATE POLICY "Payments via booking" ON payments FOR ALL
  USING (EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR is_admin())));

CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
