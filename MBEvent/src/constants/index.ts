export const COLORS = {
  primary: '#213155',
  primaryDark: '#1C2A4A',
  secondary: '#122F5B',
  accent: '#D4AF37',
  success: '#5C8F74',
  warning: '#D4AF37',
  error: '#BF4C41',
  white: '#FBFBFD',
  black: '#101828',
  gray50: '#F6F7FB',
  gray100: '#EEF2FB',
  gray200: '#DCE5F4',
  gray300: '#B8C3E1',
  gray400: '#8F9CCA',
  gray500: '#6D7BB0',
  gray600: '#505F90',
  gray700: '#384B72',
  gray800: '#223556',
  gray900: '#101F38',
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
  { slug: 'wedding', name: 'Wedding', icon: 'heart' as const, color: '#efc07b' },
  { slug: 'birthday', name: 'Birthday', icon: 'gift' as const, color: '#efc07b' },
  { slug: 'debut', name: 'Debut', icon: 'star' as const, color: '#efc07b' },
  { slug: 'christening', name: 'Christening', icon: 'water' as const, color: '#efc07b' },
  { slug: 'corporate', name: 'Corporate', icon: 'briefcase' as const, color: '#efc07b' },
  { slug: 'anniversary', name: 'Anniversary', icon: 'cards-heart' as const, color: '#efc07b' },
  { slug: 'graduation', name: 'Graduation', icon: 'school' as const, color: '#efc07b' },
  { slug: 'engagement', name: 'Engagement', icon: 'ring' as const, color: '#efc07b' },
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
  { key: 'catering_confirmed', label: 'Catering Confirmed' },
  { key: 'photographer_assigned', label: 'Photographer Assigned' },
  { key: 'cake_ordered', label: 'Cake Ordered' },
  { key: 'decorations_in_progress', label: 'Decorations In Progress' },
  { key: 'program_finalized', label: 'Program Finalized' },
  { key: 'event_ready', label: 'Event Ready' },
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
  { id: 'pending', label: 'Pending Review', color: '#F59E0B' },
  { id: 'changes_requested', label: 'Changes Requested', color: '#F97316' },
  { id: 'approved', label: 'Approved', color: '#3B82F6' },
  { id: 'confirmed', label: 'Confirmed', color: '#22C55E' },
  { id: 'ongoing', label: 'Ongoing', color: '#6B4EFF' },
  { id: 'completed', label: 'Completed', color: '#374151' },
  { id: 'cancelled', label: 'Cancelled', color: '#EF4444' },
];

export const CONSULTATION_STATUSES = [
  { id: 'waiting', label: 'Waiting', color: '#F59E0B' },
  { id: 'in_consultation', label: 'In Consultation', color: '#3B82F6' },
  { id: 'finished', label: 'Finished', color: '#22C55E' },
];

export const BRANCH_LOCATIONS = [
  'MBEvents Main Office - Quezon City',
  'MBEvents Branch - Makati',
  'MBEvents Branch - Cebu',
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
