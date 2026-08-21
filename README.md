# Caloryx

A modern calorie and nutrition tracking application focused on making food logging fast, simple, and practical, with particularly strong coverage of Indian foods and everyday meals.

---

## Overview

Caloryx is built to remove the friction commonly associated with daily food tracking. Instead of navigating cluttered interfaces or searching through unverified crowdsourced databases, Caloryx provides a focused, responsive experience designed around realistic portion sizes, clear macronutrient targets, and everyday culinary staples.

---

## Features

- **Fast Food Search**: Instant search with support for food aliases, alternative names, and Hindi / regional terms.
- **Calorie & Macro Tracking**: Real-time tracking of daily caloric intake alongside protein, carbohydrates, and fats.
- **Natural Serving Sizes**: Log foods using practical household measurements (e.g., _1 roti_, _1 katori_, _1 cup_, _1 piece_, or _grams/ml_).
- **Dynamic Nutrition Calculations**: Automatically scales nutritional values based on selected portion sizes without hardcoded per-portion duplication.
- **Daily Progress Dashboard**: Visual calorie gauge showing consumed vs. remaining calories, dynamic budget status, and macro distribution.
- **Meal Categorization**: Log and organize food entries across Breakfast, Lunch, Dinner, and Snacks.
- **Quick Calorie Entry**: Fast-track logging for custom meals or dining out when exact ingredients are unknown.
- **Custom Food Library**: Save frequently consumed homemade recipes or specialty items for instant reuse.
- **Responsive & Mobile-First**: Optimized layout engineered for smooth interaction across mobile devices, tablets, and desktop screens.
- **Curated Food Database**: Practical coverage spanning traditional Indian dishes, daily staples, and common international foods.

---

## Food Database & Nutrition Methodology

### Curated Food Coverage

The Caloryx database prioritizes everyday foods and accurate preparation baselines rather than maintaining an unmanageable, noisy catalog. The collection includes:

- **Indian Staples**: Dals, lentils, legumes, khichdi, and grain preparations
- **Breads & Cereals**: Rotis, chapatis, parathas, dosas, idlis, and rice dishes
- **Vegetables & Curries**: Sabzis, stir-fries, and traditional gravies
- **Dairy & Eggs**: Paneer, curd/yogurt, milk, lassi, eggs, and cheeses
- **Poultry, Meat & Seafood**: Chicken, mutton, fish, and coastal preparations
- **Street Food & Snacks**: Chaats, samosas, pakoras, and regional savories
- **Traditional Sweets**: Halwa, kheer, laddoos, and festive desserts
- **Beverages**: Masala chai, filter coffee, buttermilk, juices, and shakes
- **Common International Foods**: Oats, salads, sandwiches, pasta, and global staples

Entries are periodically cleaned and consolidated to eliminate duplicate, corrupted, or impractical records.

---

## Serving-Size System & Methodology

Caloryx uses a standardized reference model to ensure mathematical consistency across all food items:

1. **Standard Base References**:
   - Solid foods are standardized to a **100 g** reference.
   - Liquid foods and beverages are standardized to a **100 ml** reference.
2. **Portion Mapping**:
   - Natural household measurements are mapped to approximate gram or milliliter weights.
3. **Dynamic Scaling**:
   - When a serving unit (e.g., _1 cup_ or _2 pieces_) is selected, the application computes nutritional values dynamically:

$$\text{Calories} = \left( \frac{\text{Base Calories}}{100} \right) \times (\text{Serving Weight in grams} \times \text{Quantity})$$

#### Example:

> **White Rice (Cooked)**
>
> - Base Reference: 100 g
> - Natural Portion: 1 cup ≈ 150 g
> - Caloryx calculates the nutritional value dynamically from the selected portion.

This methodology eliminates the need to store separate, hardcoded nutrition rows for every possible portion size.

---

## Data Quality & Verification

Nutrition values in Caloryx are structured around transparent data tiers:

| Tier                           | Description                                                                                                | Considerations                                                                                                            |
| :----------------------------- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **Verified Foods**             | Raw ingredients and standardized staples referenced from recognized nutritional tables (e.g., IFCT, USDA). | Consistent nutritional baseline with minimal preparation variance.                                                        |
| **Recipe-Dependent Dishes**    | Cooked, composite, and traditional regional recipes.                                                       | Values reflect standard preparation methods; actual values vary based on cooking oils, ghee, sugar, and regional recipes. |
| **Branded / Commercial Items** | Packaged goods and restaurant preparations.                                                                | Subject to manufacturer formulation and brand-specific ingredients.                                                       |

---

## Tech Stack

### Frontend

- **React 19** – UI library
- **Vite 7** – Next-generation build tool and dev server
- **Redux Toolkit & React-Redux** – Global state management for authentication and user profiles
- **React Router 7** – Client-side routing and protected navigation flows
- **Tailwind CSS v4** – Modern utility-first CSS engine
- **Phosphor Icons** – Cohesive, lightweight icon library

### Backend & Infrastructure

- **Supabase** – PostgreSQL database, row-level security (RLS), and authentication services
- **Netlify / Vercel** – Continuous deployment and static asset hosting
- **Git & GitHub** – Source control and release workflow

---

## Architecture & Project Structure

```text
caloryx/
├── public/
│   └── vite.svg
├── src/
│   ├── app/
│   │   └── store.js                # Redux Toolkit store configuration
│   ├── assets/                     # Static assets and icons
│   ├── components/
│   │   ├── CalorieGauge.jsx        # SVG circular progress centerpiece
│   │   ├── DateScroller.jsx        # Infinite horizontal date selector
│   │   ├── FoodDrawer.jsx          # Bottom-sheet / slide-over food logging engine
│   │   ├── Header.jsx              # Navigation header and user menu
│   │   ├── MacroBar.jsx            # Protein, Carbs, Fat progress bars
│   │   └── MealCard.jsx            # Categorized meal containers
│   ├── features/
│   │   └── auth/
│   │       ├── authSlice.js        # Auth state, profile caching, and reducers
│   │       └── initAuthListener.js # Supabase session synchronization
│   ├── hooks/
│   │   └── useFoods.js             # Food catalog fetching hook
│   ├── pages/
│   │   ├── AuthPage.jsx            # Sign-in and sign-up with validation
│   │   ├── DashboardPage.jsx       # Daily food diary and calorie dashboard
│   │   └── UserDetails.jsx         # Mifflin-St Jeor TDEE calculator & onboarding
│   ├── services/
│   │   ├── foodService.js          # Catalog, recents, favorites, and custom foods
│   │   ├── logService.js           # CRUD operations for daily meal logs
│   │   ├── profileService.js       # Profile management services
│   │   └── supabaseClient.js       # Configured Supabase client
│   ├── App.jsx                     # Route definitions and auth guards
│   ├── index.css                   # Design tokens, typography, and animations
│   └── main.jsx                    # Application entry point
├── .env.example                    # Environment variable template
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML entry template
├── package.json                    # Dependencies and scripts
└── vite.config.js                  # Vite configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn** / **pnpm**
- A **Supabase** project with standard `profiles`, `foods`, and `food_logs` tables

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AryanChidumalla/Caloryx.git
   cd caloryx
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

Caloryx requires the following environment variables for Supabase connectivity:

| Variable                 | Description                                           |
| :----------------------- | :---------------------------------------------------- |
| `VITE_SUPABASE_URL`      | The HTTPS URL of your Supabase project instance.      |
| `VITE_SUPABASE_ANON_KEY` | The public anonymous API key for client-side queries. |

> **Security Notice**: Never commit your `.env` file or private credentials to version control. Only public anonymous keys should be included in client-side builds.

---

## Development Scripts

The following scripts are defined in `package.json`:

```bash
# Start local development server with HMR
npm run dev

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Run ESLint across source files
npm run lint
```

---

## Deployment

Caloryx can be deployed to modern static hosting platforms such as **Netlify** or **Vercel**:

1. Push your code to a GitHub repository.
2. Link the repository to your hosting provider.
3. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add the production environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in your provider's project settings dashboard.
5. Deploy.

---

## Data Safety & Privacy

- **Authentication**: Managed via Supabase Auth with secure password hashing and token-based sessions.
- **Client Security**: Frontend requests operate via public anonymous keys scoped through database Row Level Security (RLS) policies.
- **Data Scoping**: User meal logs and personal profile metrics are strictly tied to authenticated user IDs.

---

## Disclaimer

Caloryx is developed for general nutrition tracking and informational purposes only. Nutritional data can vary depending on specific ingredients, preparation techniques, cooking oils, portion sizes, and commercial brands.

Caloryx is not a medical device, nor is it a substitute for professional medical advice, clinical diagnosis, or individualized dietary guidance from a registered dietitian or healthcare provider.

---

## Project Status

Caloryx is an actively developed project focused on refinement, performance optimization, and practical day-to-day usability.

---

## Future Improvements

- [ ] Expanded regional Indian dish database with localized variations
- [ ] Enhanced search with phonetic and fuzzy matching
- [ ] Additional localized serving unit measurements
- [ ] Weekly nutrient trend graphs and adherence statistics
- [ ] Offline caching and Progressive Web App (PWA) installation
