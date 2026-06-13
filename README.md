# Thakkar Traders

A full-stack web application for **Thakkar Traders**, a premium interior building materials company based in Surat, Gujarat, India. They are authorized distributors of plywood, laminates, veneers, MDF, HDHMR boards, flush doors, and hardware — serving architects, interior designers, builders, contractors, and furniture manufacturers.

The project includes a public marketing website and a private admin panel for managing inquiries, products, projects, gallery images, and site settings.

---

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Framer Motion
- React Router DOM v6
- Axios
- React Helmet Async
- React Hot Toast
- Lucide React

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for admin authentication
- Multer + Cloudinary for image uploads
- dotenv, bcryptjs, cors, express-validator

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **MongoDB Atlas account** — [Sign up](https://cloud.mongodb.com/)
- **Cloudinary account** — [Sign up](https://cloudinary.com/)

---

## Environment Setup

1. **Clone or open the project** and navigate to the root directory.

2. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in each variable in `.env`:**

   | Variable | Where to find it |
   |----------|------------------|
   | `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com/) → **Database** → **Clusters** → **Connect** → **Drivers** → copy the connection string. Replace `<password>` with your database user password and set the database name to `thakkartraders`. |
   | `JWT_SECRET` | Generate a long random string (minimum 32 characters). Example: `openssl rand -base64 32` |
   | `ADMIN_USERNAME` | Choose your admin login username (e.g. `admin`) |
   | `ADMIN_PASSWORD` | Choose a strong admin password — change before going live |
   | `CLOUDINARY_CLOUD_NAME` | [Cloudinary Dashboard](https://cloudinary.com/console) → top-left under your account name |
   | `CLOUDINARY_API_KEY` | Cloudinary Dashboard → **Account Details** section |
   | `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → **Account Details** section (click to reveal) |
   | `PORT` | Server port (default: `5000`) |
   | `CLIENT_URL` | Frontend URL for CORS. Use `http://localhost:5173` for local development |

---

## Running Locally

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

The Vite dev server proxies all `/api` requests to the Express backend automatically.

---

## Admin Panel Access

The admin panel is **not linked from the public website**. Access it directly at:

```
http://localhost:5173/admin/login
```

Login credentials are set in your `.env` file via `ADMIN_USERNAME` and `ADMIN_PASSWORD`. After login, you'll be redirected to the dashboard at `/admin/dashboard`.

Protected admin routes:
- `/admin/dashboard`
- `/admin/inquiries`
- `/admin/gallery`
- `/admin/products`
- `/admin/projects`
- `/admin/settings`

---

## Deployment Notes

| Component | Recommended Platform |
|-----------|---------------------|
| **Server** (Express API) | Railway or Render |
| **Client** (React app) | Vercel |

**Important:** When deploying, update `CLIENT_URL` in your server environment variables to your production Vercel URL (e.g. `https://thakkar-traders.vercel.app`). This is required for CORS to allow the frontend to communicate with the API.

On Vercel, configure a rewrite rule so `/api/*` requests are proxied to your deployed backend URL.

---

## Project Structure

```
├── client/          ← React + Vite frontend
├── server/          ← Express backend
├── .env             ← Environment variables (not committed)
├── .env.example     ← Environment template
├── .gitignore
└── README.md
```

---

## License

Private — Thakkar Traders © 2026
"# Thakkar_Traders_DZ-Infotech" 
