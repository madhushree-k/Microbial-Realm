# Microbial Realm: The Resistance Rising
### Educational AMR Role-Playing Game

---

## Deploy to Vercel (5 minutes, free)

### Step 1 — Push to GitHub
1. Create a new repo on github.com
2. Upload all files in this folder (keep the folder structure)

### Step 2 — Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Click **Deploy** (Vercel auto-detects the config)

### Step 3 — Add your API key
1. In Vercel dashboard → your project → **Settings → Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (get one at console.anthropic.com)
3. Click **Save** then **Redeploy**

Your game is now live at `https://your-project.vercel.app` 🎉

---

## Add Character Images

In `public/index.html`, find the `CHARACTERS` array and replace `img: null` with a URL:

```js
img: "https://your-image-host.com/character1.png"
```

Or use a relative path if you add images to the `public/` folder:
```js
img: "/char1.png"
```

---

## File Structure

```
microbial-realm/
├── api/
│   └── chat.js          ← Secure API proxy (hides your API key)
├── public/
│   └── index.html       ← The entire game
├── vercel.json          ← Routing config
└── README.md            ← This file
```

---

## Local Testing

```bash
npm install -g vercel
vercel dev
```
Then open http://localhost:3000

---

## Getting an Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Go to **API Keys → Create Key**
4. Copy it into Vercel env vars (never put it in the code)
