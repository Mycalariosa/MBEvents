# MBEvents

Mobile Event Planning and Booking Application built with React Native (Expo Go) and Supabase.

## Features

- **Customer**: Splash, onboarding, auth, home, categories, supplier browse, Wedding/Birthday customization wizard, bookings, payments, favorites, notifications, profile & settings
- **Admin (mobile)**: Dashboard, event management CRUD, booking approve/reject, planner progress, reports

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
   - `supabase/migrations/003_storage_setup.sql`
   - `supabase/migrations/004_fix_auth_and_security.sql`
   - `supabase/migrations/005_demo_users.sql` (optional demo logins)
3. Copy `.env.example` to `.env` and fill in your keys:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create admin user

After signing up a user, run in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### 4. Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go on your device.

## Project Structure

```
app/                  # Expo Router screens
src/
  components/         # Reusable UI components
  constants/          # App constants & admin module configs
  hooks/              # Auth, theme, notifications hooks
  lib/                # Supabase client
  services/           # Booking, payment, notification APIs
  stores/             # Zustand state (wizard, theme)
  types/              # TypeScript types
  utils/              # Pricing, validation
supabase/migrations/  # Database schema & seed data
```

## Payment Integration

Payment processing uses a local reference number generator. For production, configure PayMongo/Xendit via Supabase Edge Functions and set `EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY` in `.env`.
