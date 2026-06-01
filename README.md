🥗 NutriPlan

NutriPlan is a smart meal planner and calorie tracking web application designed for students and busy young adults. It helps users plan meals, track calories and macronutrients, and maintain healthy eating habits with minimal effort.

🚀 Project Overview

Many students struggle with:

Lack of time for meal planning
Limited knowledge of calories and macros
Budget constraints for healthy eating
Difficulty tracking food intake consistently
NutriPlan solves this by providing:

Automated calorie & macro calculations
Simple food logging system
Weekly meal planning tools
Clean, mobile-first UX
🎯 Target Users

🎓 University students with limited time and budget
💼 Young professionals with busy schedules
🏋️ Fitness-focused users tracking macros and calories
⚙️ Tech Stack

Frontend

React 19 + Vite + TypeScript
Tailwind CSS + shadcn/ui
TanStack Query (React Query)
Zustand (state management)
Framer Motion (animations)
React Hook Form + Zod (validation)
Recharts (data visualization)
Lucide React (icons)
Backend

Node.js + Express.js (TypeScript)
JWT authentication (HttpOnly cookies)
bcryptjs (password hashing)
Zod validation
Database

SQLite + Prisma ORM
Other Tools

@dnd-kit (drag & drop)
concurrently (run full stack)
📦 Features

🟢 MVP Features

User registration & login (JWT auth)
Onboarding (age, weight, height, goal, activity level)
Automatic calorie calculation (Mifflin-St Jeor formula)
Food database (standard + custom foods)
Food logging (breakfast, lunch, dinner, snacks)
Daily macro tracking (protein, carbs, fat)
Meal planner (daily & weekly planning)
🟡 Future Features

Auto shopping list generation
Water intake tracking
Barcode food scanner
🧭 User Flow

Sign up and complete onboarding
Enter personal data and goals
System calculates daily calorie target
Create meal plan (daily/weekly)
Log food throughout the day
View progress on dashboard
🧩 Functional Requirements

FR-1: Automatic calorie calculation from user profile
FR-2: Food search and logging system
FR-3: Real-time macro tracking
FR-4: Secure storage of user data and history
🔒 Non-Functional Requirements

⚡ Performance: Pages load under 3 seconds
🔐 Security: Passwords hashed + JWT authentication
📈 Scalability: Supports 1000+ concurrent users
📱 Mobile-first responsive design
🎨 UI/UX Design Principles

Minimal and clean interface
Mobile-first design
Large touch targets (min 48px)
Bottom navigation (mobile)
Sidebar navigation (desktop)
Progress visualization (charts & circles)
Color Palette

Primary: Emerald (#10b981)
Background: Light (#f8fafc) / Dark (#0f172a)
Success: Green
Warning: Yellow
Danger: Red
🗄️ Database Schema

The project uses Prisma ORM with the following main models:

User (profile + onboarding data)
Food (nutrition database)
FoodLog (daily tracking)
Meal (saved meals)
MealItem (meal composition)
SavedMeal (favorites)
🏗️ Project Structure
