export interface AdminFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  type?: 'text' | 'numeric' | 'multiline' | 'tier';
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
  { key: 'description', label: 'Description', multiline: true },
  { key: 'contact', label: 'Contact Number', keyboardType: 'phone-pad' },
];

const packageTierField: AdminFieldConfig = { key: 'package_tier', label: 'Package Tier', type: 'tier' };
const withTierField = (fields: AdminFieldConfig[]): AdminFieldConfig[] => [packageTierField, ...fields];

export const ADMIN_MODULE_CONFIGS: Record<string, AdminModuleConfig[]> = {
  wedding: [
    {
      slug: 'venues',
      name: 'Venues',
      table: 'venues',
      route: 'venues',
      fields: withTierField([
        { key: 'name', label: 'Venue Name' },
        { key: 'category', label: 'Category' },
        { key: 'location', label: 'Location' },
        { key: 'capacity', label: 'Max Capacity', keyboardType: 'numeric' },
        { key: 'description', label: 'Description', multiline: true },
        { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
      ]),
    },
    { slug: 'catering', name: 'Catering', table: 'catering_options', route: 'catering', fields: withTierField([
      { key: 'name', label: 'Company Name' },
      { key: 'menu', label: 'Menu', multiline: true },
      { key: 'description', label: 'Description', multiline: true },
    ])},
    { slug: 'makeup-artists', name: 'Makeup Artists', table: 'makeup_artists', route: 'makeup-artists', fields: withTierField([
      { key: 'name', label: 'Name' },
      { key: 'business_name', label: 'Business Name' },
      { key: 'years_experience', label: 'Years Experience', keyboardType: 'numeric' },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
    ])},
    {
      slug: 'photographers',
      name: 'Photographers',
      table: 'photographers',
      route: 'photographers',
      nameField: 'studio_name',
      fields: withTierField([
        { key: 'name', label: 'Photographer Name' },
        { key: 'studio_name', label: 'Studio Name' },
        { key: 'description', label: 'Description', multiline: true },
        { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
      ]),
    },
    { slug: 'videographers', name: 'Videographers', table: 'videographers', route: 'videographers', fields: withTierField(defaultFields) },
    {
      slug: 'dresses',
      name: 'Wedding Dresses',
      table: 'wedding_dresses',
      route: 'dresses',
      fields: withTierField([
        { key: 'name', label: 'Dress Name' },
        { key: 'style', label: 'Style' },
        { key: 'size', label: 'Size' },
        { key: 'color', label: 'Color' },
        { key: 'description', label: 'Description', multiline: true },
      ]),
    },
    {
      slug: 'suits',
      name: 'Groom Suits',
      table: 'groom_suits',
      route: 'suits',
      fields: withTierField([
        { key: 'name', label: 'Suit Name' },
        { key: 'style', label: 'Style' },
        { key: 'color', label: 'Color' },
      ]),
    },
    {
      slug: 'cakes',
      name: 'Cakes',
      table: 'cakes',
      route: 'cakes',
      fields: withTierField([
        { key: 'name', label: 'Cake Name' },
        { key: 'tiers', label: 'Tiers', keyboardType: 'numeric' },
        { key: 'flavor', label: 'Flavor' },
        { key: 'description', label: 'Description', multiline: true },
      ]),
    },
    {
      slug: 'invitations',
      name: 'Invitations',
      table: 'invitation_templates',
      route: 'invitations',
      fields: withTierField([
        { key: 'name', label: 'Template Name' },
        { key: 'theme_color', label: 'Theme Color' },
        { key: 'description', label: 'Description', multiline: true },
      ]),
    },
    {
      slug: 'decorations',
      name: 'Decorations',
      table: 'decorations',
      route: 'decorations',
      nameField: 'theme_name',
      fields: withTierField([
        { key: 'theme_name', label: 'Theme Name' },
        { key: 'description', label: 'Description', multiline: true },
      ]),
    },
    {
      slug: 'entertainment',
      name: 'Entertainment',
      table: 'entertainment_options',
      route: 'entertainment',
      fields: withTierField([
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description', multiline: true },
      ]),
    },
    { slug: 'souvenirs', name: 'Souvenirs', table: 'souvenirs', route: 'souvenirs', fields: withTierField(defaultFields.slice(0, 2)) },
    {
      slug: 'bridal-cars',
      name: 'Bridal Cars',
      table: 'bridal_cars',
      route: 'bridal-cars',
      nameField: 'model',
      fields: withTierField([
        { key: 'model', label: 'Model' },
        { key: 'capacity', label: 'Capacity', keyboardType: 'numeric' },
        { key: 'description', label: 'Description', multiline: true },
      ]),
    },
  ],
  birthday: [
    {
      slug: 'venues',
      name: 'Venues',
      table: 'venues',
      route: 'venues',
      fields: withTierField([
        { key: 'name', label: 'Venue Name' },
        { key: 'category', label: 'Category' },
        { key: 'location', label: 'Location' },
        { key: 'capacity', label: 'Max Capacity', keyboardType: 'numeric' },
        { key: 'description', label: 'Description', multiline: true },
        { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
      ]),
    },
    {
      slug: 'cakes',
      name: 'Cakes',
      table: 'cakes',
      route: 'cakes',
      fields: withTierField([
        { key: 'name', label: 'Cake Name' },
        { key: 'tiers', label: 'Tiers', keyboardType: 'numeric' },
        { key: 'flavor', label: 'Flavor' },
        { key: 'description', label: 'Description', multiline: true },
      ]),
    },
    { slug: 'catering', name: 'Catering', table: 'catering_options', route: 'catering', fields: withTierField([
      { key: 'name', label: 'Company Name' }, { key: 'menu', label: 'Menu', multiline: true },
      { key: 'description', label: 'Description', multiline: true },
    ])},
    { slug: 'photographers', name: 'Photographers', table: 'photographers', route: 'photographers', nameField: 'studio_name', fields: withTierField([
      { key: 'name', label: 'Photographer Name' }, { key: 'studio_name', label: 'Studio Name' },
      { key: 'description', label: 'Description', multiline: true }, { key: 'contact', label: 'Contact', keyboardType: 'phone-pad' },
    ])},
    { slug: 'entertainment', name: 'Entertainment', table: 'entertainment_options', route: 'entertainment', fields: withTierField([
      { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description', multiline: true },
    ])},
    { slug: 'decorations', name: 'Decorations', table: 'decorations', route: 'decorations', nameField: 'theme_name', fields: withTierField([
      { key: 'theme_name', label: 'Theme Name' },
      { key: 'description', label: 'Description', multiline: true },
    ])},

    { slug: 'balloon', name: 'Balloon Decorations', table: 'balloon_decorations', route: 'balloon', fields: withTierField(defaultFields.slice(0, 2)) },
    { slug: 'mascots', name: 'Mascots', table: 'mascots', route: 'mascots', fields: withTierField(defaultFields.slice(0, 2)) },
    { slug: 'clowns', name: 'Clowns', table: 'clowns', route: 'clowns', fields: withTierField(defaultFields.slice(0, 2)) },
    { slug: 'hosts', name: 'Hosts', table: 'hosts', route: 'hosts', fields: withTierField(defaultFields) },
    { slug: 'photo-booth', name: 'Photo Booth', table: 'photo_booths', route: 'photo-booth', fields: withTierField(defaultFields.slice(0, 2)) },
    { slug: 'candy-buffet', name: 'Candy Buffet', table: 'candy_buffets', route: 'candy-buffet', fields: withTierField(defaultFields.slice(0, 2)) },
    { slug: 'giveaways', name: 'Giveaways', table: 'giveaways', route: 'giveaways', fields: withTierField(defaultFields.slice(0, 2)) },
    { slug: 'themes', name: 'Party Themes', table: 'birthday_themes', route: 'themes', fields: withTierField(defaultFields.slice(0, 2)) },
    { slug: 'games', name: 'Games', table: 'party_games', route: 'games', fields: withTierField(defaultFields.slice(0, 2)) },
  ],
};

export function getModuleConfig(eventType: string, moduleRoute: string): AdminModuleConfig | undefined {
  return ADMIN_MODULE_CONFIGS[eventType]?.find((m) => m.route === moduleRoute);
}
