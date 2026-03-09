# Deployment Guide - An Open Letter to Earth

## Quick Setup (Cloudflare Pages + D1)

Everything runs free on Cloudflare's free tier.

### 1. Install Wrangler (if not already)
```bash
npm install -g wrangler
wrangler login
```

### 2. Create the D1 Database
```bash
cd ~/open-letter-earth
wrangler d1 create open-letter-earth-db
```
Copy the `database_id` from the output and paste it into `wrangler.toml`.

### 3. Apply the Database Schema
```bash
wrangler d1 execute open-letter-earth-db --file=schema.sql
```

### 4. Deploy to Cloudflare Pages
```bash
# Option A: Via Git (recommended)
# Push this folder to a GitHub repo, then connect it in Cloudflare Pages dashboard.
# Set build output directory to: public

# Option B: Direct deploy
wrangler pages deploy public --project-name=open-letter-earth
```

### 5. Bind D1 to Pages
In the Cloudflare dashboard:
1. Go to Pages > open-letter-earth > Settings > Functions
2. Under "D1 database bindings", add:
   - Variable name: `DB`
   - D1 database: `open-letter-earth-db`

### 6. Connect Your Domain
In Cloudflare dashboard:
1. Go to Pages > open-letter-earth > Custom domains
2. Add your domain
3. DNS will auto-configure since domain is already on Cloudflare

### Adding a YouTube Video
Edit `public/index.html`, find the video section, and replace the placeholder div with:
```html
<iframe width="100%" height="100%" src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media;
  gyroscope; picture-in-picture" allowfullscreen style="border-radius:12px;aspect-ratio:16/9;">
</iframe>
```

### Adding Blog Posts
Add new `<article class="blog-card">` elements inside `#blogPosts` in index.html.

### Checking Signatures/Subscribers
```bash
# View all signatures
wrangler d1 execute open-letter-earth-db --command="SELECT * FROM signatures ORDER BY created_at DESC"

# View newsletter subscribers
wrangler d1 execute open-letter-earth-db --command="SELECT * FROM newsletter ORDER BY created_at DESC"

# View visitor count
wrangler d1 execute open-letter-earth-db --command="SELECT COUNT(DISTINCT ip_hash) FROM visits"
```
