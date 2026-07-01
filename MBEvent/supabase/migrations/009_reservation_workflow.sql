-- Reservation & Consultation Workflow
-- Extends bookings with event details, consultation appointments, and booking reviews

ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'changes_requested';

CREATE TYPE consultation_status AS ENUM ('waiting', 'in_consultation', 'finished');

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_address TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS theme_color TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_change_notes TEXT;

CREATE SEQUENCE IF NOT EXISTS appointment_ref_seq START 1;

CREATE OR REPLACE FUNCTION generate_appointment_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'APT-' || LPAD(nextval('appointment_ref_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE consultation_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  appointment_ref TEXT UNIQUE NOT NULL DEFAULT generate_appointment_ref(),
  consultation_date DATE NOT NULL,
  consultation_time TIME NOT NULL,
  branch_location TEXT,
  planner_id UUID REFERENCES profiles(id),
  notes TEXT,
  consultation_status consultation_status NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE consultation_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments via booking" ON consultation_appointments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "Booking reviews via booking" ON booking_reviews FOR ALL
  USING (EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR is_admin())
  ));

DROP POLICY IF EXISTS "Customers update own pending" ON bookings;
CREATE POLICY "Customers update own pending" ON bookings FOR UPDATE
  USING (auth.uid() = customer_id AND status IN ('pending', 'changes_requested', 'approved'));

ALTER PUBLICATION supabase_realtime ADD TABLE consultation_appointments;
