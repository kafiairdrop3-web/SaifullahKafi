# YouTube Video Integration — Spec (Replaces Telegram)

> Context: this is part of a larger project (HSC Study Hub website). Only the video storage/playback method needs to change — everything else in the existing site (design, filters, admin panel, Firebase, hosting) stays exactly as already built. Apply only the changes below.

---

## What to change

Replace the Telegram widget-based video playback with **YouTube (Unlisted videos) + YouTube IFrame Embed**.

**Why:** Telegram's embed widget only works for small/preview-sized media and has no real player controls. YouTube's embedded player is free, has no length/size limits, and comes with full built-in controls: play/pause, seek/skip, playback speed (0.25x–2x), fullscreen, captions, and quality selection.

---

## 1. Video Upload (manual, done by the user)
- Each class video is uploaded to YouTube with **visibility set to "Unlisted"** (not Public, not Private).
- Unlisted means: not searchable, not shown on the channel or to subscribers — but anyone with the direct link (or an embed) can view it. This keeps content effectively private, same as before with the Telegram channel.
- Every YouTube video has a unique `VIDEO_ID`, found in its URL — e.g. in `https://youtu.be/dQw4w9WgXcQ`, the ID is `dQw4w9WgXcQ`.

---

## 2. Admin Panel — Add/Edit Video Form
Replace the old "Telegram Post Link" field with:
- **YouTube Video Link** (text input) — accepts the full YouTube URL in any common format (`https://youtu.be/VIDEO_ID` or `https://www.youtube.com/watch?v=VIDEO_ID`).
- The app should **extract just the `VIDEO_ID`** from whatever URL format is pasted, and store that extracted ID (not the full URL) in the database.

---

## 3. Data Structure (Firestore)
In the `videos` collection, rename/replace the old `telegramPostLink` field with:
```
youtubeVideoId: "dQw4w9WgXcQ"
```
(string — just the video ID, not the full URL)

---

## 4. Playback / Embed on the Subject Page
When a user clicks a video card, render this standard YouTube IFrame embed, substituting in the video's `youtubeVideoId`:

```html
<iframe
  width="100%"
  height="480"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen>
</iframe>
```
- Render this inside the same modal/inline container that was previously used for the Telegram widget.
- No YouTube API key is required for this basic embed/playback — it works purely client-side with just the video ID.
- All native player controls (speed, seek, fullscreen, captions, quality) come built-in automatically — no custom player UI needs to be built.

---

## 5. Nothing else changes
- No backend/server needed for this — still a pure client-side embed, consistent with the rest of the site's static-hosting-on-Netlify approach.
- Design, filters (By Course / By Chapter / By Teacher), Admin Panel structure, Firebase Auth, and all other pages remain exactly as already implemented.

---

## 6. Fullscreen & Download Deterrence

**Fullscreen:** Already supported — the `allowfullscreen` attribute and `fullscreen` value inside `allow="..."` in the iframe code above enable YouTube's native fullscreen button automatically. No extra work needed.

**Making it harder to download (e.g., via IDM):**
- Using the **YouTube IFrame embed** (as specified above) instead of a raw `<video src="...">` tag already provides a solid baseline: YouTube serves video as adaptive streaming segments rather than one direct downloadable file link, which blocks most simple download-manager "grab" popups (including IDM's typical detection) far better than self-hosted video would.
- Additional cosmetic/deterrence tweaks to the embed URL (optional, add as query params to the `src`):
  ```
  https://www.youtube.com/embed/VIDEO_ID?modestbranding=1&rel=0
  ```
  - `modestbranding=1` — reduces YouTube branding on the player
  - `rel=0` — prevents related/other videos from showing at the end
- Disabling right-click "Save video as" on the page (via a simple `oncontextmenu="return false"` on the video container) can be added as a minor extra deterrent against casual users, though this has no effect on IDM specifically and can be trivially bypassed.

**Important honesty note (do not oversell this to the user):** No embed method — YouTube or otherwise — can make video content 100% undownloadable. Determined users can always use screen recording, browser extensions built specifically for YouTube, or command-line tools (e.g., yt-dlp) to save the video regardless of these measures. What's described above meaningfully raises the bar against casual/basic downloading (like a plain IDM popup) but is a deterrent, not a guarantee.
