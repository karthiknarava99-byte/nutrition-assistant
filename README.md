# 🥗 Nutrition Assistant App

A full-stack MERN (MongoDB, Express, React, Node.js) web application for personalized nutritional guidance and meal tracking.

## ✨ Features

- **Authentication** — Register, login, JWT-protected routes
- **Meal Logging** — Log breakfast, lunch, dinner, snacks with food items & macros
- **Nutrition Analytics** — Calorie trends, macro breakdown, BMI & TDEE calculator
- **Recipe Manager** — Create, browse, and filter healthy recipes
- **Profile & Goals** — Set calorie goals, activity level, dietary restrictions
- **Dashboard** — Daily summary with charts and today's meal overview

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)

---

### 1. Clone / Extract the project

```bash
cd nutrition-assistant
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nutrition_assistant
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Start the backend:
```bash
npm run dev       # with nodemon (auto-restart)
# or
npm start         # production
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

> The `"proxy": "http://localhost:5000"` in `frontend/package.json` routes API calls automatically.

---

## 📁 Project Structure

```
nutrition-assistant/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with profile & goals
│   │   ├── Meal.js          # Meal + food items schema
│   │   └── Recipe.js        # Recipe with ingredients & instructions
│   ├── routes/
│   │   ├── auth.js          # Register, login, /me
│   │   ├── meals.js         # CRUD + today's summary
│   │   ├── nutrition.js     # Analytics, BMI, TDEE
│   │   ├── profile.js       # Update profile & password
│   │   └── recipes.js       # CRUD recipes
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js
        ├── components/
        │   └── Sidebar.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js
        │   ├── MealsPage.js
        │   ├── NutritionPage.js
        │   ├── RecipesPage.js
        │   └── ProfilePage.js
        ├── App.js
        ├── index.js
        └── index.css
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Meals
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/meals` | Get meals (filter by `?date=`) |
| GET | `/api/meals/today` | Today's meals + totals |
| POST | `/api/meals` | Log a meal |
| PUT | `/api/meals/:id` | Update meal |
| DELETE | `/api/meals/:id` | Delete meal |

### Nutrition
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/nutrition/macros` | Today's macro breakdown |
| GET | `/api/nutrition/summary` | Weekly summary (`?days=7`) |
| GET | `/api/nutrition/bmi` | Calculate BMI |
| GET | `/api/nutrition/tdee` | Calculate TDEE |

### Recipes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/recipes` | List recipes (search/filter) |
| POST | `/api/recipes` | Create recipe |
| GET | `/api/recipes/:id` | Get recipe |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |

### Profile
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |
| PUT | `/api/profile/password` | Change password |

---

## 🏗 Production Build

```bash
cd frontend
npm run build
```

Then serve the `build/` folder with Express or any static host (Vercel, Netlify, etc.)

---

## 📝 Notes

- This app is designed to **complement** professional dietary advice, not replace it.
- Calorie and macro data must be entered manually — consider integrating a food database API (e.g., USDA FoodData, Nutritionix) for auto-lookup.
- For production, use MongoDB Atlas and set strong environment variables.

---

##  👤 Authors
* Narava Durga Srinivasa Rao - Team Lead
* Ganta Bhargav Teja - Member
* Nadisetti Durga Prasad - Member
* Pappu Syam Veere Venkata Kumar - Member
* Bula Sudhishna - Member

---
## 🔗 Demo Video Link

[🎥 Watch Demo Video](https://drive.google.com/file/d/1nAcw7Nl5iVvktTswYsNk1iE9-nsGD6p0/view?usp=drivesdk)

## 🌐 Project Link

[🚀 Open Nutrition Assistant](https://nutrition-assistant-kappa.vercel.app/)

---
##  📞 Support
  For Questions or Issues, Please open a GitHub issue or Contact the author directly.

---  