import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { flashcardsSchema } from '../../validations/flashcards.validation.js';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(flashcardsSchema), async (req, res, next) => {
    const { text, fileId, settings } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            const vectorStore = await getVectorStore(fileId);
            if (vectorStore) {
                const allDocs = await vectorStore.similaritySearch("", 100);
                fullText = allDocs.map(doc => doc.pageContent).join('\n\n');
            } else {
                throw new ApiError(404, `No document found for fileId: ${fileId}`);
            }
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

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(aiResponse);
        } catch (e) {
            const match = aiResponse.match(/\{[\s\S]*\}/);
            if (match) jsonResponse = JSON.parse(match[0]);
        }

        if (!jsonResponse || !Array.isArray(jsonResponse.flashcards)) {
            throw new Error("Invalid JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        next(error);
    }
});

export default router;
