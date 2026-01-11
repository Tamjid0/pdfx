import { Router } from 'express';
import uploadRoutes from './upload.routes.js';
import documentRoutes from './document.routes.js';
import chatRoutes from './chat.routes.js';
import summaryRoutes from './summary.routes.js';
import insightsRoutes from './insights.routes.js';
import quizRoutes from './quiz.routes.js';
import flashcardsRoutes from './flashcards.routes.js';
import notesRoutes from './notes.routes.js';
import mindmapRoutes from './mindmap.routes.js';
import formatRoutes from './format.routes.js';
import templateRoutes from './template.routes.js';
import exportRoutes from './export.routes.js';
import scrapeRoutes from './scrape.routes.js';
import jobRoutes from './job.routes.js';

const router = Router();

router.use('/upload', uploadRoutes);
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);
router.use('/summary', summaryRoutes);
router.use('/insights', insightsRoutes);
router.use('/quiz', quizRoutes);
router.use('/flashcards', flashcardsRoutes);
router.use('/notes', notesRoutes);
router.use('/mindmap', mindmapRoutes);
router.use('/format', formatRoutes);
router.use('/templates', templateRoutes);
router.use('/export', exportRoutes);
router.use('/scrape', scrapeRoutes);
router.use('/jobs', jobRoutes);

export default router;
