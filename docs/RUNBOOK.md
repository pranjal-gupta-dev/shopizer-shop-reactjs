# shopizer-shop-reactjs — Build & Run Plan

React 16 storefront. Talks to the Shopizer backend API on port 8080.

## Prerequisites

```bash
node --version   # needs Node 14–16
npm --version    # needs npm 6+
```

> If you have a newer Node, use [nvm](https://github.com/nvm-sh/nvm):
> ```bash
> nvm install 16 && nvm use 16
> ```

---

## Option A — Local Dev Server

**Step 1: Install dependencies**
```bash
cd "/Users/pranjalgupta/local disk/Technogise/shopizer-suite/shopizer-shop-reactjs"
npm install
```

**Step 2: Configure API URL**

Edit `.env` in the project root:
```env
APP_BASE_URL=http://localhost:8080
APP_API_VERSION=/api/v1/
APP_MERCHANT=DEFAULT
```
This already points to the local backend — no change needed if running backend on port 8080.

**Step 3: Start dev server**
```bash
npm start
```

- Storefront: `http://localhost:3000`

---

## Option B — Docker

The Dockerfile builds the React app inside Docker and serves it via nginx.

```bash
cd "/Users/pranjalgupta/local disk/Technogise/shopizer-suite/shopizer-shop-reactjs"
docker build -t shopizer-shop .
docker run -p 3000:80 shopizer-shop
```

- Storefront: `http://localhost:3000`

> The Docker image runs `env.sh` at startup to inject runtime env vars from `.env` into the served app.

---

## Connecting to Backend

| Setting | File | Value |
|---------|------|-------|
| Backend running locally | `.env` | `APP_BASE_URL=http://localhost:8080` |
| Backend running in Docker | `.env` | `APP_BASE_URL=http://host.docker.internal:8080` |

---

## Known Issues & Fixes

### 1. Node version incompatibility
React scripts 4 can have issues with Node 17+ due to OpenSSL changes.

**Fix:**
```bash
nvm use 16
# or:
export NODE_OPTIONS=--openssl-legacy-provider
```

### 2. `npm install` fails with peer dependency errors
**Fix:**
```bash
npm install --legacy-peer-deps
```

### 3. API calls return 401 / products not loading
The storefront needs the backend running and the `DEFAULT` merchant seeded.
- Ensure Shopizer backend is up at `http://localhost:8080`
- Verify `APP_BASE_URL` in `.env` matches the backend URL

### 4. Docker — env vars not picked up at runtime
The Docker image uses `env.sh` to write runtime config into `env-config.js` before nginx starts.
If you change `.env` after building the image, you need to rebuild:
```bash
docker build -t shopizer-shop .
```

### 5. Stripe / payment not working
Set your Stripe public key in `.env`:
```env
APP_PAYMENT_TYPE=STRIPE
APP_STRIPE_KEY=pk_test_your_key_here
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `Port 3000 in use` | `PORT=3001 npm start` |
| Products page blank | Check backend is running and `APP_BASE_URL` is correct |
| CORS errors in browser | Ensure backend has CORS enabled for `http://localhost:3000` |
| `react-scripts: not found` | Run `npm install` first |
