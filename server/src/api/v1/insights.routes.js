import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { optionalVerifyToken } from '../../middleware/authMiddleware.js';
import { insightsSchema } from '../../validations/insights.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';

const router = express.Router();

router.post('/', optionalVerifyToken, aiGenerationLimiter, validate(insightsSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        const promptInstruction = `You are a high-level strategic analyst and academic researcher. Your goal is to extract deep, non-obvious insights from the provided text.

CRITICAL OBJECTIVE: Move beyond surface-level summaries. The user needs "solid insights" that fulfill academic research or professional level understanding. Prioritize SUBSTANCE over structural brevity.

Follow this thought process:
1. CRITICAL ANALYSIS: Identify hidden patterns, complex relationships, and high-level implications in the text.
2. SYNTHESIS: Mentally construct a deep "Insight Narrative" that explains 'why' and 'how', not just 'what'.
3. ADAPTIVE STRUCTURING: Map these heavy insights into the appropriate block types below. Ensure each block is RICH in content.

Possible Insight Blocks:
1. "key_takeaways": Critical, high-impact lessons or findings. Provide detailed explanations for each.
2. "patterns_relationships": Detailed analysis of how concepts interrelate or fit into broader academic/industry frameworks.
3. "exam_focus": Identification of core conceptual pillars likely to be tested, with deep explanations of potential complexities.
4. "real_world": Practical, industry, or historical applications of these concepts with concrete examples.
5. "conceptual_tests": High-level challenge questions that require deep synthesis to answer, including detailed 'hints' that guide the thinking process.

Return ONLY a valid JSON object in this exact structure:
{
  "document_type": "string",
  "blocks": [
    { "type": "block_type", "title": "Section Title", "content": "Detailed markdown string or [detailed strings]", "items": [any objects], "source_pages": [number] }
  ]
}
Do NOT include markdown formatting, code fences, or explanations outside the JSON. Return only the raw JSON.`;

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
