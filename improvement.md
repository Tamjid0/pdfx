# Project Roadmap & Remaining Improvements

This document tracks the strategic phases remaining to transition from a prototype to a fully scalable, production-grade AI Document Platform.

---

## 🚀 Phase 2: Background Jobs (Next Recommendation)(done)
**Goal:** Offload heavy processing to prevent server timeouts and improve UI snappiness.

- [ ] **Redis & BullMQ Integration**: Set up a message broker to handle background tasks.
- [ ] **Async Processing**: Move PDF/PPTX extraction and FAISS embedding into background workers.
- [ ] **Job Status API**: Implement endpoints (`/api/v1/jobs/:id`) so the frontend can show a progress bar or "Processing..." spinner.
- [ ] **Webhook Notifications**: (Optional) Notify users when a long document is ready.

---

## 💾 Phase 3: Database Migration (Postponed)
**Goal:** Move from local filesystem storage to a centralized, queryable database.

- [ ] **MongoDB/Mongoose Setup**: Transition `db.json` and document JSONs to MongoDB collections.
- [ ] **Centralized Metadata**: Store upload dates, file sizes, and processing status in the DB.
- [ ] **Vector Store Upgrade**: Consider a hosted vector database (MongoDB Atlas Vector Search or Pinecone) for multi-user isolation.

---

## 🔐 Phase 4: User Authentication & Private Storage
**Goal:** Enable users to save their own documents and maintain private chat histories.

- [ ] **Identity Management**: Integrate Auth0, NextAuth, or a custom JWT-based system.
- [ ] **User-Document Mapping**: Link every uploaded document to a `userId`.
- [ ] **Private History**: Store chat logs, summaries, and notes per user in the DB.

---

## 📄 Phase 5: Document Versioning & Advanced Context
**Goal:** Allow users to edit generated content without losing the ability to generate new insights.

- [ ] **Version Tracking**: Save multiple drafts of a summary or set of notes.
- [ ] **Selective Re-embedding**: Let users update the "source of truth" used by the AI when they edit the document preview.
- [ ] **Multi-Format Support**: Expand the `DocumentProcessor` to handle `.docx`, `.txt`, and `.html` directly.

---

## 🎨 Phase 6: Frontend Polish & Visual Grounding
**Goal:** Improve the UX by connecting AI answers directly to the document visuals.

- [ ] **Visual Citations**: When the AI answers, highlight the exact page/paragraph in the PDF viewer.
- [ ] **Enhanced SlideViewer**: Support animations or rich-text overlays for extracted PPTX slides.
- [ ] **Theme System**: Full support for system-preference-based Dark/Light modes.

---

## 🛠 Maintenance & Observability
- [ ] **Sentry Integration**: For real-time error tracking in production.
- [ ] **Prometheus/Grafana**: For monitoring server resources and AI API usage latency.
- [ ] **Automated Testing**: CI/CD pipeline with Jest and Playwright for end-to-end verification.

---

## 👁️ Visual Grounding & Citations (Future - On Hold)
**Goal:** Connect AI answers directly to document visuals.
- [ ] **Visual Citations**: Return `[Page X]` references in chat.
- [ ] **Coordinate Mapping**: Map text segments to static image coordinates.
- [ ] **Highlight Overlay**: Draw highlight boxes on the static image when a citation is clicked.
