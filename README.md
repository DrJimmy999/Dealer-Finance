# Dubicars — Dealer Finance Tracker

A shared, real-time web tracker for managing the Flapkap/Finance Partner dealer prospect pipeline.

## Tech stack
- **Frontend**: React + Vite
- **Database**: Supabase (Postgres)
- **Hosting**: Netlify

---

## Setup (one-time, ~10 minutes)

### 1. Supabase — create the database

1. Go to [supabase.com](https://supabase.com) → your project (or create a new one)
2. Open **SQL Editor → New query**
3. Paste the contents of `supabase_schema.sql` and click **Run**
4. In the left sidebar, go to **Project Settings → API**
5. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public** key (under "Project API keys")

---

### 2. Netlify — deploy the app

1. Push this folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your repo; build settings will be auto-detected from `netlify.toml`
4. Before deploying, go to **Site configuration → Environment variables** and add:
   ```
   VITE_SUPABASE_URL       = https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY  = your-anon-key-here
   ```
5. Click **Deploy site**

---

### 3. Load the initial dealer list

Once deployed, open your Netlify URL. You'll see a yellow banner:

> **"No prospects yet. Load the 34 dealers"**

Click **Load 34 dealers** — this seeds all dealers from the restricted list at **Prospecting** stage.

---

### 4. Share the URL

Send the Netlify URL to your team. Anyone with the link can:
- View all prospects
- Update stage, contacts, and notes
- Add new prospects
- Add rejection reasons on Closed — Rejected deals

No login required. All changes are saved to Supabase instantly and visible to everyone.

---

## Usage notes

| What | How |
|---|---|
| Update a stage | Click the ✏️ edit icon on any row |
| Add contacts | Edit a prospect → fill in name + email (add multiple) |
| Add rejection notes | Change stage to "Closed — Rejected" and fill in the reason field |
| Filter by stage | Click any stage card at the top |
| Search | Type in the search box — searches name, contacts, and notes |
| Add new prospect | Click "Add prospect" button (top right) |

---

## Future: HubSpot integration

Each prospect row will eventually link to its HubSpot company record.
The `name` field is designed to cross-reference against HubSpot company names.
When ready, add a `hubspot_company_id` column to the `prospects` table and
surface it as a clickable link in the tracker.
