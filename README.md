# phone-recommendation

> A smart smartphone exploration and comparison platform — not an e-commerce store.

PhoneRecommendation helps users discover the right phone through a lifestyle-based survey, advanced filtering, side-by-side comparison, and a personal shortlist. Administrators manage the catalog, users, and gain insights through a dedicated analytics console.

---

## Features

### User-Facing
| Feature | Description |
|---------|-------------|
| **Onboarding Survey** | Lifestyle questions (budget, primary use, camera preference, brand) that auto-configure filters |
| **Explore / Filter** | RAM, Storage, Chipset tier, 5G, NFC, Brand, Price filters with live results |
| **Phone Detail** | Full specs: chipset, display, camera, battery, connectivity |
| **Compare** | Side-by-side comparison of up to 4 phones |
| **Shortlist** | Save phones to a personal list |
| **Profile** | View preferences and account info |

### Admin Console (`/admin`)
| Page | Description |
|------|-------------|
| **Dashboard** | Stat cards (users, phones, saves, comparisons), trending phones, recent signups, brand & use-case charts |
| **Phones** | Search/filter catalog, feature/hide phones, edit, delete |
| **Users** | View all users, activate/deactivate, promote/demote admin |
| **Insights** | Most shortlisted/compared phones, survey distributions (use-case, budget, brand) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS Modules (Cyber-Glass design system) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT in HTTP-only cookies + bcrypt (cost 12) |
| Validation | express-validator (server) + HTML5 (client) |
| Data | 223 phones from GSMArena (73 columns) |

---

## Security Implementation

- **Passwords**: Hashed with `bcrypt` (cost factor 12) — plain text never stored or logged
- **Auth**: JWT signed with `HS256`, stored in `httpOnly; SameSite` cookies (XSS-proof)
- **Sessions**: 15-minute default JWT expiry; 7-day "remember me" option; 30-minute idle auto-logout
- **Password Reset**: `crypto.randomBytes(32)` token, SHA-256 hashed before storage, 1-hour expiry, single-use `used` flag
- **RBAC**: `authMiddleware` (JWT verify) + `adminGuard` (role check) on all protected routes
- **Input Sanitization**: `express-validator` on all POST/PATCH routes; `normalizeEmail()` applied

---

## Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone
git clone https://github.com/Ibrahim-umair/Web-Project.git
cd Web-Project

# 2. Server
cd server
cp .env.example .env          # fill in MONGO_URI, JWT_SECRET, CLIENT_URL
npm install
npm run dev                   # starts on :5000

# 3. Client (new terminal)
cd ../client
npm install
npm run dev                   # starts on :5173
```

### Environment Variables (`server/.env`)

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/phonefinder
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=15m
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Seed the Database

```bash
cd server
node scripts/importPhones.js   # imports phone_specs_wide.csv into MongoDB
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@phonefinder.app` | `Admin1234` |
| User | `user@phonefinder.app` | `User1234` |

---

## Project Structure

```
PRS/
 client/                 # React + Vite frontend
   src/
     components/         # Navbar, Footer, Layout, BrandLogo, PrivateRoute
     context/            # AuthContext, CompareContext
     pages/              # Home, Explore, Survey, Compare, Shortlist
       admin/            # Dashboard, ManagePhones, ManageUsers, Insights
     api/                # axios instance + API helpers
     utils/              # icons.jsx, brandPlaceholders.js
   public/               # Brand SVG logos
 server/                 # Express backend
   controllers/          # authController, phoneController, userController
   middleware/           # authMiddleware, adminGuard
   models/               # User, Phone, Preference, WishlistItem, PasswordResetToken
   routes/               # auth, phones, users, preferences, stats, compare
   scripts/              # importPhones.js (CSV seed)
```

---

## Live Demo

Hosted on Render: https://web-project-prs.onrender.com

---

## License

Built for educational purposes — FAST-NUCES Web Engineering (Semester 6).
