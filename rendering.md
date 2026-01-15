Objective
Implement a flicker-free, fast, and deterministic document rendering system for PDFs and PPTX slides by eliminating client-side PDF rendering and using server-generated page images as the single rendering source.

Core Principles

Client must never render PDFs

No PDF.js canvas rendering in the browser

No text layer, no font parsing, no vector rasterization client-side

Rendering must be static

All pages are rendered once on the server

Client only displays images

No dynamic reflow or repainting

Rendering and AI are decoupled

Rendering layer does not depend on AI or embeddings

JSON extraction remains independent and untouched

Server-Side Responsibilities

Document Intake

Accept PDF or PPTX upload

Assign a stable documentId

Format Normalization

If input is PPTX:

Convert PPTX → PDF using headless LibreOffice

PDF becomes the single source of truth for rendering

Page Rendering

Render every page of the PDF to image files

Use a deterministic renderer (Poppler / equivalent)

Resolution: 150–200 DPI

Output format: WebP

Storage Structure

/documents/{documentId}/pages/1.webp
/documents/{documentId}/pages/2.webp
/documents/{documentId}/pages/3.webp


One-Time Cost

Rendering happens only at upload time

Never re-render on the client

Client-Side Responsibilities

Viewer Implementation

Use <img> elements only

One page rendered at a time

Page navigation swaps image source

Performance Rules

Preload next page image

Cache previously viewed pages in memory

No canvas usage

No PDF parsing logic

Zoom Handling

Zoom implemented using CSS transforms

Images are never re-requested or re-rendered for zoom

Failure Handling

If image is unavailable → show loading placeholder

Viewer must not block UI thread

Explicit Constraints (Non-Negotiable)

❌ No PDF.js rendering in production viewer

❌ No canvas lifecycle management

❌ No client-side font or layout parsing

❌ No rendering logic tied to AI, chat, or embeddings

❌ No hybrid rendering during this phase

Expected Outcome

Zero white/black flicker

Instant page display

Predictable layout

Smooth navigation

future plan :
Rendering architecture stable enough to build future PDF view(currently only available for slides next will be for pdf) + highlighting (phase 6 from improvement.md) (these are futupre plan)