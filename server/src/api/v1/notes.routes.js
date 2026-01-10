import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { notesSchema } from '../../validations/notes.validation.js';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(notesSchema), async (req, res, next) => {
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

        const { keyConcepts = true, actionItems = false, aiSummary = false } = settings || {};

        let promptInstruction = `Generate study notes from the following text. The notes should be organized into sections with bullet points.\n`;
        if (keyConcepts) promptInstruction += `- Focus on extracting the key concepts.\n`;
        if (actionItems) promptInstruction += `- Identify and list any action items or tasks mentioned.\n`;
        if (aiSummary) promptInstruction += `- Include a brief AI-generated summary of the entire text at the beginning.\n`;
        promptInstruction += `Return ONLY a valid JSON object with a "notes" key. The value should be an array of objects, each with "section" and "points" (an array of strings) keys. Do NOT include markdown formatting, code fences, or any text outside the JSON object.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(aiResponse);
        } catch (e) {
            const match = aiResponse.match(/\{[\s\S]*\}/);
            if (match) jsonResponse = JSON.parse(match[0]);
        }

        if (!jsonResponse || !Array.isArray(jsonResponse.notes)) {
            throw new Error("Invalid JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        next(error);
    }
});

export default router;
