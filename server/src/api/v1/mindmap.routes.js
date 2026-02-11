import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { mindmapSchema } from '../../validations/mindmap.validation.js';
import ApiError from '../../utils/ApiError.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';
import logger from '../../utils/logger.js';
import { addAIJob, isRedisConnected } from '../../services/queueService.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(mindmapSchema), async (req, res, next) => {
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

        const { layout = 'organic' } = settings || {};
        const promptInstruction = `Generate a mind map from the following text.
        Return ONLY a valid JSON object in this exact structure:
        {
          "nodes": [{ "id": "string", "data": { "label": "string" } }],
          "edges": [{ "id": "string", "source": "string", "target": "string" }]
        }
        Do NOT include markdown formatting, code fences, or explanations. Just the raw JSON string.`;

        // --- BACKGROUND PROCESSING LOGIC ---
        const useBackground = req.body.background || fullText.length > 10000;
        const redisAvailable = await isRedisConnected();

        if (useBackground && redisAvailable) {
            logger.info(`[MindmapRoute] Backgrounding generation for ${fileId || 'raw text'} (Length: ${fullText.length})`);
            const job = await addAIJob('mindmap', {
                fullText,
                promptInstruction,
                options: { outputFormat: 'json' }
            });
            return res.json({ success: true, jobId: job.id, isBackground: true });
        }
        // ------------------------------------

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        const jsonResponse = safeParseAiJson(aiResponse, 'Mindmap');

        if (!jsonResponse || !Array.isArray(jsonResponse.nodes) || !Array.isArray(jsonResponse.edges)) {
            throw new Error("Invalid JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        logger.error('[Mindmap] Generation failed:', error);
        next(error);
    }
});

export default router;
