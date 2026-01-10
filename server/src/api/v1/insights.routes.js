import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { insightsSchema } from '../../validations/insights.validation.js';
import ApiError from '../../utils/ApiError.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(insightsSchema), async (req, res, next) => {
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

        const { keyEntities = true, topics = false, customExtraction = '' } = settings || {};
        const promptInstruction = `Extract key insights from the following text based on these settings: Key Entities: ${keyEntities}, Topics: ${topics}, Custom: "${customExtraction}".
        Return ONLY a valid JSON object in this exact structure:
        {
          "insights": [
             { "title": "Insight Title", "description": "Detailed description", "type": "key-entity|topic|custom" }
          ]
        }
        Do NOT include markdown formatting, code fences, or explanations. Just the raw JSON string.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        console.log("Raw AI Response for Insights:", aiResponse); // Debugging Log

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(aiResponse);
        } catch (e) {
            console.warn("JSON Parse Failed, attempting regex extraction...");
            const match = aiResponse.match(/\{[\s\S]*\}/);
            if (match) {
                jsonResponse = JSON.parse(match[0]);
            }
        }

        if (!jsonResponse || !Array.isArray(jsonResponse.insights)) {
            console.error("Invalid JSON Structure:", jsonResponse);
            throw new Error("Invalid JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        next(error);
    }
});

export default router;
