# Thakkar Traders — Production Deployment Guide

> Full-stack deployment: **React (Vite)** → Vercel · **Express (Node)** → Render · **MongoDB** → Atlas · **Images** → Cloudinary

---

## Architecture Overview

```
Browser ──► Vercel (React SPA)
                 │  /api/*
                 ▼
            Render (Express API)
                 │
          ┌──────┴──────┐
          ▼             ▼
       MongoDB        Cloudinary
       (Atlas)        (Images)
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 LTS | https://nodejs.org |
| npm | ≥ 9 | Bundled with Node |
| Git | any | https://git-scm.com |
| GitHub account | — | https://github.com (push your repo here first) |

---

## STEP 1 — MongoDB Atlas Setup

1. Go to **https://cloud.mongodb.com** and sign up for free.
2. Click **Build a Cluster** → choose **M0 Free** → pick a region near India (Mumbai/Singapore).
3. **Database Access** tab → Add New Database User:
   - Username: `thakkar_admin`
   - Password: click **Autogenerate** → **copy it immediately**
   - Privileges: `Read and write to any database`
4. **Network Access** tab → Add IP Address → **Allow Access from Anywhere** → `0.0.0.0/0` → Confirm.
5. Back on **Clusters** → click **Connect** → **Drivers** → copy the string:
   ```
   mongodb+srv://thakkar_admin:<password>@cluster0.xxxxx.mongodb.net/thakkar_traders?retryWrites=true&w=majority
   ```
6. Replace `<password>` with what you copied. **Save this string** — it is your `MONGO_URI`.

---

## STEP 2 — Cloudinary Setup

1. Sign up free at **https://cloudinary.com**.
2. On the **Dashboard** home page, note these three values:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
3. That's it — no extra configuration needed.

---

## STEP 3 — Push Code to GitHub

Render deploys directly from your GitHub repository.

```bash
# From the root of your project (d:\CHARUSAT\Projects\Thakkar Traders)
git init                          # if not already a git repo
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/thakkar-traders.git
git push -u origin main
```

> Make sure your `.gitignore` contains `.env` so your secrets are never pushed.

---

## STEP 4 — Deploy Backend → Render

### 4a. Create the Web Service

1. Go to **https://render.com** → sign up / log in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your **thakkar-traders** GitHub repository → **Connect**.
4. Fill in the settings:

   | Setting | Value |
   |---------|-------|
   | **Name** | `thakkar-traders-api` |
   | **Region** | Singapore (closest to India) |
   | **Branch** | `main` |
   | **Root Directory** | `server` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | Free |

5. Click **Advanced** → scroll down to **Environment Variables**.

### 4b. Add Environment Variables

Click **Add Environment Variable** for each row below:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas connection string from Step 1 |
| `JWT_SECRET` | a strong random string (e.g. `openssl rand -hex 32` output) |
| `CLOUDINARY_CLOUD_NAME` | from Step 2 |
| `CLOUDINARY_API_KEY` | from Step 2 |
| `CLOUDINARY_API_SECRET` | from Step 2 |
| `CLIENT_URL` | *(leave blank for now — fill after Step 5)* |
| `RESEND_API_KEY` | from https://resend.com *(for email notifications)* |
| `ADMIN_EMAIL` | your email address |

### 4c. Deploy

Click **Create Web Service**. Render will:
- Pull the code
- Run `npm install`
- Start `node server.js`

Wait for the status to turn **Live** (usually 2–4 minutes).

### 4d. Copy your Render URL

It will look like:
```
https://thakkar-traders-api.onrender.com
```
**Copy this** — you need it for Step 5.

> ⚠️ **Free tier note:** Render free services spin down after 15 minutes of inactivity.
> The first request after a spin-down takes ~30 seconds to wake up. This is fine for testing.
> Upgrade to the **Starter ($7/mo)** plan to keep it always-on for production.

---

## STEP 5 — Deploy Frontend → Vercel

### 5a. Set your API URL

Create a file `client/.env.production` with:
```env
VITE_API_URL=https://thakkar-traders-api.onrender.com/api
```

> This file is in `.gitignore` — you also need to add it as an env var in the Vercel dashboard (see 5b).

### 5b. Deploy via Vercel Dashboard (Recommended)

1. Go to **https://vercel.com** → sign up / log in with GitHub.
2. Click **Add New Project** → **Import Git Repository** → select your repo.
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `client` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://thakkar-traders-api.onrender.com/api` |

5. Click **Deploy**. Wait ~1–2 minutes.
6. Your site URL will be something like: `https://thakkar-traders.vercel.app`

### 5c. Update Render's CLIENT_URL

Go back to **Render** → your service → **Environment** → edit `CLIENT_URL`:
```
https://thakkar-traders.vercel.app
```
Click **Save Changes** → Render will automatically redeploy.

> This enables CORS so your Vercel frontend can talk to the Render API.

---

## STEP 6 — Create the First Admin Account

After Render is live, create your admin user **once** via this command in your terminal or Postman:

```bash
curl -X POST https://thakkar-traders-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"YourStrongPassword123!\"}"
```

Expected response:
```json
{ "success": true, "message": "Admin registered successfully" }
```

Now log in at: **https://thakkar-traders.vercel.app/admin**

> **Security:** After creating your admin account, open `server/routes/authRoutes.js` and comment out the `/register` route so no one else can create accounts.

---

## STEP 7 — Custom Domain (Optional)

### Vercel (Frontend)
1. Vercel Dashboard → your project → **Settings → Domains** → Add domain.
2. Add a CNAME record in your DNS provider pointing to `cname.vercel-dns.com`.

### Render (Backend API)
1. Render → your service → **Settings → Custom Domain** → Add domain.
2. Add a CNAME pointing to your Render service URL.
3. Update `VITE_API_URL` in Vercel environment variables to your new API domain.
4. Update `CLIENT_URL` in Render environment variables to your new frontend domain.

---

## Environment Variable Reference

### Local Development — `/server` (loaded from root `/.env`)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=any-local-secret-here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_EMAIL=you@example.com
```

### Local Development — `/client` (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Local Development

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev          # nodemon server.js → http://localhost:5000

# Terminal 2 — Frontend
cd client
npm install
npm run dev          # Vite dev server → http://localhost:5173
```

Admin panel: **http://localhost:5173/admin**

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error in browser | `CLIENT_URL` in Render must exactly match your Vercel URL — no trailing slash |
| 404 on page refresh in Vercel | `client/vercel.json` must be present with the SPA rewrite rule |
| Images not uploading | Check all 3 Cloudinary env vars are set in Render |
| Render service returns 503 | Free tier is waking up — wait 30 sec and retry |
| MongoDB connection timeout | Atlas Network Access must allow `0.0.0.0/0` |
| Login fails with 401 | `JWT_SECRET` must be the same value you registered with |
| `VITE_API_URL` is undefined in browser | Set env var in Vercel dashboard AND redeploy |

---

*Thakkar Traders v1.0 — DZ Infotech*
