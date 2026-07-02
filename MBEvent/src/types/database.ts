export type UserRole = 'customer' | 'admin';
export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'changes_requested'
  | 'confirmed'
  | 'ongoing'
  | 'completed'
  | 'cancelled';
export type ConsultationStatus = 'waiting' | 'in_consultation' | 'finished';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'gcash' | 'maya' | 'card' | 'cash';
export type PackageTier = 'bronze' | 'silver' | 'gold';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface EventType {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface Package {
  id: string;
  event_type_id: string;
  tier: PackageTier;
  name: string;
  price: number;
  max_guests: number;
  reservation_fee_pct: number;
  description: string | null;
  cover_url: string | null;
  is_active: boolean;
}

export interface PackageInclusion {
  id: string;
  package_id: string;
  service_type: string;
  included: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  package_tier?: PackageTier;
  description?: string | null;
  contact?: string | null;
  location?: string | null;
  capacity?: number | null;
  images?: string[]; // Supabase Storage paths, e.g. "venues/1234567890.jpg"
  rating?: number;
  metadata?: Record<string, unknown>;
  event_type_id?: string | null;
  is_active?: boolean;
}

export interface Booking {
  id: string;
  customer_id: string;
  event_type_id: string;
  package_id: string | null;
  event_date: string | null;
  event_time: string | null;
  guest_count: number | null;
  status: BookingStatus;
  subtotal: number;
  service_fee: number;
  discount: number;
  total: number;
  reservation_fee: number;
  remaining_balance: number;
  payment_method: PaymentMethod | null;
  payment_ref: string | null;
  additional_requests: string | null;
  event_address: string | null;
  theme_color: string | null;
  special_requests: string | null;
  admin_change_notes: string | null;
  assigned_planner_id: string | null;
  created_at: string;
  event_types?: EventType;
  packages?: Package;
  profiles?: Profile;
}

export interface BookingSelection {
  id: string;
  booking_id: string;
  service_type: string;
  service_item_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
  price_delta: number;
  metadata?: Record<string, unknown>;
}

export interface BookingProgress {
  id: string;
  booking_id: string;
  step_key: string;
  step_label: string;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  service_type: string;
  service_item_id: string;
  item_name: string | null;
  created_at: string;
}

export interface ConsultationAppointment {
  id: string;
  booking_id: string;
  appointment_ref: string;
  consultation_date: string;
  consultation_time: string;
  branch_location: string | null;
  planner_id: string | null;
  notes: string | null;
  consultation_status: ConsultationStatus;
  created_at: string;
  profiles?: { full_name: string };
}

export interface BookingReview {
  id: string;
  booking_id: string;
  customer_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface WizardSelection {
  serviceType: string;
  serviceItemId: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  priceDelta: number;
  metadata?: Record<string, unknown>;
}

export interface PricingBreakdown {
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  reservationFee: number;
  remainingBalance: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      event_types: { Row: EventType; Insert: Partial<EventType>; Update: Partial<EventType> };
      packages: { Row: Package; Insert: Partial<Package>; Update: Partial<Package> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      favorites: { Row: Favorite; Insert: Partial<Favorite>; Update: Partial<Favorite> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
    };
  };
}
