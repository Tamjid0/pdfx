import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { insightsSchema } from '../../validations/insights.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(insightsSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        const promptInstruction = `Design a document-adaptive Insight system. Focus on higher-level understanding, patterns, and exam-friendliness. Decide which of the following blocks are most relevant based on document content richness.

Possible Insight Blocks:
1. "key_takeaways": The most critical lessons or findings from the document.
2. "patterns_relationships": How different concepts in the document relate to each other or to broader fields.
3. "exam_focus": Specific insights on what is likely to be tested, common pitfalls, or core exam topics.
4. "real_world": How these concepts apply in practical or industry settings (only if applicable).
5. "conceptual_tests": Self-test questions that challenge deep understanding rather than rote memorization.

Return ONLY a valid JSON object in this exact structure:
{
  "document_type": "string",
  "blocks": [
    { "type": "block_type", "title": "Optional Title", "content": "string or [string]", "items": [any objects], "source_pages": [number] }
  ]
}
Do NOT include markdown formatting, code fences, or explanations. Just the raw JSON.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        console.log("Raw AI Response for Insights:", aiResponse); // Debugging Log

        const jsonResponse = safeParseAiJson(aiResponse, 'Insights');

        if (!jsonResponse || !Array.isArray(jsonResponse.blocks)) {
            console.error("Invalid Adaptive JSON Structure:", jsonResponse);
            throw new Error("Invalid adaptive JSON structure received from AI.");
        }

        res.json(jsonResponse);
    } catch (error) {
        next(error);
    }
});

export default router;
