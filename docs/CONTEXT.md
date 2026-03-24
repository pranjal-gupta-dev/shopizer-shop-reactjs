# shopizer-shop-reactjs — Business & Technical Context

> For full suite architecture, see [`../../docs/DOCUMENTATION.md`](../../docs/DOCUMENTATION.md) and [`../../docs/ARCHITECTURE_DIAGRAM.md`](../../docs/ARCHITECTURE_DIAGRAM.md)

---

## What This Repo Does

This is the **customer-facing storefront**. It's what shoppers see and use — browsing products, adding to cart, checking out, managing their account, and viewing orders. It talks exclusively to the Shopizer backend API.

---

## Business Domain

| Feature | What the customer can do |
|---------|--------------------------|
| Home | View hero banners, featured products, promotions |
| Browse | Browse products by category, filter, sort |
| Search | Search products by keyword |
| Product Detail | View images, description, variants, reviews, add to cart |
| Cart | Review cart, update quantities, remove items |
| Checkout | Enter address, select shipping, pay via Stripe |
| My Account | View/edit profile, manage addresses |
| Order History | View past orders and their status |
| Order Detail | View single order details |
| Auth | Register, login, forgot/reset password |
| CMS | View static content pages |
| Contact | Contact form with map |
| i18n | English and French language support |

---

## Technical Stack

| Concern | Technology |
|---------|-----------|
| Language | JavaScript (ES6+) |
| Framework | React 16.6 |
| State Management | Redux + redux-thunk + redux-localstorage-simple |
| Routing | React Router DOM 5 |
| HTTP | Axios (via `util/webService.js`) |
| Styling | Bootstrap 4.5 + SCSS |
| Payment | Stripe (`@stripe/react-stripe-js`) |
| Maps | google-maps-react + react-geocode |
| i18n | redux-multilanguage |
| Build | react-scripts (Create React App 4) |
| Dev Port | `3000` |
| Node requirement | Node 14–16 |

---

## Source Structure

```
src/
├── App.js              # Root component, all route definitions
├── index.js            # Entry point, Redux store + middleware setup
├── pages/              # One folder per page/route
│   ├── home/
│   ├── category/       # Product listing with filters
│   ├── product-details/
│   ├── search-product/
│   ├── content/        # CMS pages
│   └── other/          # Cart, Checkout, MyAccount, Orders, Login, Contact, etc.
├── components/         # Reusable UI components (header, footer, product cards, etc.)
├── wrappers/           # Page-level layout wrappers
├── redux/
│   ├── actions/        # cartActions, productActions, userAction, storeAction, etc.
│   └── reducers/       # One reducer per domain slice
├── util/
│   ├── webService.js   # Axios HTTP client — all API calls go through here
│   ├── constant.js     # API base URL and app-wide constants
│   └── helper.js       # General utilities
├── helpers/
│   ├── product.js      # Product filtering, sorting, discount calculation
│   └── scroll-top.js   # Scroll to top on route change
├── translations/       # english.json, french.json
└── data/               # Static JSON (hero slider content, feature icons)
```

---

## Redux State Shape

| Slice | What it holds |
|-------|--------------|
| `cartReducer` | Cart items, quantities, totals |
| `productReducer` | Product list, active filters |
| `userReducer` | Logged-in customer info, JWT token |
| `storeReducer` | Current merchant store info (name, currency, etc.) |
| `contentReducer` | CMS content pages |
| `loaderReducer` | Global loading spinner state |

State is persisted to `localStorage` via `redux-localstorage-simple` (cart and user survive page refresh).

---

## Configuration

| File | Key Variables | Purpose |
|------|--------------|---------|
| `.env` | `APP_BASE_URL`, `APP_API_VERSION`, `APP_MERCHANT` | API connection and merchant config |
| `env-config.js` | Runtime env vars | Injected at Docker startup via `env.sh` |
| `public/env-config.js` | Runtime env vars | Served to browser |

Key `.env` variables:
```env
APP_BASE_URL=http://localhost:8080      # Backend URL
APP_API_VERSION=/api/v1/               # API version prefix
APP_MERCHANT=DEFAULT                   # Merchant store code
APP_PAYMENT_TYPE=STRIPE                # Payment provider
APP_STRIPE_KEY=pk_test_...             # Stripe public key
APP_MAP_API_KEY=                       # Google Maps API key
```

---

## API Integration

All HTTP calls go through `util/webService.js` (Axios wrapper). The base URL is read from `constant.js` which reads from `env-config.js` at runtime (or `.env` at build time).

Auth flow:
1. Customer logs in → `POST /api/v1/auth/login` → JWT token stored in Redux + localStorage
2. Subsequent requests include `Authorization: Bearer <token>` header

---

## Known Gotchas

1. **Node 14–16 required** — react-scripts 4 can break on Node 17+. Use `nvm use 16` or set `NODE_OPTIONS=--openssl-legacy-provider`
2. **`npm install` may need `--legacy-peer-deps`** due to peer dependency conflicts
3. **`.env` is read at build time** — changing `.env` after `npm run build` has no effect; you must rebuild
4. **Docker runtime env injection** — `env.sh` overwrites `env-config.js` at container startup, so env vars CAN be changed without rebuilding the image (pass `-e APP_BASE_URL=...` to `docker run`)
5. **Stripe key required for checkout** — without `APP_STRIPE_KEY`, the payment step will fail
6. **Google Maps key optional** — the contact page map won't load without `APP_MAP_API_KEY`, but the rest of the app works fine
7. **CORS** — the backend must have CORS enabled for `http://localhost:3000`; this is configured in `CorsFilter.java` in the backend
