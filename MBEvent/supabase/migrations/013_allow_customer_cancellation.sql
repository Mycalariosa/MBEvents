-- Allow customers to cancel their own bookings without letting them mutate payment/balance state on cancelled rows
DROP POLICY IF EXISTS "Customers cancel own bookings" ON bookings;

CREATE POLICY "Customers update own active bookings" ON bookings
  FOR UPDATE
  USING (auth.uid() = customer_id AND status != 'cancelled')
  WITH CHECK (auth.uid() = customer_id AND status != 'cancelled');

CREATE POLICY "Customers cancel own bookings" ON bookings
  FOR UPDATE
  USING (auth.uid() = customer_id AND status IN ('pending', 'changes_requested', 'approved', 'confirmed'))
  WITH CHECK (auth.uid() = customer_id AND status = 'cancelled');

CREATE OR REPLACE FUNCTION protect_cancelled_booking_payments()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'cancelled' AND (
    NEW.status IS DISTINCT FROM OLD.status OR
    NEW.remaining_balance IS DISTINCT FROM OLD.remaining_balance OR
    NEW.payment_ref IS DISTINCT FROM OLD.payment_ref
  ) THEN
    RAISE EXCEPTION 'Cancelled bookings cannot receive payment or balance updates';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_payment_guard ON bookings;
CREATE TRIGGER bookings_payment_guard
BEFORE UPDATE OF status, remaining_balance, payment_ref ON bookings
FOR EACH ROW
EXECUTE FUNCTION protect_cancelled_booking_payments();
