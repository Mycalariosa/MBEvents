-- Ensure pending reservations and approval workflow statuses exist in the database
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'changes_requested';

-- Keep reservation rows visible to admins and their owning customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Customers read own bookings'
  ) THEN
    CREATE POLICY "Customers read own bookings" ON bookings
      FOR SELECT USING (auth.uid() = customer_id OR is_admin());
  END IF;
END $$;
