import express from 'express';
import validate from '../../middleware/validate.js';
import { chatSchema, chatStreamSchema } from '../../validations/chat.validation.js';
import { optionalVerifyToken } from '../../middleware/authMiddleware.js';
import { chatWithDocument, chatWithDocumentStream, chatWithItemContext } from '../../controllers/chatController.js';

const router = express.Router();

router.post('/', optionalVerifyToken, validate(chatSchema), (req, res, next) => {
    // Ensure userId is populated from token or fallback to guest
    req.body.userId = req.body.userId || req.user?.uid || 'guest';
    next();
}, chatWithDocument);

router.post('/stream', optionalVerifyToken, validate(chatStreamSchema), (req, res, next) => {
    // Ensure userId is populated from token or fallback to guest
    req.body.userId = req.body.userId || req.user?.uid || 'guest';
    next();
}, chatWithDocumentStream);

// New endpoint for quiz/flashcard item-specific chat
router.post('/item-context', optionalVerifyToken, (req, res, next) => {
    req.body.userId = req.body.userId || req.user?.uid || 'guest';
    next();
}, chatWithItemContext);

export default router;

