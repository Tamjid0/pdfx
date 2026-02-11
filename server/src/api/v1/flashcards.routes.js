import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { flashcardsSchema } from '../../validations/flashcards.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';
import logger from '../../utils/logger.js';
import { addAIJob, isRedisConnected } from '../../services/queueService.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(flashcardsSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope, true);
        }

        const promptInstruction = `Generate 10 high-quality flashcards from the following text.
        Each flashcard must have a clear "question" and a concise "answer".
        
        CITATIONS:
        The text is tagged with [[nodeId]]. 
        For EACH flashcard, you MUST provide a "hint" (a subtle clue) and "hintNodeIds" (an array of EXACT nodeId strings from where the answer can be found).

        Return ONLY a valid JSON object in this exact structure:
        {
          "flashcards": [
            { "question": "...", "answer": "...", "hint": "clue here", "hintNodeIds": ["id1", "id2"] }
          ]
        }
        Do NOT include markdown formatting, code fences, or explanations. Just the raw JSON string.`;

        // --- BACKGROUND PROCESSING LOGIC ---
        const useBackground = req.body.background || fullText.length > 10000;
        const redisAvailable = await isRedisConnected();

        if (useBackground && redisAvailable) {
            logger.info(`[FlashcardsRoute] Backgrounding generation for ${fileId || 'raw text'} (Length: ${fullText.length})`);
            const job = await addAIJob('flashcards', {
                fullText,
                promptInstruction,
                options: { outputFormat: 'json' }
            });
            return res.json({ success: true, jobId: job.id, isBackground: true });
        }
        // ------------------------------------

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        const jsonResponse = safeParseAiJson(aiResponse, 'Flashcards');

        if (!jsonResponse || !Array.isArray(jsonResponse.flashcards)) {
            throw new Error("Invalid JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        logger.error('[Flashcards] Generation failed:', error);
        next(error);
    }
});

export default router;
