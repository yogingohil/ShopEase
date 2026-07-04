# ShopEase v2 — Full-Stack E-Commerce Platform

A complete rebuild of the original ShopEase internship project into a production-shaped
full-stack application: **Express + MongoDB (Mongoose) REST API** on the backend and a
**React (Vite) single-page app** on the frontend.

---

## What's new vs the original project

| Area | Before | Now |
|---|---|---|
| Architecture | One 862-line file, raw `http` server, server-rendered HTML | Layered Express API (routes/controllers/models/middleware) + separate React SPA |
| Auth | Plain-text passwords, in-memory sessions (wiped on restart) | `bcryptjs` hashed passwords, JWT in an httpOnly cookie |
| Validation | Minimal | `express-validator` on every write endpoint, Mongoose schema validation |
| Security | None | `helmet`, CORS allow-list, rate limiting (general + strict on login), input sanitization |
| Search & filter | None | Full-text-style search, category filter, price range, sort, pagination |
| Wishlist | ❌ | ✅ Save/remove products, dedicated page |
| Reviews & ratings | ❌ | ✅ 1–5 star reviews, restricted to verified purchasers, live product rating aggregation |
| Coupons | ❌ | ✅ Percentage/flat coupons with min order value, max discount cap, usage limits, expiry |
| Checkout / payment | Order placed instantly, no address or payment step | Address form, payment method selection (COD / simulated card / simulated UPI), stock re-validated at checkout |
| Order lifecycle | Order exists or doesn't | `pending → confirmed → shipped → delivered / cancelled`, with stock restored on cancellation |
| Admin tools | Add/view/delete products, view orders | Analytics dashboard (revenue trend, top products, order-status breakdown), low-stock alerts, order status management, customer list, coupon management |
| UI | One shared stylesheet, server-rendered pages | Componentized React UI with a custom design system, responsive down to mobile |

---

## Project structure

```
shopease-v2/
├── backend/               Express REST API
│   ├── config/db.js       MongoDB connection
│   ├── models/            Mongoose schemas (User, Product, Order, Cart, Review, Coupon)
│   ├── controllers/       Business logic per resource
│   ├── routes/            Route definitions + validation rules
│   ├── middleware/        auth (JWT), error handling, validation
│   ├── scripts/seed.js    Creates the admin account + sample products/coupons
│   ├── app.js / server.js Express app wiring + entry point
│   └── .env.example       Copy to .env and adjust
│
└── frontend/               React (Vite) single-page app
    ├── src/pages/          Route-level screens (client + admin)
    ├── src/components/     Reusable UI (ProductCard, Navbar, PriceTag, ...)
    ├── src/context/        AuthContext, CartContext (global state)
    ├── src/api/axios.js    Configured API client
    └── src/styles/         Design tokens + component styles
```

---

## How to run it

You'll need **Node.js 18+** and a MongoDB database (local `mongod`, or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

### 1. Backend

```bash
cd backend
cp .env.example .env      # then edit MONGODB_URI if you're using Atlas
npm install
npm run seed               # creates the admin account + sample catalog (safe to re-run)
npm run dev                 # starts the API on http://localhost:5000
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open **http://localhost:5173** — the Vite dev server proxies `/api` calls to the backend
automatically (see `frontend/vite.config.js`).



Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` before running `npm run seed`
if you want different credentials (recommended before deploying anywhere real).

### Sample coupons (created by the seed script)

- `WELCOME10` — 10% off, Rs. 500 minimum order, capped at Rs. 300
- `FLAT100` — Rs. 100 off, Rs. 999 minimum order

---

## Notes on payments

There is no real payment gateway wired in — card and UPI options in checkout are
**simulated** (marked as paid immediately, no external calls made). Swapping in a real
gateway (Razorpay, Stripe, etc.) would mean adding a payment-intent step in
`backend/controllers/orderController.js` and a client-side SDK call in
`frontend/src/pages/Checkout.jsx`.

## Production checklist before going live

- Set a long random `JWT_SECRET` and `NODE_ENV=production` in `.env`
- Use a real MongoDB Atlas connection string, not the local fallback
- Set `CLIENT_URL` to your deployed frontend origin (used for CORS + cookie settings)
- Build the frontend with `npm run build` in `frontend/` and serve the `dist/` folder
  from a static host or CDN (the API and frontend are fully decoupled, so they can be
  deployed separately)
- Consider adding automated email confirmations, a real payment gateway, and image
  upload/storage (currently product images are external URLs) as next steps
