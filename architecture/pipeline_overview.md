# Unified Document Pipeline Architecture

## Overview
The Unified Document Pipeline is a "Structure-First" architecture designed to extract, normalize, and store document content (PDF, PPTX) as a structured data graph before any downstream processing (like embedding or rendering) occurs.

## Core Philosophy
> **"Extract Once, Reuse Everywhere."**

Use a single source of truth (`DocumentGraph`) to drive:
1.  **AI/Embeddings**: Via derived plain text.
2.  **Rendering**: Via absolute positioning data.
3.  **Editing**: Via structured node manipulation.

## Architecture Data Flow

```mermaid
graph TD
    A[Upload File (PDF/PPTX)] --> B[DocumentProcessor]
    B --> C{File Type?}
    C -- PDF --> D[PdfExtractor]
    C -- PPTX --> E[PptxExtractor]
    
    D --> F[DocumentGraph (JSON)]
    E --> F
    
    F --> G[Storage (JSON File)]
    F --> H[Derived Text Generator]
    H --> I[Legacy Embedding System (Faiss)]
```

## Components

### 1. Document Processor (Orchestrator)
**Location:** `server/src/services/DocumentProcessor.js`
- **Role**: Entry point for all file processing.
- **Responsibilities**:
    - Identifies MIME type.
    - Instantiates correct Extractor strategy.
    - Persists the resulting JSON graph to disk `server/src/database/documents/{id}.json`.
    - Generates a flat text representation for compatibility with legacy systems.

### 2. Extractors (Adapters)
**Location:** `server/src/services/extractors/`
- **Role**: Convert raw binary/XML into normalized `ContentNode` objects.
- **`PdfExtractor`**:
    - Uses `pdfjs-dist` (Legacy Build).
    - Extracts `TextItems`.
    - Normalizes layout to `%` based coordinates (0-100).
- **`PptxExtractor`**:
    - Uses `jszip` + `xml2js`.
    - Parses XML shape trees (`spTree`).
    - Handles Groups (`grpSp`) and Z-Order recursion.
    - Extracts Images as Base64 Data URLs.

### 3. Data Models
**Location:** `server/src/models/DocumentGraph.js`
- **`DocumentRoot`**: Top-level container.
- **`DocumentPage`**: Represents a Slide or Page.
- **`ContentNode`**: The atomic unit of content.
    - **`TextNode`**: Contains text, font style, and precise position.
    - **`ImageNode`**: Contains image data (URL/Base64) and precise position.

## Data Structure (Example JSON)
```json
{
  "documentId": "uuid-1234",
  "type": "pptx",
  "metadata": { "title": "Quarterly Report", "pageCount": 5 },
  "structure": {
    "pages": [
      {
        "index": 1,
        "type": "slide",
        "nodes": [
          {
            "type": "text",
            "content": { "text": "Financial Overview" },
            "position": { "x": 10.5, "y": 5.2, "width": 80, "height": 10 }
          },
          {
            "type": "image",
            "content": { "url": "data:image/png;base64,..." },
            "position": { "x": 20, "y": 30, "width": 40, "height": 50 }
          }
        ]
      }
    ]
  }
}
```

## Current State (Phase 1)
- **Embedding**: Text is automatically derived from the JSON graph and sent to FAISS.
- **Images**: Stored inline as Base64 (to be optimized to disk storage in Phase 2).
- **Viewer**: Frontend currently uses legacy rendering; will be updated to consume this JSON in next phase.
