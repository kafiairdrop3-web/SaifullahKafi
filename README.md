# HSC Study Hub — Learnify (v1)
### Personal HSC Study & Video Organizer Website

A modern, single-user study organizer website for Higher Secondary Certificate (HSC) preparation, built according to the complete **HSC Personal Study Website Specification**.

---

## ✨ Features Included (v1: Video Content Only)

1. **7 Persistent HSC Subjects:**
   - `01` Higher Math
   - `02` Physics
   - `03` Chemistry
   - `04` Biology
   - `05` English
   - `06` Bangla
   - `07` ICT
2. **Pill-Tag Filter Controls (No Dropdowns):**
   - **By Course**, **By Chapter**, and **By Teacher** toggleable pill tags.
   - Fully supports combining multiple filters with **AND logic**.
   - Dynamic option values sourced directly from database tags and video entries.
3. **Inline Telegram Video Player:**
   - Embeds class videos directly from public Telegram posts using the official widget script (`telegram-widget.js?22`).
   - Includes a graceful fallback button (**"Watch on Telegram ↗"**) if a specific post type restricts inline embeds.
4. **Non-Coder Admin Panel (`/admin`):**
   - Protected by Firebase Authentication (Email + Password).
   - **Manage Videos:** Add, edit, and delete videos purely through forms and buttons. Typing a new Course, Chapter, or Teacher tag while adding a video automatically makes it available in tag management.
   - **Manage Tags:** Rename any tag (instantly updates all existing videos across the database in a batch transaction) or delete unused tags.
   - **Firebase Connection Settings:** Connect your live Firebase project by pasting your keys directly into the Admin Settings UI — **no code editing required!**
5. **Built-in Demo Mode (Sample Data):**
   - Works immediately offline or before Firebase keys are configured! Includes 16+ sample class videos across all 7 subjects so you can preview and test all features instantly.

---

## 🎨 Design System

- **Typography:** `Kodchasan` (Google Fonts) for headings and body text.
- **Color Palette:**
  - **Black (`#151313`)**: Primary text and dark cards
  - **Orange/Red Accent (`#ff5734`)**: Primary buttons, play badges, highlights
  - **Purple (`#be9af5`)**: Secondary accent, chapter badges, ambient blobs
  - **Yellow (`#fccc42`)**: Course tags, highlights, selection badges
  - **Off-White (`#f7f7f5`)**: Page background

---

## 🚀 Step-by-Step Setup Guide (For Non-Coder Owners)

You do **not** need to edit any code files to connect your database or deploy this website. Follow these plain-language steps:

### Step 1: Create a Free Firebase Project
1. Open your web browser and go to [firebase.google.com](https://console.firebase.google.com).
2. Sign in with your Google account and click **"Create a project"** (or **"Add project"**).
3. Name your project **`HSC-Study-Hub`** and click **Continue**.
4. (Optional) Turn off Google Analytics if you want a simpler setup, then click **Create Project**.
5. When it says "Your new project is ready", click **Continue**.

---

### Step 2: Enable Firestore Database & Authentication
1. In the left menu of your Firebase Console, click **Build** → **Firestore Database**.
2. Click **Create Database**.
3. Choose a location close to you (e.g., `asia-south1`), select **Start in production mode**, and click **Create**.
4. Next, click **Build** → **Authentication** from the left menu.
5. Click **Get Started**, choose **Email/Password**, turn on the toggle for **Email/Password**, and click **Save**.
6. Click the **Users** tab at the top of the Authentication page, click **Add user**, and enter your email address and a password. This will be your login for the `/admin` page!

---

### Step 3: Copy Your Firebase Keys into the Admin Panel
1. In your Firebase Console, click the **Gear Icon ⚙️** (top left, next to "Project Overview") and select **Project settings**.
2. Scroll down to the **"Your apps"** section and click the **Web Icon (`</>`)**.
3. Name your app `hsc-web` and click **Register app**.
4. You will see a `firebaseConfig` object with values like `apiKey`, `authDomain`, `projectId`, etc.
5. Open your website, go to the **Admin Panel** (`/admin`), click the **"Firebase Settings"** tab, and paste those keys into the form. Click **"Save & Connect Firebase"**!
   *(Note: You can also paste them into `src/firebaseConfig.js` if you prefer).*

---

### Step 4: Prepare Your Telegram Channel
1. Open Telegram and create a new **Public Channel** (e.g., `t.me/my_hsc_classes_2026`).
2. Upload your HSC video lectures as posts to this channel.
3. To add a video to your website, copy the link of the Telegram post (e.g., `https://t.me/my_hsc_classes_2026/15`).
4. In your website's **Admin Panel → Manage Videos**, click **"+ Add New Video"** and paste that link!

---

### Step 5: Deploy to Netlify (Free Static Hosting)
1. Go to [netlify.com](https://www.netlify.com) and create a free account.
2. Click **"Add new site"** → **"Import an existing project"** (from GitHub).
3. Select this repository (`kafiairdrop3-web/SaifullahKafi`).
4. Netlify will automatically detect the build settings from `netlify.toml`:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Click **"Deploy site"**. Your HSC Study Hub will be live online in less than a minute!

---

## 🛠️ Local Development & Scripts

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
