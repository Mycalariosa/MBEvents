export interface AdminFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}

export interface AdminModuleConfig {
  slug: string;
  name: string;
  table: string;
  route: string;
  nameField?: string;
  priceField?: string;
  fields: AdminFieldConfig[];
}

const defaultFields: AdminFieldConfig[] = [
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price', keyboardType: 'numeric' },
  { key: 'description', label: 'Description', multiline: true },
  { key: 'contact', label: 'Contact Number', keyboardType: 'phone-pad' },
];

export const ADMIN_MODULE_CONFIGS: Record<string, AdminModuleConfig[]> = {
  wedding: [
    { slug: 'venues', name: 'Venues', table: 'venues', route: 'venues', fields: [
      { key: 'name', label: 'Venue Name' }, { key: 'category', label: 'Category' }, { key: 'location', label: 'Location' },
      { key: 'capacity', label: 'Max Capacity', keyboardType: 'numeric' }, { key: 'price', label: 'Price', keyboardType: 'numeric' },
      { key: 'description', label: 'Description', multiline: true }, { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
    ]},
    { slug: 'catering', name: 'Catering', table: 'catering_options', route: 'catering', fields: [
      { key: 'name', label: 'Company Name' }, { key: 'menu', label: 'Menu', multiline: true },
      { key: 'price_per_guest', label: 'Price per Guest', keyboardType: 'numeric' }, { key: 'price', label: 'Base Price', keyboardType: 'numeric' },
      { key: 'description', label: 'Description', multiline: true },
    ]},
    { slug: 'makeup-artists', name: 'Makeup Artists', table: 'makeup_artists', route: 'makeup-artists', fields: [
      { key: 'name', label: 'Name' }, { key: 'business_name', label: 'Business Name' }, { key: 'price', label: 'Price', keyboardType: 'numeric' },
      { key: 'years_experience', label: 'Years Experience', keyboardType: 'numeric' }, { key: 'description', label: 'Description', multiline: true },
      { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
    ]},
    { slug: 'photographers', name: 'Photographers', table: 'photographers', route: 'photographers', nameField: 'studio_name', fields: [
      { key: 'name', label: 'Photographer Name' }, { key: 'studio_name', label: 'Studio Name' }, { key: 'price', label: 'Price', keyboardType: 'numeric' },
      { key: 'description', label: 'Description', multiline: true }, { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
    ]},
    { slug: 'videographers', name: 'Videographers', table: 'videographers', route: 'videographers', fields: defaultFields },
    { slug: 'dresses', name: 'Wedding Dresses', table: 'wedding_dresses', route: 'dresses', priceField: 'rental_price', fields: [
      { key: 'name', label: 'Dress Name' }, { key: 'style', label: 'Style' }, { key: 'size', label: 'Size' }, { key: 'color', label: 'Color' },
      { key: 'rental_price', label: 'Rental Price', keyboardType: 'numeric' }, { key: 'description', label: 'Description', multiline: true },
    ]},
    { slug: 'suits', name: 'Groom Suits', table: 'groom_suits', route: 'suits', priceField: 'rental_price', fields: [
      { key: 'name', label: 'Suit Name' }, { key: 'style', label: 'Style' }, { key: 'color', label: 'Color' },
      { key: 'rental_price', label: 'Rental Price', keyboardType: 'numeric' },
    ]},
    { slug: 'cakes', name: 'Cakes', table: 'cakes', route: 'cakes', fields: [
      { key: 'name', label: 'Cake Name' }, { key: 'tiers', label: 'Tiers', keyboardType: 'numeric' }, { key: 'flavor', label: 'Flavor' },
      { key: 'price', label: 'Price', keyboardType: 'numeric' }, { key: 'description', label: 'Description', multiline: true },
    ]},
    { slug: 'invitations', name: 'Invitations', table: 'invitation_templates', route: 'invitations', fields: [
      { key: 'name', label: 'Template Name' }, { key: 'theme_color', label: 'Theme Color' }, { key: 'price', label: 'Price', keyboardType: 'numeric' },
      { key: 'description', label: 'Description', multiline: true },
    ]},
    { slug: 'decorations', name: 'Decorations', table: 'decorations', route: 'decorations', nameField: 'theme_name', fields: [
      { key: 'theme_name', label: 'Theme Name' }, { key: 'price', label: 'Price', keyboardType: 'numeric' }, { key: 'description', label: 'Description', multiline: true },
    ]},
    { slug: 'entertainment', name: 'Entertainment', table: 'entertainment_options', route: 'entertainment', fields: [
      { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'price', label: 'Price', keyboardType: 'numeric' },
      { key: 'description', label: 'Description', multiline: true },
    ]},
    { slug: 'souvenirs', name: 'Souvenirs', table: 'souvenirs', route: 'souvenirs', fields: defaultFields.slice(0, 3) },
    { slug: 'bridal-cars', name: 'Bridal Cars', table: 'bridal_cars', route: 'bridal-cars', nameField: 'model', fields: [
      { key: 'model', label: 'Model' }, { key: 'capacity', label: 'Capacity', keyboardType: 'numeric' },
      { key: 'price', label: 'Price', keyboardType: 'numeric' }, { key: 'description', label: 'Description', multiline: true },
    ]},
  ],
  birthday: [
    { slug: 'venues', name: 'Venues', table: 'venues', route: 'venues', fields: [
      { key: 'name', label: 'Venue Name' }, { key: 'category', label: 'Category' }, { key: 'location', label: 'Location' },
      { key: 'capacity', label: 'Max Capacity', keyboardType: 'numeric' }, { key: 'price', label: 'Price', keyboardType: 'numeric' },
      { key: 'description', label: 'Description', multiline: true }, { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
    ]},
    { slug: 'cakes', name: 'Cakes', table: 'cakes', route: 'cakes', fields: [
      { key: 'name', label: 'Cake Name' }, { key: 'tiers', label: 'Tiers', keyboardType: 'numeric' }, { key: 'flavor', label: 'Flavor' },
      { key: 'price', label: 'Price', keyboardType: 'numeric' }, { key: 'description', label: 'Description', multiline: true },
    ]},
    { slug: 'balloon', name: 'Balloon Decorations', table: 'balloon_decorations', route: 'balloon', fields: defaultFields.slice(0, 3) },
    { slug: 'mascots', name: 'Mascots', table: 'mascots', route: 'mascots', fields: defaultFields.slice(0, 3) },
    { slug: 'clowns', name: 'Clowns', table: 'clowns', route: 'clowns', fields: defaultFields.slice(0, 3) },
    { slug: 'hosts', name: 'Hosts', table: 'hosts', route: 'hosts', fields: defaultFields },
    { slug: 'photo-booth', name: 'Photo Booth', table: 'photo_booths', route: 'photo-booth', fields: defaultFields.slice(0, 3) },
    { slug: 'candy-buffet', name: 'Candy Buffet', table: 'candy_buffets', route: 'candy-buffet', fields: defaultFields.slice(0, 3) },
    { slug: 'giveaways', name: 'Giveaways', table: 'giveaways', route: 'giveaways', fields: defaultFields.slice(0, 3) },
    { slug: 'themes', name: 'Party Themes', table: 'birthday_themes', route: 'themes', fields: defaultFields.slice(0, 3) },
    { slug: 'games', name: 'Games', table: 'party_games', route: 'games', fields: defaultFields.slice(0, 3) },
  ],
};

export function getModuleConfig(eventType: string, moduleRoute: string): AdminModuleConfig | undefined {
  return ADMIN_MODULE_CONFIGS[eventType]?.find((m) => m.route === moduleRoute);
}
