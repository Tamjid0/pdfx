import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { summarySchema } from '../../validations/summary.validation.js';
import Document from '../../models/Document.js';
import ApiError from '../../utils/ApiError.js';
import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';
import logger from '../../utils/logger.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(summarySchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        if (!fullText) {
            throw new ApiError(400, "No content available for specified scope.");
        }

        const {
            summaryLength = 50,
            summaryFormat = 'paragraph',
            keywords = '',
            tone = 'professional',
            language = 'English',
            summaryType = 'abstractive',
            targetWordCount
        } = settings || {};

        let promptInstruction = `Generate a summary and key points for the following text, adhering to these rules:\n`;
        promptInstruction += `- Summary type: ${summaryType}\n`;
        if (targetWordCount && targetWordCount > 0) {
            promptInstruction += `- It is a strict rule that the summary must be approximately ${targetWordCount} words long.\n`;
        } else {
            promptInstruction += `- The summary should be approximately ${summaryLength}% of the original text length.\n`;
        }
        if (summaryFormat === 'bullets') {
            promptInstruction += `- The main summary should be presented as a list of bullet points.\n`;
        } else {
            promptInstruction += `- The main summary should be a cohesive paragraph.\n`;
        }
        promptInstruction += `- The tone of the summary must be ${tone}.\n`;
        promptInstruction += `- The summary must be in ${language}.\n`;
        if (keywords) {
            promptInstruction += `- Pay special attention to the following keywords: ${keywords}.\n`;
        }
        promptInstruction += `\nReturn ONLY a valid JSON object in this exact structure:\n{\n  "summary": "string",\n  "keyPoints": ["string", "string", ...]\n}\nDo NOT include markdown formatting, code fences, explanations, or extra text.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        const json = safeParseAiJson(aiResponse, 'Summary');

        if (!json || !json.summary) {
            throw new Error("Invalid JSON structure from AI.");
        }

        res.json(json);

    } catch (error) {
        logger.error('[Summary] Generation failed:', error);
        next(error);
    }
});

export default router;
