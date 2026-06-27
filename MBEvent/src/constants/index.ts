export const COLORS = {
  primary: '#16213e',
  primaryDark: '#0f3460',
  secondary: '#0f3460',
  accent: '#efc07b',
  success: '#4f6b55',
  warning: '#c28a3d',
  error: '#8c4a41',
  white: '#f8f6f2',
  black: '#0f0f12',
  gray50: '#f2f4f7',
  gray100: '#e6e9ef',
  gray200: '#cfd6e1',
  gray300: '#aebfd4',
  gray400: '#8b9ab8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1a1a2e',
  gray900: '#0f1320',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

export const EVENT_CATEGORIES = [
  { slug: 'wedding', name: 'Wedding', icon: 'heart' as const, color: '#16213e' },
  { slug: 'birthday', name: 'Birthday', icon: 'gift' as const, color: '#0f3460' },
  { slug: 'debut', name: 'Debut', icon: 'star' as const, color: '#16213e' },
  { slug: 'christening', name: 'Christening', icon: 'water' as const, color: '#1a1a2e' },
  { slug: 'corporate', name: 'Corporate', icon: 'briefcase' as const, color: '#16213e' },
  { slug: 'anniversary', name: 'Anniversary', icon: 'rose' as const, color: '#efc07b' },
  { slug: 'graduation', name: 'Graduation', icon: 'school' as const, color: '#16213e' },
  { slug: 'engagement', name: 'Engagement', icon: 'diamond-stone' as const, color: '#efc07b' },
];

export const WEDDING_SUBCATEGORIES = [
  { slug: 'venues', name: 'Venues', table: 'venues' },
  { slug: 'catering', name: 'Catering', table: 'catering_options' },
  { slug: 'photographer', name: 'Photographer', table: 'photographers' },
  { slug: 'videographer', name: 'Videographer', table: 'videographers' },
  { slug: 'makeup-artist', name: 'Makeup Artist', table: 'makeup_artists' },
  { slug: 'decoration', name: 'Decoration', table: 'decorations' },
  { slug: 'host', name: 'Host', table: 'hosts' },
  { slug: 'cake', name: 'Cake', table: 'cakes' },
  { slug: 'souvenir', name: 'Souvenir Shop', table: 'souvenirs' },
];

export const WEDDING_WIZARD_STEPS = [
  { key: 'venue', label: 'Venue', table: 'venues' },
  { key: 'catering', label: 'Catering', table: 'catering_options' },
  { key: 'photography', label: 'Photography', table: 'photographers' },
  { key: 'videography', label: 'Videography', table: 'videographers' },
  { key: 'makeup', label: 'Makeup Artist', table: 'makeup_artists' },
  { key: 'dress', label: 'Wedding Dress', table: 'wedding_dresses' },
  { key: 'suit', label: 'Groom Suit', table: 'groom_suits' },
  { key: 'cake', label: 'Cake', table: 'cakes' },
  { key: 'invitation', label: 'Invitation Design', table: 'invitation_templates' },
  { key: 'decoration', label: 'Decorations', table: 'decorations' },
  { key: 'entertainment', label: 'Entertainment', table: 'entertainment_options' },
  { key: 'transportation', label: 'Transportation', table: 'bridal_cars' },
  { key: 'review', label: 'Review & Checkout', table: null },
];

export const BIRTHDAY_WIZARD_STEPS = [
  { key: 'venue', label: 'Venue', table: 'venues' },
  { key: 'theme', label: 'Theme', table: 'birthday_themes' },
  { key: 'cake', label: 'Cake', table: 'cakes' },
  { key: 'catering', label: 'Food/Catering', table: 'catering_options' },
  { key: 'photography', label: 'Photographer', table: 'photographers' },
  { key: 'host', label: 'Host', table: 'hosts' },
  { key: 'balloon', label: 'Balloon Decoration', table: 'balloon_decorations' },
  { key: 'entertainment', label: 'Mascots/Clown/Magician', table: 'mascots' },
  { key: 'games', label: 'Party Games/Candy Buffet', table: 'party_games' },
  { key: 'photo-booth', label: 'Photo Booth/Giveaways', table: 'photo_booths' },
  { key: 'music', label: 'Music', table: 'entertainment_options' },
  { key: 'tables', label: 'Tables & Chairs', table: 'decorations' },
  { key: 'review', label: 'Review & Checkout', table: null },
];

export const PLANNER_PROGRESS_STEPS = [
  { key: 'confirmed', label: 'Reservation Confirmed' },
  { key: 'planner_assigned', label: 'Planner Assigned' },
  { key: 'venue_reserved', label: 'Venue Reserved' },
  { key: 'cake_ordered', label: 'Cake Ordered' },
  { key: 'invitation_printed', label: 'Invitation Printed' },
  { key: 'dress_fitted', label: 'Dress Fitted' },
  { key: 'suppliers_confirmed', label: 'Suppliers Confirmed' },
  { key: 'final_meeting', label: 'Final Meeting' },
  { key: 'event_finished', label: 'Event Finished' },
];

export const ONBOARDING_PAGES = [
  {
    title: 'Plan Your Perfect Event',
    description: 'Create unforgettable birthdays, weddings, debuts, corporate events and more.',
    icon: 'calendar-star',
  },
  {
    title: 'Find Trusted Event Suppliers',
    description: 'Browse photographers, caterers, makeup artists, venues, decorators and many more.',
    icon: 'account-group',
  },
  {
    title: 'Book Everything in One App',
    description: 'Reserve your preferred services, monitor bookings and communicate with suppliers.',
    icon: 'check-decagram',
  },
];

export const PAYMENT_METHODS = [
  { id: 'gcash' as const, name: 'GCash', icon: 'cellphone' },
  { id: 'maya' as const, name: 'Maya', icon: 'wallet' },
  { id: 'card' as const, name: 'Credit/Debit Card', icon: 'credit-card' },
  { id: 'cash' as const, name: 'Cash', icon: 'cash' },
];

export const BOOKING_STATUSES = [
  { id: 'pending', label: 'Pending', color: '#F59E0B' },
  { id: 'confirmed', label: 'Confirmed', color: '#22C55E' },
  { id: 'ongoing', label: 'Ongoing', color: '#6B4EFF' },
  { id: 'completed', label: 'Completed', color: '#374151' },
  { id: 'cancelled', label: 'Cancelled', color: '#EF4444' },
];

export const SERVICE_FEE_RATE = 0.05;

export const ADMIN_WEDDING_MODULES = [
  { slug: 'packages', name: 'Packages', table: 'packages', route: 'packages' },
  { slug: 'venues', name: 'Venues', table: 'venues', route: 'venues' },
  { slug: 'catering', name: 'Catering', table: 'catering_options', route: 'catering' },
  { slug: 'makeup-artists', name: 'Makeup Artists', table: 'makeup_artists', route: 'makeup-artists' },
  { slug: 'photographers', name: 'Photographers', table: 'photographers', route: 'photographers' },
  { slug: 'videographers', name: 'Videographers', table: 'videographers', route: 'videographers' },
  { slug: 'dresses', name: 'Wedding Dresses', table: 'wedding_dresses', route: 'dresses' },
  { slug: 'suits', name: 'Groom Suits', table: 'groom_suits', route: 'suits' },
  { slug: 'cakes', name: 'Cakes', table: 'cakes', route: 'cakes' },
  { slug: 'invitations', name: 'Invitations', table: 'invitation_templates', route: 'invitations' },
  { slug: 'decorations', name: 'Decorations', table: 'decorations', route: 'decorations' },
  { slug: 'entertainment', name: 'Entertainment', table: 'entertainment_options', route: 'entertainment' },
  { slug: 'souvenirs', name: 'Souvenirs', table: 'souvenirs', route: 'souvenirs' },
  { slug: 'bridal-cars', name: 'Bridal Cars', table: 'bridal_cars', route: 'bridal-cars' },
];

export const ADMIN_BIRTHDAY_MODULES = [
  { slug: 'packages', name: 'Packages', table: 'packages', route: 'packages' },
  { slug: 'venues', name: 'Venues', table: 'venues', route: 'venues' },
  { slug: 'cakes', name: 'Cakes', table: 'cakes', route: 'cakes' },
  { slug: 'balloon', name: 'Balloon Decorations', table: 'balloon_decorations', route: 'balloon' },
  { slug: 'mascots', name: 'Mascots', table: 'mascots', route: 'mascots' },
  { slug: 'clowns', name: 'Clowns', table: 'clowns', route: 'clowns' },
  { slug: 'hosts', name: 'Hosts', table: 'hosts', route: 'hosts' },
  { slug: 'photo-booth', name: 'Photo Booth', table: 'photo_booths', route: 'photo-booth' },
  { slug: 'candy-buffet', name: 'Candy Buffet', table: 'candy_buffets', route: 'candy-buffet' },
  { slug: 'giveaways', name: 'Giveaways', table: 'giveaways', route: 'giveaways' },
  { slug: 'themes', name: 'Party Themes', table: 'birthday_themes', route: 'themes' },
  { slug: 'games', name: 'Games', table: 'party_games', route: 'games' },
];
