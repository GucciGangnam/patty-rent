# PattyApp

## Overview
A SaaS web application for real estate agents and their teams to manage and search rental property listings within their organisation.

---

## Tech Stack

- **Frontend:** React 18+ with Vite
- **Styling:** Tailwind CSS
- **State Management:** React Query (server state) + React Context (auth/UI state)
- **Backend:** Supabase (Postgres DB, Auth, Storage, Row Level Security)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Future:** PWA conversion

---

## Core Concepts

### Organisations
- Every user belongs to exactly one organisation
- Organisations have a unique **join code** for signup
- All properties are scoped to an organisation

### User Roles
| Role | Permissions |
|------|-------------|
| **manager** | Full access: create/edit/delete properties, manage org settings, invite users |
| **agent** | View all properties, search/filter, view property details |
| **viewer** | View all properties, search/filter, view property details (read-only) |

### Properties (Rental Assets)
- Managed exclusively by managers via a multi-step wizard
- All property fields are nullable (partial data allowed)
- Properties belong to one organisation

---

## Data Models (Supabase Tables)

### `organisations`
```sql
id: uuid PRIMARY KEY
name: text NOT NULL
join_code: text UNIQUE NOT NULL
created_at: timestamptz DEFAULT now()
```

### `users` (extends Supabase auth.users)
```sql
id: uuid PRIMARY KEY REFERENCES auth.users(id)
organisation_id: uuid REFERENCES organisations(id) NOT NULL
role: text CHECK (role IN ('manager', 'agent', 'viewer')) NOT NULL
first_name: text
last_name: text
phone: text
created_at: timestamptz DEFAULT now()
```

### `properties`
```sql
id: uuid PRIMARY KEY
organisation_id: uuid REFERENCES organisations(id) NOT NULL
created_by: uuid REFERENCES users(id)
status: text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived'))
created_at: timestamptz DEFAULT now()
updated_at: timestamptz DEFAULT now()

-- Location
address_line_1: text
address_line_2: text
city: text
state: text
postcode: text
country: text DEFAULT 'Australia'
latitude: decimal
longitude: decimal

-- Dimensions
bedrooms: integer
bathrooms: integer
parking_spaces: integer
floor_area_sqm: decimal
land_area_sqm: decimal
floors: integer

-- Property Type
property_type: text CHECK (property_type IN ('apartment', 'house', 'townhouse', 'unit', 'studio', 'villa', 'other'))
furnished: text CHECK (furnished IN ('furnished', 'unfurnished', 'partially'))

-- Pricing
rent_weekly: decimal
rent_monthly: decimal
bond: decimal
available_from: date
lease_min_months: integer
lease_max_months: integer

-- Occupancy
max_occupants: integer
pets_allowed: boolean
smokers_allowed: boolean

-- Description
title: text
description: text
internal_notes: text
```

### `property_images`
```sql
id: uuid PRIMARY KEY
property_id: uuid REFERENCES properties(id) ON DELETE CASCADE
storage_path: text NOT NULL
display_order: integer DEFAULT 0
is_primary: boolean DEFAULT false
created_at: timestamptz DEFAULT now()
```

### `property_amenities`
```sql
id: uuid PRIMARY KEY
property_id: uuid REFERENCES properties(id) ON DELETE CASCADE
amenity: text NOT NULL
-- Common amenities: 'air_conditioning', 'heating', 'dishwasher', 'washing_machine',
-- 'dryer', 'balcony', 'courtyard', 'pool', 'gym', 'security', 'intercom',
-- 'garage', 'storage', 'internet', 'cable_tv'
```

### `property_rooms`
```sql
id: uuid PRIMARY KEY
property_id: uuid REFERENCES properties(id) ON DELETE CASCADE
room_type: text NOT NULL -- 'bedroom', 'bathroom', 'living', 'kitchen', 'laundry', 'study', 'garage', 'other'
name: text
width_m: decimal
length_m: decimal
notes: text
```

---

## Authentication Flow

### Sign Up (with org code)
1. User enters email, password, first name, last name
2. User enters organisation join code
3. System validates join code exists
4. Create auth user in Supabase
5. Create user record with organisation_id and role='viewer' (default)
6. Redirect to search page

### Sign In
1. User enters email, password
2. Supabase auth validates credentials
3. Fetch user profile with organisation
4. Redirect to search page

### Session
- Use Supabase auth session (JWT)
- Auth context provides: user, organisation, role, loading state
- Protected routes redirect to login if unauthenticated

---

## App Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css (Tailwind imports)
├── lib/
│   ├── supabase.ts (Supabase client)
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProperties.ts
│   └── useOrganisation.ts
├── context/
│   └── AuthContext.tsx
├── components/
│   ├── ui/ (reusable: Button, Input, Card, Modal, etc.)
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── AppShell.tsx
│   │   └── ProtectedRoute.tsx
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyList.tsx
│   │   ├── PropertyFilters.tsx
│   │   └── wizard/
│   │       ├── PropertyWizard.tsx
│   │       ├── LocationStep.tsx
│   │       ├── DimensionsStep.tsx
│   │       ├── ImagesStep.tsx
│   │       ├── RoomsStep.tsx
│   │       ├── AmenitiesStep.tsx
│   │       ├── PricingStep.tsx
│   │       └── ReviewStep.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       └── SignupForm.tsx
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Search.tsx
│   ├── PropertyDetail.tsx
│   ├── Account.tsx
│   └── manager/
│       ├── CreateProperty.tsx
│       └── OrganisationSettings.tsx
└── types/
    └── index.ts
```

---

## Routes

| Path | Component | Access |
|------|-----------|--------|
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/` | Search | All authenticated |
| `/property/:id` | PropertyDetail | All authenticated |
| `/account` | Account | All authenticated |
| `/manager/property/new` | CreateProperty | Manager only |
| `/manager/property/:id/edit` | CreateProperty | Manager only |
| `/manager/organisation` | OrganisationSettings | Manager only |

---

## UI Components

### Bottom Navigation (2 tabs)
1. **Search** (icon: magnifying glass) - `/`
2. **Account** (icon: user) - `/account`

### Search Page
- Search bar at top
- Filter chips/button to open filter panel
- Property cards in grid/list view
- Filters include: price range, bedrooms, bathrooms, property type, location, availability

### Account Page
- User profile section (name, email, phone)
- Organisation info (name, role)
- **Manager only:** Organisation settings link, user management
- Logout button

### Property Wizard Steps (Manager only)
1. **Location** - Address fields, optional map pin
2. **Dimensions** - Beds, baths, parking, floor area, land area
3. **Type & Furnishing** - Property type dropdown, furnished status
4. **Images** - Upload multiple images, set primary, reorder
5. **Rooms** - Add/remove rooms with dimensions
6. **Amenities** - Checkbox grid of common amenities
7. **Pricing & Availability** - Rent, bond, available date, lease terms
8. **Occupancy** - Max occupants, pets, smokers
9. **Description** - Title, description, internal notes
10. **Review** - Summary of all entered data, publish button

---

## Row Level Security (RLS) Policies

```sql
-- Users can only see their own organisation's data
CREATE POLICY "Users see own org properties" ON properties
  FOR SELECT USING (
    organisation_id = (SELECT organisation_id FROM users WHERE id = auth.uid())
  );

-- Only managers can insert/update/delete properties
CREATE POLICY "Managers manage properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND organisation_id = properties.organisation_id
      AND role = 'manager'
    )
  );
```

---

## Initial Implementation Priority

### Phase 1: Foundation
1. Supabase project setup with tables and RLS
2. React app with Vite + Tailwind
3. Auth context and Supabase client
4. Login and Signup pages
5. Protected route wrapper
6. Bottom navigation shell
7. Basic Search page (placeholder)
8. Basic Account page

### Phase 2: Core Features
1. Property wizard (all steps)
2. Property listing on search page
3. Search and filter functionality
4. Property detail page

### Phase 3: Polish
1. Image upload to Supabase Storage
2. Organisation management for managers
3. PWA manifest and service worker

---

## Environment Variables

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Notes

- All property fields are nullable to allow partial/draft listings
- Managers can save properties as draft and publish when complete
- Search should be fast with indexed fields (city, bedrooms, rent_weekly, property_type)
- Mobile-first responsive design for future PWA
