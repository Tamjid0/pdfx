import { Router } from 'express';
// API v1
import v1Routes from './v1/index.js';

// Legacy API Routes
import legacyUploadRoutes from './legacy_routes/api/uploadRoutes.js';

// Maintain old paths for backward compatibility during transition
import uploadRoutes from './v1/upload.routes.js';
import documentRoutes from './v1/document.routes.js';
import v1ChatRoutes from './v1/chat.routes.js';
import v1SummaryRoutes from './v1/summary.routes.js';
import v1InsightsRoutes from './v1/insights.routes.js';
import v1QuizRoutes from './v1/quiz.routes.js';
import v1FlashcardsRoutes from './v1/flashcards.routes.js';
import v1NotesRoutes from './v1/notes.routes.js';
import v1MindmapRoutes from './v1/mindmap.routes.js';
import v1FormatRoutes from './v1/format.routes.js';
import v1TemplateRoutes from './v1/template.routes.js';
import v1ExportRoutes from './v1/export.routes.js';
import v1ScrapeRoutes from './v1/scrape.routes.js';

const router = Router();

// API v1
router.use('/v1', v1Routes);

// Maintain old paths for backward compatibility during transition
router.use(legacyUploadRoutes);
router.use(uploadRoutes);
router.use('/documents', documentRoutes);
router.use(v1ChatRoutes);
router.use(v1SummaryRoutes);
router.use(v1InsightsRoutes);
router.use(v1QuizRoutes);
router.use(v1FlashcardsRoutes);
router.use(v1NotesRoutes);
router.use(v1MindmapRoutes);
router.use(v1FormatRoutes);
router.use(v1TemplateRoutes);
router.use(v1ExportRoutes);
router.use(v1ScrapeRoutes);

export default router;
