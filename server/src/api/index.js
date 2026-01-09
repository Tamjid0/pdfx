import { Router } from 'express';
// Legacy API Routes
import formatRoutes from './legacy_routes/api/formatRoutes.js';
import summaryRoutes from './legacy_routes/api/summaryRoutes.js';
import templateRoutes from './legacy_routes/api/templateRoutes.js';
import insightsRoutes from './legacy_routes/api/insightsRoutes.js';
import notesRoutes from './legacy_routes/api/notesRoutes.js';
import quizRoutes from './legacy_routes/api/quizRoutes.js';
import flashcardsRoutes from './legacy_routes/api/flashcardsRoutes.js';
import mindmapRoutes from './legacy_routes/api/mindmapRoutes.js';
import uploadRoutes from './legacy_routes/api/uploadRoutes.js';
import chatRoutes from './legacy_routes/api/chatRoutes.js';
import exportRoutes from './legacy_routes/api/exportRoutes.js';

// New pipeline routes
import fileUploadRoutes from './fileUploadRoutes.js';
import documentRoutes from './documentRoutes.js';


const router = Router();

// Legacy Routes
router.use(formatRoutes);
router.use(summaryRoutes);
router.use(templateRoutes);
router.use(insightsRoutes);
router.use(notesRoutes);
router.use(quizRoutes);
router.use(flashcardsRoutes);
router.use(mindmapRoutes);
router.use(uploadRoutes);
router.use(chatRoutes);
router.use(exportRoutes);

// New pipeline routes
router.use(fileUploadRoutes);
router.use('/documents', documentRoutes);


export default router;
