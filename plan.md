# 🚀 PDFy Hybrid Roadmap: Firebase + MongoDB + Local Storage

This plan bridges **Firebase Authentication** with your existing **MongoDB** and **Local Filesystem** to build a production-grade foundation without requiring a credit card for cloud storage.

---

## 🏗️ Phase 1: The "Hybrid" Link (Current)
**Goal:** Connect Firebase `uid` to MongoDB user records.

- [ ] **Auth Data Sync**: When a user logs in for the first time via Firebase, create a corresponding user document in MongoDB.
- [ ] **Middleware / Guard**: Implement a `useAuthGuard` hook to protect dashboard routes and redirect unauthenticated users to `/login`.
- [ ] **Session Persistence**: Ensure the UI stays responsive while Firebase validates the session on page load.

---

## 📂 Phase 2: Local File Management
**Goal:** Handle PDF/PPTX uploads to the local server while storing metadata in MongoDB.

- [ ] **Upload Pipeline**:
    - [ ] Client: Send file to `/api/v1/upload`.
    - [ ] Server: Save file to `server/uploads/{firebase_uid}/{file_id}.pdf`.
- [ ] **Metadata Storage**: Store file records in MongoDB with `firebase_uid` as the owner.
    - Fields: `name`, `size`, `local_path`, `fileId`, `owner_uid`, `upload_date`.
- [ ] **File Retrieval**: Create a secure route to stream local files back to the viewer for the authorized owner ONLY.

---

## 💬 Phase 3: State & Content Persistence
**Goal:** Save all generated AI content so it's not lost on refresh.

- [ ] **Chat Persistence**: Save `chatHistory` to MongoDB.
- [ ] **Summary & Notes Storage**: Store generated summaries, flashcards, and mindmaps in a `Content` collection.
- [ ] **Document Linking**: Ensure every piece of content is tied to both a `documentId` and a `firebase_uid`.

---

## 🎨 Phase 4: UI Refinement & Polish
**Goal:** Improve the user experience and dashboard.

- [ ] **Recent Documents**: Add a "Recent Files" list to the dashboard sidebar.
- [ ] **User Profile Page**: Allow users to update their `displayName` and see their storage stats.
- [ ] **Loading States**: Add global premium loading overlays for database operations.

---

## ☁️ Phase 5: Cloud Migration (Future)
**Goal:** Move to full cloud infrastructure when ready.

- [ ] **Firebase Storage**: Swap `server/uploads/` for Google Cloud Storage buckets.
- [ ] **Firestore Migration**: (Optional) Move metadata from MongoDB to Firestore if a pure Firebase stack is desired.
- [ ] **Deployment**: Setup Vercel (Frontend) + Render/Heroku (Backend) deployment.

---

> [!TIP]
> This architecture is "Migration-Ready." Because we are using the Firebase `uid` as the primary key in MongoDB, moving to the cloud later will just be a matter of moving files and updating paths.
