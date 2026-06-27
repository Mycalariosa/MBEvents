import type { Package, PricingBreakdown, WizardSelection } from '@/src/types/database';
import { SERVICE_FEE_RATE } from '@/src/constants';

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function calculatePricing(
  pkg: Package,
  selections: WizardSelection[],
  discount = 0
): PricingBreakdown {
  const basePrice = Number(pkg.price);
  const upgradeTotal = selections.reduce(
    (sum, s) => sum + Number(s.priceDelta) * s.quantity,
    0
  );
  const subtotal = basePrice + upgradeTotal;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee - discount;
  const reservationFeePct = Number(pkg.reservation_fee_pct) / 100;
  const reservationFee = Math.round(total * reservationFeePct);
  const remainingBalance = total - reservationFee;

  return {
    subtotal,
    serviceFee,
    discount,
    total,
    reservationFee,
    remainingBalance,
  };
}

export function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MBE-${timestamp}-${random}`;
}

export function formatDate(date: string | null): string {
  if (!date) return 'TBD';
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string | null): string {
  if (!time) return 'TBD';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}
