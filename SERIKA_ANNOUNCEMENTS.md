# ✨ SerikaCord — Latest Updates

Hey SerikaCord! We've been hard at work shipping improvements. Here's everything new from our last 11 updates:

---

## 🚀 Custom Profile Previews, Drag-and-Drop & Composer Magic

We've polished the User Profile Settings, enhanced channel settings layouts, improved drag-and-drop reordering, and added a keyboard focus helper:

- **True Side-by-Side Profile Preview**: Profile Settings now displays your live customizable `ProfileCard` preview directly on the right side on desktop screens, updating in real-time as you tweak your colors, nickname, avatar, banner, or status!
- **Channel Sidebar Drag-and-Drop to Bottom**: Easily reorder categories or channels to the absolute bottom of the list. Hovering near the bottom reveals a dedicated drop zone so nothing gets stuck.
- **Type-to-Focus Composer**: Just start typing! When viewing any chat or DM, unless you are already focused on another input, typing any letter, number, or symbol automatically focuses the message bar.
- **GIF Favorite Overlay**: The favorite star button on GIFs now sits perfectly in the top-right corner of the image, keeping the layout clean and unified.
- **Last Message Previews & Long Broadcasts**: The DM list now decrypts and previews the actual latest message instead of showing a generic message. Database validation limits were also increased so long broadcasts are saved successfully without issues.

---

## 🕐 Timezone Display on Profiles

You can now show your current local time on your profile!

- Pick your timezone from a full IANA timezone list in **Settings → Profiles**
- Toggle "Display my current time on my profile" to control who sees it
- When enabled, your profile card shows your live current time (e.g., "7:34 PM • Asia/Tokyo")
- Fully privacy-respecting — your timezone is only exposed when you opt in

---

## 🎨 Cleaner Layout & Bigger Emojis

- Removed the "Active Now" sidebar from the DMs page for a cleaner, more focused layout
- Emoji-only messages now render **much bigger** — Twemoji from 2.5em → 3em, custom emojis from 3em → 3.5em
- Inline custom emojis in emoji-only messages bumped from 40px → 56px
- Announcement banner now supports multi-line text with proper wrapping
- Switch Accounts button in the profile popup is now fully wired up
- Member list updates are now smarter and faster with signature-based change detection

---

## 🖼️ Image Grids & Markdown Profiles

- Multiple images and videos in a message now display in compact grid layouts (2-3 columns with thumbnails)
- Inline media dimensions reduced for a tighter, cleaner chat experience
- User bios, custom statuses, and profile cards now render **markdown** — add links, formatting, and more
- Inline custom status editor right in the profile popup with save/cancel/clear actions
- Attachments are now grouped by type (images, videos, other) for better visual organization

---

## 👥 Friends Page Redesign

- Friends page header redesigned with larger title, live stats, and a prominent "Add Friend" button
- Add Friend tab modernized with a card-based layout and step-by-step tips
- Pending requests now display in a grid with color-coded badges
- Friend list enhanced with hover effects, status indicators, and action menus
- Blocked users and empty states got a visual polish pass
- Member sidebar now hidden on mobile in servers for more screen space

---

## 📡 Self-Describing API & Helpful 404s

- `GET /api` now returns a friendly index page with docs and version links instead of a bare error
- 404 responses are now path-aware: Discord-compatible `{ message, code }` under `/api/v10` for bot libraries, and an informative `{ error, message, documentation, hint }` elsewhere
- `GET /api/v10` returns API metadata (version, docs, key endpoints) so the API reads as alive

---

## 🤖 Bot Gateway & Interactions Overhaul

- Bot Gateway now runs inside the Next.js server on the same port — single deploy, no extra container
- Full Discord v10 Gateway support: HELLO/IDENTIFY/HEARTBEAT/READY, intents, and guild-scoped fan-out
- Bot provisioning fixed — enabling a bot now properly creates the bot user, token, and Ed25519 keypair
- Signed (Ed25519) HTTP interactions with PING/PONG verification and type-4 responses
- Event bus emits MESSAGE_CREATE/UPDATE/DELETE and member events to bots
- API endpoint moved to `api.serika.chat` with updated docs

---

## ⌨️ Slash Command Autocomplete & NSFW Improvements

- Slash command autocomplete with suggestions for `/clear`, `/kick`, `/ban`, `/timeout`, `/nick`, `/tts`
- Command execution flow with TTS support and message clearing
- NSFW channel confirmations now persist in sessionStorage — no more re-prompts on navigation
- NSFW gate moved to the channel page for better routing control
- Member sidebar optimized to use shared server context instead of polling

---

## 🔞 NSFW Channel Gate & Audio Trimmer

- Age-restricted warning dialog for NSFW channels with a confirmation flow
- Interactive waveform audio trimmer with drag handles and real-time playback progress
- Channel switching optimized to prevent unnecessary re-renders
- Member sidebar loading optimized to avoid flickering on server changes
- Create Channel dialog now passes default channel type and parent ID for better UX

---

## 🐛 Bug Fix: ChannelSidebar Crash (React #310)

- Fixed a crash when switching between a server and DMs — the `isIOS` hook was placed after an early return, changing hook count and triggering React error #310. The hook is now hoisted above all early returns.

---

## 📋 DM Profile Sidebar Overhaul

The DM profile sidebar now uses the same modern `ProfileCard` component as the rest of the app:

- Full profile customizations: banner, profile colors, gradients, and display name styles
- Timezone display with live current time when the user has it enabled
- Badge hover tooltips with the new badge design
- Markdown rendering in bio and custom status
- Premium badge, staff pills, and system pills all rendered correctly
- Cleaner layout with proper avatar/banner overlap and action buttons

---

## 🏷️ Server Nicknames Now Show in Chat

Messages in server channels now display the user's **server nickname** instead of their global username. If you set a nickname in a server, that's what everyone sees in the chat — no more showing your raw username when you have a nickname set.

---

## 📢 Broadcast Fix: Announcements Now Reach Everyone

Fixed an issue where publishing an announcement with "Send DMs" wouldn't deliver to all users:

- DM sending is now **fire-and-forget** — the HTTP request returns immediately while DMs are processed in the background, preventing timeouts on large user bases
- Admin routes are now **exempt from rate limiting** so broadcasts are never throttled
- Progress is logged server-side so you can monitor delivery

---

### 💜 Thanks for using SerikaCord!

Got feedback or found a bug? Drop it in the server. We're always improving.
