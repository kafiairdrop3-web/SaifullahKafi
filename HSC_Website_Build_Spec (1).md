# HSC Personal Study Website — Full Build Specification

> This document is a complete implementation brief. Give this entire file to an AI coding assistant or developer — it should be enough to build the first working version without further clarification.

---

## 1. Project Summary

A **personal (single-user)** study organizer website for HSC preparation. It lists subjects in a left sidebar. Clicking a subject opens a page where the user can filter class videos by **Course Name**, **Chapter Number**, and **Teacher Name**, and play the matching video directly on the page. Video files are **not hosted on the website server** — they are stored on **Telegram** and embedded/streamed from there.

**Scope for this version (v1): VIDEO CONTENT ONLY.**
Do not add notes, PDFs, quizzes, multi-user support, comments, or any other feature beyond what is explicitly described below. Keep the build minimal and exactly matching this spec.

**Important constraint: the user is a non-coder.** They cannot edit code or JSON files directly. All content management (adding/editing/deleting videos, and managing filter tag values like course/chapter/teacher names) must be possible entirely through a UI on the website itself — an **Admin Panel** (see Section 4.3). This means the site needs a small amount of dynamic data storage rather than a static bundled file (see Section 2 and Section 6).

---

## 2. Tech Stack

- **Frontend:** Static site — plain HTML/CSS/JavaScript, OR a lightweight React app (developer's choice).
- **Hosting:** Netlify (free tier), static deployment.
- **Data storage:** **Firebase Firestore** (free "Spark" plan — free for this scale of personal use). No custom backend server is needed: the frontend talks to Firestore directly using Firebase's client-side JavaScript SDK. This lets the site be fully dynamic (content can be added/edited/deleted from the browser) while still deploying as a static site on Netlify.
- **Admin authentication:** **Firebase Authentication**, simple email + password, with exactly **one** admin account (the user). Used only to protect the Admin Panel (Section 4.3) — the public browsing pages need no login.
- **Video storage/streaming:** Telegram (see Section 5).

**Why this replaces a plain JSON file:** since the user cannot edit code/JSON manually, all content (videos, and the course/chapter/teacher tag values used for filtering) must be creatable and editable through on-site forms. Firestore lets those forms save changes instantly and have them reflected on the public pages — no redeploy needed.

---

## 3. Design System

Base the visual design on the referenced "Learnify" design (screenshots provided separately). Match the following exactly:

**Font:** `Kodchasan` (Google Fonts) — use for all headings and body text.

**Color palette:**
| Name | Hex | Usage |
|---|---|---|
| Black | `#151313` | Primary text, dark elements |
| Orange/Red (accent) | `#ff5734` | Primary buttons, highlighted text/words |
| Purple | `#be9af5` | Secondary accent, backgrounds, illustrations |
| Yellow | `#fccc42` | Tags, badges, highlights |
| Off-white | `#f7f7f5` | Page background |

**Layout style:** Clean, rounded corners, generous whitespace, soft card shadows, pill-shaped buttons/tags — matching the reference screenshots' overall friendly-but-modern SaaS look. Reuse this same visual language across all pages (not just the homepage) for consistency.

---

## 4. Pages & Navigation Structure

### 4.1 Home / Landing Page
- Left-side persistent **Sidebar** (or top nav that reveals a sidebar) listing **Subjects**:
  1. Higher Math
  2. Physics
  3. Chemistry
  4. Biology
  5. English
  6. Bangla
  7. ICT
- Clicking a subject navigates to that Subject's page (Section 4.2).
- Simple, clean hero/intro area is fine, styled per Section 3. Keep it minimal.

### 4.2 Subject Page
Layout inspired by the reference screenshot's course-grid section ("Take your knowledge a degree further" style card grid).

On this page, show:
1. **Filter controls** at the top — **no dropdowns**. Use a select/pill-tag UI instead:
   - Three filter groups, each with a label: **"By Course"**, **"By Chapter"**, **"By Teacher"**
   - Under each label, render all available option values (from the data file — not hardcoded) as individually clickable **pill/tag buttons** (e.g., under "By Course": `ACS 2027`, `Aloron 2026`, ...; under "By Chapter": `Chapter 1`, `Chapter 2`, ...; under "By Teacher": each teacher name).
   - Clicking a pill **selects** it (apply active/selected styling — e.g., filled background using the accent color `#ff5734` or `#be9af5`, per Section 3's palette). Clicking an already-selected pill **deselects** it (returns to default unselected style) — so every filter must be toggleable on and off, not just selectable.
   - Multiple filter groups can be active at once (e.g., a Course pill + a Chapter pill selected together) — combine them as AND logic to filter the video grid below, exactly as before.
   - Style pills using the established design system (Section 3): rounded/pill shape, `Kodchasan` font, soft shadow on hover, smooth transition between selected/unselected states.
2. **Video grid/list** below the filters, showing all videos for the selected Subject that match the currently active filters (Course + Chapter + Teacher). If a filter isn't selected, treat it as "show all."
3. Each video item shows: title, chapter number, course name, teacher name (as a thumbnail card, matching the reference card style).
4. Clicking a video card opens/plays the video **inline on the same page** (see Section 5) — do not navigate to a separate video-only page unless that's simpler to implement; either is acceptable as long as playback happens without leaving the site experience.

### 4.3 Public pages need no login
The Home page and Subject pages (Section 4.1, 4.2) are viewable without logging in — skip any Login/Sign up UI on these pages even though the design reference shows those buttons; omit or hide them.

### 4.4 Admin Panel (new — required, non-coder content management)
A separate route (e.g. `/admin`) protected by Firebase Authentication login (email + password, single admin account). Once logged in, the user should be able to do **everything below purely through forms and buttons — no code or file editing at any point**:

**A. Manage Videos**
- **Add Video** form with fields:
  - Subject (select from the fixed 7 subjects, Section 4.1)
  - Video Title (text)
  - Telegram Post Link (text — the `t.me/CHANNEL_USERNAME/POST_ID` link)
  - Course (select from existing course tags, **plus an option to type a new one** — see "Manage Tags" below)
  - Chapter (select from existing chapter tags for that subject, **plus an option to type a new one**)
  - Teacher (select from existing teacher tags, **plus an option to type a new one**)
  - "Save" button writes a new video document to Firestore.
- **Video list/table** (filterable by subject) showing all added videos with **Edit** and **Delete** buttons/icons on each row.
- **Edit Video** reopens the same form pre-filled, lets the user change any field and re-save.

**B. Manage Tags (filter option values)**
- A section where the user can view, per subject: all current **Course names**, **Chapter names**, and **Teacher names** currently in use.
- Allow **rename** (edits the tag text and updates it everywhere it's used on existing videos) and **delete** (only allowed if no video currently uses that tag, or ask for confirmation if videos will be affected) for each tag value.
- This is what lets the user clean up typos or remove old course/teacher names without touching individual videos one by one.

**Note for the builder:** when a new Course/Chapter/Teacher value is typed while adding a video (option A), it should automatically become available as a manageable tag in section B too — the two are the same underlying list, just accessed from two places for convenience.

Style the Admin Panel using the same design system (Section 3) for visual consistency, but it can be visually simpler/more utilitarian than the public pages since it's only for the user's own content management.

---

## 5. Video Storage & Playback (Telegram Integration)

**Method: Telegram Public Channel + Official Widget Embed** (no backend/bot server required — this fits static Netlify hosting).

Implementation steps:
1. User will create a **public Telegram channel** and upload each class video as a separate post.
2. Each post has a public link in the format: `https://t.me/CHANNEL_USERNAME/POST_ID`
3. To embed a specific post's video into the webpage, use Telegram's official embed widget script:
   ```html
   <script async src="https://telegram.org/js/telegram-widget.js?22"
     data-telegram-post="CHANNEL_USERNAME/POST_ID"
     data-width="100%">
   </script>
   ```
4. On the Subject page, when a user clicks a video card, render this widget script dynamically inside a modal or an inline expanding container, using the `telegramPostLink` value stored for that video in the JSON data file.
5. This requires no server-side code — the widget is loaded client-side directly from Telegram.

**Fallback note for the builder:** If the Telegram widget does not render well for a particular video (some post types don't embed cleanly), fall back to simply showing a "Watch on Telegram" button that opens the `t.me` link in a new tab. Implement the embed as the primary method, with this as a graceful fallback — don't block the whole feature on 100% perfect embedding.

---

## 6. Data Structure

Use **Firestore** collections (NoSQL documents) as the single source of truth — all reads/writes happen via the Firebase client SDK, from both the public pages (read-only) and the Admin Panel (read/write).

Suggested structure:

```
videos (collection)
  └── {auto-id} (document)
        - subjectId: "chemistry"
        - title: "Chemical Change 1"
        - courseName: "Aloron 2026"
        - teacherName: "Mostafa Pahlovi"
        - chapterNumber: 1
        - chapterName: "Chemical Change"
        - telegramPostLink: "CHANNEL_USERNAME/123"

tags (collection)                      // powers "Manage Tags" in Admin Panel
  └── {auto-id} (document)
        - subjectId: "chemistry"
        - type: "course" | "chapter" | "teacher"
        - value: "Aloron 2026"
```

- Subject list itself (the fixed 7 subjects) can stay hardcoded in the frontend code — it's not expected to change.
- The pill-tag filters on each Subject page (Section 4.2) should query Firestore for that subject's videos and derive **unique** course/chapter/teacher values from them directly (or read from the `tags` collection) — either approach is fine as long as it stays in sync with what Admin Panel edits produce.

---

## 7. Deployment
- Deploy the frontend as a static site to **Netlify Free tier**.
- One-time setup required (builder should do this for the user, or walk them through it step-by-step since they're a non-coder):
  1. Create a free Firebase project.
  2. Enable **Firestore Database** (start in production mode, then set security rules — see below).
  3. Enable **Firebase Authentication** with Email/Password sign-in, and create the single admin account (user's email + a password they choose).
  4. Add Firebase config keys to the frontend code (these are safe to expose client-side for Firebase — access is controlled by Firestore security rules, not by hiding the config).
- **Firestore security rules:** public pages need **read-only** access to `videos` and `tags` collections (no login required to read); **write** access to both collections should be restricted to the authenticated admin user only.

---

## 8. Explicit Non-Goals for v1 (do not build these now)
- No PDF/notes/practice-sheet sections yet (video only)
- No multi-user accounts, roles, or public sign-up — exactly one hardcoded admin account
- No sharing features
- No progress tracker / completion checkboxes (may be added later, not now)
- No custom backend server or Telegram bot — Firebase (Firestore + Auth) client SDK and Telegram widget embed only, no separate server to maintain

---

## 9. Instructions for the AI Building This (Non-Coder User)

The person giving you this spec **cannot write or edit code**. Follow these working rules:

**Do as much as possible yourself, without asking:**
- Write 100% of the code (frontend, Firestore rules, config files) yourself.
- Create all files/folders yourself.
- Run builds, tests, and local previews yourself; fix errors yourself without asking the user to debug anything.
- If using an agentic tool with terminal/file access, run install commands, scaffold the project, and connect it to Netlify/Firebase via CLI wherever that's possible without requiring the user to leave the terminal.
- Only pause to ask the user something when the task **requires a human to click inside a website UI that the AI cannot access** (e.g., a browser-based console) — not for anything you can do yourself in code or CLI.

**Ask the user only for things only a human can do**, and when you do, give **numbered, plain-language, step-by-step instructions** (no jargon, explain every click) for each of these:
1. **Create a free Firebase project** at firebase.google.com (guide them through the exact buttons to click).
2. **Enable Firestore Database** and **Firebase Authentication (Email/Password)** inside that project, and create the one admin login (their email + a password they choose).
3. **Copy the Firebase config keys** from the Firebase console and paste them to the AI (or into a config file, with exact instructions on where to find them).
4. **Create a public Telegram channel**, upload videos as posts, and share the channel username with the AI.
5. **Create a free Netlify account** and connect it to deploy the site (guide them through linking a GitHub repo or drag-and-drop deploy, whichever is simpler).
6. Anything else that requires clicking a button on an external website the AI can't control directly.

**After finishing each step above, confirm with the user in simple terms** ("Done? Great, next...") before moving to the next one — don't dump all steps at once and disappear.

**Summary for the user's own reference — what you (the human) will need to do:**
- Click through creating a Firebase project + enabling Firestore/Auth + creating your admin login
- Copy/paste a few config values from Firebase into the project
- Create your Telegram channel and upload videos there
- Create a Netlify account and click "Deploy"
- Everything else — all coding, file creation, debugging — is the AI's job, not yours.
