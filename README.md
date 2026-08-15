<div align="center">

# 🛒 SnapCart

### A Full-Stack Real-Time Grocery Delivery Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-snapcart--d.vercel.app-emerald?style=for-the-badge)](https://snapcart-d.vercel.app)
[![Socket Server](https://img.shields.io/badge/⚡_Socket_Server-Render-blueviolet?style=for-the-badge)](https://socketserver-snapcart.onrender.com)

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

**SnapCart** is a production-ready, full-stack grocery delivery application with three distinct portals — **Customer**, **Admin**, and **Delivery Partner** — connected through real-time WebSocket communication, live GPS tracking, in-app chat, and Stripe-powered online payments.

</div>

---

## ✨ Feature Highlights

### 🧑‍💻 Customer Portal
- **Browse & Search** — Filter groceries by 15 categories with instant search
- **Smart Cart** — Add/remove items with automatic subtotal, delivery fee (free above ₹250), and platform fee calculation
- **Interactive Checkout** — Leaflet map with address autocomplete and GPS-based location pinning
- **Dual Payment** — Cash on Delivery (COD) or Stripe online checkout with webhook verification
- **Live Order Tracking** — Real-time GPS tracking of assigned delivery partner on an interactive map
- **In-App Chat** — Socket.IO-powered real-time messaging with the assigned delivery partner
- **Order History** — View all past and active orders with status badges
- **OTP Verification** — Email OTP sent to customer for secure delivery confirmation

### 🛡️ Admin Portal
- **Analytics Dashboard** — Area charts (order/revenue trends), pie charts (status distribution), and KPI cards powered by Recharts
- **Order Management** — Live order feed with real-time `new-order` and `order-status-update` socket events; toggle payment status, update order stages
- **Grocery CRUD** — Add, edit, and delete grocery items with Cloudinary image uploads
- **Delivery Assignment** — Geospatial broadcasting of orders to nearby delivery partners using MongoDB 2dsphere index and Haversine distance calculation
- **Role-Based Access** — Middleware-enforced route protection for `/admin/*` routes

### 🚚 Delivery Partner Portal
- **Assignment Dashboard** — View broadcasted delivery assignments with distance calculation from current location
- **Accept/Reject Flow** — Accept assignments in real-time; rejected assignments are rebroadcasted
- **Current Order View** — Active delivery details with customer address, items, payment info, and navigation link
- **OTP-Based Delivery** — Send delivery OTP via email to customer, verify on handoff to complete delivery
- **Earnings & Progress** — Detailed analytics: total deliveries, earnings, COD collected, average delivery time, weekly trends, and performance streaks
- **Live Location Sharing** — Continuous GPS broadcasting to allow customers to track delivery in real-time

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐                     │
│  │ Customer │  │  Admin   │  │ Delivery Boy  │                     │
│  │  Portal  │  │  Portal  │  │    Portal     │                     │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘                     │
│       │              │               │                              │
│       └──────────────┼───────────────┘                              │
│                      │                                              │
│              Socket.IO Client                                       │
│         (identity, update-location,                                 │
│          join-room, send-message,                                   │
│          new-order, order-status-update)                             │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ WebSocket + Polling
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    SOCKET SERVER (Render)                            │
│                  Express + Socket.IO                                 │
│                                                                      │
│  Events:                          HTTP Endpoint:                     │
│  • identity → sync socketId      • POST /notify → emit to           │
│  • update-location → broadcast      specific socket or broadcast    │
│  • join-room → chat rooms         • GET / → health check            │
│  • send-message → relay                                              │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTP (POST /notify)
                       ▲
┌──────────────────────┴──────────────────────────────────────────────┐
│                   NEXT.JS SERVER (Vercel)                           │
│                                                                      │
│  Middleware (proxy.ts):                                              │
│  • Session cookie auth (better-auth)                                │
│  • Role-based route guards (user/admin/deliveryBoy)                 │
│                                                                      │
│  API Routes (/api/auth/*):                                          │
│  ├── [...all]              → Better Auth handler                    │
│  ├── register              → User signup with role + mobile         │
│  ├── me                    → Current user profile                   │
│  ├── check-for-admin       → Admin role verification                │
│  ├── admin/                                                         │
│  │   ├── dashboard-stats   → KPIs, charts, trends                  │
│  │   ├── get-orders        → All confirmed orders (CRUD)           │
│  │   ├── add-grocery       → Create grocery + Cloudinary upload     │
│  │   ├── groceries         → List/search groceries                  │
│  │   ├── grocery/[id]      → Update/delete grocery item             │
│  │   └── update-order-status/[orderid] → Status + assignment logic  │
│  ├── user/                                                          │
│  │   ├── order             → Place COD order + list user orders     │
│  │   ├── payment           → Stripe checkout session creation       │
│  │   ├── payment/verify    → Verify Stripe session & emit events    │
│  │   ├── stripe/webhook    → Stripe webhook handler                 │
│  │   ├── track-order/[id]  → Order details + delivery boy info      │
│  │   └── edit-role-mobile  → Profile completion                     │
│  ├── delivery/                                                      │
│  │   ├── get-assignments   → Broadcasted assignments                │
│  │   ├── assignment/[id]/accept-assignment                          │
│  │   ├── assignment/[id]/complete-assignment                        │
│  │   ├── reject-assignment → Reject + rebroadcast                   │
│  │   ├── current-order     → Active delivery details                │
│  │   ├── progress          → Earnings + delivery history            │
│  │   ├── otp/send          → Email OTP to customer                  │
│  │   └── otp/verify        → Verify delivery OTP                   │
│  ├── socket/                                                        │
│  │   ├── connect           → Persist socketId to user doc           │
│  │   └── update-location   → Persist GeoJSON coordinates            │
│  └── chat/                                                          │
│      ├── create            → Create/find chat room                  │
│      ├── messages          → Fetch chat history                     │
│      └── save              → Persist message                        │
│                                                                      │
│  Services:                                                          │
│  • MongoDB (Mongoose ODM)     • Cloudinary (image CDN)              │
│  • Better Auth (sessions)     • Stripe (payments)                   │
│  • Nodemailer (delivery OTP)  • Haversine (geo distance)            │
└──────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB Atlas)                        │
│                                                                      │
│  Collections:                                                        │
│  ├── user          → name, email, password, role, mobile,           │
│  │                   location (2dsphere), socketId, isOnline        │
│  ├── order         → items[], totalAmount, paymentMethod,           │
│  │                   address (with lat/lng), status, isPaid,        │
│  │                   assignedDeliveryBoy, deliveryOtp               │
│  ├── grocery       → name, category, price, unit, image             │
│  ├── deliveryassignment → order, broadcastedTo[], assignedTo,       │
│  │                         status (broadcasted/assigned/completed)  │
│  ├── chatroom      → userId, deliveryBoyId, orderId                 │
│  ├── message       → chatRoom, senderId, text, time                 │
│  └── session/account/verification (Better Auth managed)             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5, React 19 |
| **Styling** | Tailwind CSS 4 |
| **State Management** | Redux Toolkit (cart, user) |
| **Authentication** | Better Auth (email/password + Google OAuth) |
| **Database** | MongoDB Atlas + Mongoose 9 ODM |
| **Real-Time** | Socket.IO (client + dedicated server) |
| **Payments** | Stripe Checkout + Webhooks |
| **Maps** | Leaflet + React-Leaflet + OpenStreetMap |
| **Geocoding** | leaflet-geosearch (OSM provider) |
| **Image Storage** | Cloudinary CDN |
| **Email** | Nodemailer (Gmail SMTP) |
| **Charts** | Recharts (Area, Bar, Pie) |
| **Animations** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Hosting** | Vercel (Next.js) + Render (Socket Server) |

---

## 📁 Project Structure

```
snapcart/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Home (role-based redirect)
│   │   ├── auth/
│   │   │   ├── login/                # Login page
│   │   │   └── register/             # Registration page
│   │   ├── admin/
│   │   │   ├── page.tsx              # Admin analytics dashboard
│   │   │   ├── layout.tsx            # Admin layout + auth guard
│   │   │   ├── add-grocery/          # Add new grocery item
│   │   │   ├── manage-orders/        # Live order management
│   │   │   └── view-groceries/       # Grocery inventory
│   │   ├── user/
│   │   │   ├── cart/                 # Shopping cart
│   │   │   ├── checkout/             # Checkout with map
│   │   │   ├── my-orders/            # Order history
│   │   │   ├── order-success/        # Post-order confirmation
│   │   │   └── track-order/[id]/     # Live GPS tracking
│   │   ├── delivery/
│   │   │   ├── current-order/        # Active delivery view
│   │   │   └── progress/             # Earnings & stats
│   │   └── api/auth/                 # 30+ REST API routes
│   ├── components/                   # 20 React components
│   │   ├── Nav.tsx                   # Main navigation (27KB)
│   │   ├── AdminNav.tsx              # Admin navigation
│   │   ├── HeroSection.tsx           # Landing hero carousel
│   │   ├── CategorySlider.tsx        # Category filter strip
│   │   ├── GroceryItemCard.tsx       # Product card
│   │   ├── AdminOrderCard.tsx        # Order management card
│   │   ├── DeliveryBoyDashboard.tsx  # Assignment dashboard
│   │   ├── DeliveryProgressTracker.tsx # Earnings analytics (42KB)
│   │   ├── DeliveryChat.tsx          # Real-time chat
│   │   ├── LiveTrackingMap.tsx       # GPS tracking map
│   │   ├── LoginForm.tsx             # Auth form
│   │   ├── RegisterForm.tsx          # Registration form
│   │   └── ...
│   ├── models/                       # 6 Mongoose schemas
│   ├── lib/                          # 8 service modules
│   │   ├── auth.ts                   # Better Auth config
│   │   ├── db.ts                     # MongoDB connection
│   │   ├── socket.ts                 # Socket.IO singleton
│   │   ├── emitEventHandler.ts       # Server→Socket bridge
│   │   ├── cloudinary.ts             # Image upload
│   │   ├── mailer.ts                 # Email service
│   │   └── geo.ts                    # Haversine distance
│   ├── redux/                        # Redux store + slices
│   └── proxy.ts                      # Middleware (auth + RBAC)
├── public/                           # Static assets
├── .env.example                      # Environment template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB Atlas** cluster (or local MongoDB)
- **Stripe** account with test API keys
- **Google Cloud** OAuth 2.0 credentials
- **Cloudinary** account
- **Gmail** App Password for Nodemailer

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/akashsingh062/snapcart.git
cd snapcart

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)

# 4. Start the development server
npm run dev
```

> **Important:** The [Socket Server](https://github.com/akashsingh062/socketserver-snapcart) must also be running for real-time features. See the [Socket Server README](https://github.com/akashsingh062/socketserver-snapcart) for setup.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB Atlas connection string |
| `BETTER_AUTH_SECRET` | 32+ char random secret for session encryption |
| `BETTER_AUTH_URL` | Base URL (`http://localhost:3000` for dev) |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for client-side redirects |
| `NEXT_PUBLIC_SOCKET_SERVER` | Socket server URL (`http://localhost:4000` for dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLOUDNARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDNARY_API_KEY` | Cloudinary API key |
| `CLOUDNARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `EMAIL` | Gmail address for OTP emails |
| `PASS` | Gmail 16-character app password |

---

## 🔐 Authentication & Authorization

SnapCart uses **Better Auth** with dual strategies:

| Method | Description |
|--------|-------------|
| **Email/Password** | bcrypt-hashed credential signup/login |
| **Google OAuth** | One-click social login via Google |

**Role-Based Access Control** is enforced at two levels:

1. **Middleware** (`proxy.ts`) — Intercepts every navigation request, validates session cookies, and redirects unauthorized users away from `/admin/*`, `/user/*`, and `/delivery/*` routes.
2. **API Route Guards** — Each API route individually verifies the session and checks `user.role` before processing.

**Three User Roles:**
| Role | Access |
|------|--------|
| `user` | Browse, cart, checkout, order tracking, chat |
| `admin` | Dashboard, grocery CRUD, order management, delivery assignment |
| `deliveryBoy` | Assignment dashboard, active delivery, OTP verification, earnings |

---

## 💳 Payment Flow

### Cash on Delivery (COD)
```
Customer checkout → Order created (isPaid: false) → Admin sees order immediately
→ Delivery partner assigned → OTP verified on delivery → Order marked delivered
```

### Online Payment (Stripe)
```
Customer checkout → Order created (isPaid: false, status: pending)
→ Redirect to Stripe Checkout → Payment processed
→ Stripe webhook fires (checkout.session.completed)
→ Order updated (isPaid: true) → Socket emits new-order to admin
→ Backup: order-success page calls /payment/verify endpoint
```

---

## 🗺️ Real-Time Tracking Flow

```
1. Delivery partner accepts assignment
2. GeoUpdater component starts watching GPS position
3. Location emitted to Socket Server via "update-location" event
4. Socket Server broadcasts to all connected clients
5. Customer's track-order page listens and updates Leaflet map marker
6. Location also persisted to MongoDB (user.location GeoJSON)
```

---

## 📦 Deployment

### Vercel (Next.js App)
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set all environment variables in Vercel project settings
3. Ensure `BETTER_AUTH_URL` points to your Vercel domain
4. Add your Vercel domain to `trustedOrigins` in `src/lib/auth.ts`
5. Configure Stripe webhook endpoint: `https://your-domain.vercel.app/api/auth/user/stripe/webhook`

### Render (Socket Server)
1. Deploy the `socketServer` directory to [Render](https://render.com)
2. Set `NEXT_BASE_URL` to your Vercel app URL
3. Update `NEXT_PUBLIC_SOCKET_SERVER` in Vercel to point to the Render URL

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Akash Singh](https://github.com/akashsingh062)**

</div>
