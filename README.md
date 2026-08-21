# Caloryx

Caloryx is a calorie and nutrition tracking web application designed to make food logging simple, fast, and practical, with a strong focus on Indian foods and everyday meals.

---

## Features

- **Fast Food Search:** Instant search with aliases and regional/Hindi names.
- **Extensive Database:** Tailored for Indian cuisine alongside common international foods.
- **Nutrient Tracking:** Track daily calories, protein, carbohydrates, fats, and fiber.
- **Natural Serving Sizes:** Log foods using practical portions such as 1 roti, 1 katori, 1 cup, 1 glass, or 1 piece.
- **Standardized Nutrition:** Dynamic scaling based on standard per-100g and per-100ml references.
- **Responsive UI:** Clean, mobile-friendly interface for seamless daily logging.

---

## Food Database & Methodology

### Nutritional Reference Standard

- **Solid Foods:** Reference values standardized per 100 g.
- **Liquid Foods:** Reference values standardized per 100 ml.
- **Dynamic Portioning:** Nutrition values scale dynamically based on selected serving sizes.

For example:

> White Rice: 100 g base reference → 1 cup ≈ 150 g

This allows Caloryx to calculate nutrition dynamically instead of storing separate nutritional values for every possible serving size.

### Database Schema

The food database includes:

- `id`
- `name`
- `hindi_name`
- `aliases`
- `category`
- `sub_category`
- `serving_basis`
- `default_serving_unit`
- `default_serving_weight_g`
- `calories_per_100g`
- `carbs_per_100g`
- `protein_per_100g`
- `fat_per_100g`
- `fiber_per_100g`
- `verification_status`
- `variability_notes`
- `data_source`

### Data Quality Tiers

- **Verified:** Foods supported by reliable nutritional references.
- **Recipe Dependent:** Foods whose nutritional values can vary significantly depending on ingredients and preparation.
- **Needs Verification:** Entries that require additional verification before being treated as authoritative.

---

## Tech Stack

- **Frontend:** React + Vite
- **Database:** Supabase
- **Hosting & Deployment:** Netlify
- **Version Control:** Git & GitHub

---

## Project Structure

```text
caloryx/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── ...
├── .env.example
├── package.json
└── README.md
```
