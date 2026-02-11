import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { optionalVerifyToken } from '../../middleware/authMiddleware.js';
import { insightsSchema } from '../../validations/insights.validation.js';
import logger from '../../utils/logger.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';
import { addAIJob, isRedisConnected } from '../../services/queueService.js';

const router = express.Router();

router.post('/', optionalVerifyToken, aiGenerationLimiter, validate(insightsSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        const promptInstruction = `You are a strategic analyst. Goal: Extract deep, non-obvious insights and structure them for a high-level dashboard.
        
        Strictly output these 5 block types in this order:

        1. "synthesis" (Hidden Connection)
           - Find two seemingly unrelated facts that are actually connected.
           - Schema: { "type": "synthesis", "title": "The Connection Title", "subtitle": "Hidden Connection", "content": "Markdown explanation..." }

        2. "gap_analysis" (What's Missing)
           - Identify critical omissions in the text.
           - Schema: { "type": "gap_analysis", "title": "Critical Gaps", "subtitle": "Gap Analysis", "content": "Intro text...", "items": ["Gap 1", "Gap 2"], "badges": [{ "label": "Critical Gap", "type": "critical" }] }

        3. "actionable" (What To Do)
           - Concrete steps to take based on the text.
           - Schema: { "type": "actionable", "title": "Action Plan", "subtitle": "Actionable Takeaway", "content": "Intro text...", "items": [{ "title": "Step 1", "description": "Do this..." }] }

        4. "key_stat" (Data Grid)
           - Extract the most important numbers.
           - Schema: { "type": "key_stat", "title": "By The Numbers", "subtitle": "Key Statistics", "content": "Intro text...", "items": [{ "value": "87%", "label": "Retention Rate" }] }

        5. "trend" (Future Outlook)
           - Predict a future trend based on the text.
           - Schema: { "type": "trend", "title": "The Evolution", "subtitle": "Emerging Trend", "content": "Markdown text...", "implication": "What is driving this change..." }

        Return ONLY a valid JSON object in this exact structure:
        {
          "document_type": "string",
          "blocks": [
            { "type": "block_type", ...fields }
          ]
        }
        Do NOT include markdown formatting, code fences, or explanations outside the JSON. Return only the raw JSON.`;

        // --- BACKGROUND PROCESSING LOGIC ---
        const useBackground = req.body.background || fullText.length > 10000;
        const redisAvailable = await isRedisConnected();

        if (useBackground && redisAvailable) {
            logger.info(`[InsightsRoute] Backgrounding generation for ${fileId || 'raw text'} (Length: ${fullText.length})`);
            const job = await addAIJob('insights', {
                fullText,
                promptInstruction,
                options: { outputFormat: 'json' }
            });
            return res.json({ success: true, jobId: job.id, isBackground: true });
        }
        // ------------------------------------

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });


        const jsonResponse = safeParseAiJson(aiResponse, 'Insights');

        if (!jsonResponse || !Array.isArray(jsonResponse.blocks)) {
            logger.error(`Invalid Adaptive JSON Structure: ${JSON.stringify(jsonResponse)}`);
            throw new Error("Invalid adaptive JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        next(error);
    }
});

export default router;
