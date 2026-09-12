# Deployment Guide

This is a single Node/Express app: it serves the static site (`index.html`,
`admin.html`, `assets/`) **and** the `/api/*` endpoints from one process
(`server/server.js`), backed by MongoDB Atlas. Deploy it as one web service —
no separate static host needed.

Below: [Render](#deploy-on-render-recommended) (free, simplest) and
[Railway](#deploy-on-railway-alternative) (also free-tier, similar flow).
Either works — pick one.

## 0. Before you deploy

**MongoDB Atlas network access** — Render/Railway don't have static
outbound IPs on the free tier, so the database can't be locked to a
specific IP. In Atlas → **Network Access** → **Add IP Address** →
**Allow Access from Anywhere** (`0.0.0.0/0`). This is safe here because
the database is still protected by the username/password in `MONGO_URI`.

**Rotate the Mongo password.** It was shared in plaintext during setup
(chat, and briefly this local `.env`). Before going live: Atlas →
Database Access → edit the `theroboticssocietysathyabama_2` user → set a
new password → update `MONGO_URI` wherever you configure it below
(remember to percent-encode special characters, e.g. `@` → `%40`).

**Push your code to GitHub** — both Render and Railway deploy from a
repo. You already have `origin` set to
`https://github.com/Aravindhraj-07/shark.git`. Commit and push:

```bash
git add index.html assets/js/main.js .gitignore admin.html assets/js/admin.js server/
git commit -m "Add MongoDB-backed registration API and admin panel"
git push
```

`.env` is already gitignored — it will not be pushed. You'll re-enter
those values as environment variables on the host instead.

## Deploy on Render (recommended)

1. [render.com](https://render.com) → sign in with GitHub → **New** →
   **Web Service** → select the `shark` repo.
2. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. **Environment** tab → add these variables (same values as your local
   `server/.env`, minus `PORT` — Render sets that itself):
   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string (rotated password) |
   | `JWT_SECRET` | `34c87d29ee66becbbbb05ef40e9f89d84e41f0fdf0e0ff2ce01665bfcb04ed9a` (or generate a new one — see below) |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | (your chosen admin password, plaintext) |
4. **Create Web Service**. First deploy takes a few minutes. Render
   gives you a URL like `https://shark-xxxx.onrender.com`.
5. Visit that URL — the event site should load. Visit `/admin.html` and
   log in with the admin credentials to confirm the API works end to end.

Note: Render's free tier spins the service down after 15 minutes of
inactivity and takes ~30s to wake on the next request — fine for a
registration form, just don't be surprised by a slow first load.

## Deploy on Railway (alternative)

1. [railway.app](https://railway.app) → sign in with GitHub → **New
   Project** → **Deploy from GitHub repo** → select `shark`.
2. Once created, open the service → **Settings**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start` (Railway auto-detects `npm install`)
3. **Variables** tab → add the same four variables as the Render table
   above.
4. **Settings** → **Networking** → **Generate Domain** to get a public
   URL.
5. Visit the URL and `/admin.html` to confirm.

## Generating a fresh JWT_SECRET (optional)

If you'd rather not reuse the value from local dev:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`ADMIN_PASSWORD` is just plaintext — set it directly to whatever you want
the admin login password to be.

## After deploying

- Test a real registration submission and confirm it shows up in
  `/admin.html`.
- Test the CSV export button.
- Change the registration cap in the admin panel and confirm the public
  form locks once it's hit.
- Point your event's public link at the new hosted URL (not
  `localhost`).

## Custom domain (optional)

Both Render and Railway support adding a custom domain under their
respective **Settings → Domains** — point your DNS `CNAME` at the value
they give you.
