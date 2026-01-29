import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { flashcardsSchema } from '../../validations/flashcards.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(flashcardsSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        const promptInstruction = `Generate 10 high-quality flashcards from the following text.
        Each flashcard must have a clear "question" and a concise "answer".
        Return ONLY a valid JSON object in this exact structure:
        {
          "flashcards": [
            { "question": "Question text here?", "answer": "Answer text here." }
          ]
        }
        Do NOT include markdown formatting, code fences, or explanations. Just the raw JSON string.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        const jsonResponse = safeParseAiJson(aiResponse, 'Flashcards');

        if (!jsonResponse || !Array.isArray(jsonResponse.flashcards)) {
            throw new Error("Invalid JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        next(error);
    }
});

export default router;
