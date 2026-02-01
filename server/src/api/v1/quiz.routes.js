import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { quizSchema } from '../../validations/quiz.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';

const router = express.Router();

router.post('/', aiGenerationLimiter, validate(quizSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        const { questionTypes = ['multiple-choice'], difficulty = 'medium', questionCount = 10 } = settings || {};

        let questionTypeInstructions = "";
        if (questionTypes.includes('multiple-choice')) {
            questionTypeInstructions += `
            - Multiple Choice (mc): Provide "question", "options": [{"label": "A", "value": "option1"}, ...], and "correctAnswer": "value_of_correct_option".`;
        }
        if (questionTypes.includes('true-false')) {
            questionTypeInstructions += `
            - True/False (tf): Provide "question", "correctAnswer": "true" or "false".`;
        }
        if (questionTypes.includes('fill-in-the-blank')) {
            questionTypeInstructions += `
            - Fill-in-the-Blank (fib): Provide "question" (use ____ for blank), and "correctAnswer": "string_answer".`;
        }

        const promptInstruction = `Generate a ${difficulty} difficulty quiz with EXACTLY ${questionCount} questions based on the text.
        Mix the following question types: ${questionTypes.join(', ')}.
        
        CRITICAL: Follow this formatting for types:
        ${questionTypeInstructions}

        Return ONLY a valid JSON object in this exact structure:
        {
          "quiz": [
            { "question": "...", "type": "mc|tf|fib", ...rest_of_fields }
          ]
        }
        Do NOT include markdown formatting, explanations, or any text outside the JSON.`;

        const aiResponse = await generateFullDocumentTransformation(fullText, promptInstruction, { outputFormat: 'json' });

        const json = safeParseAiJson(aiResponse, 'Quiz');

        if (!json || !json.quiz) {
            throw new Error("Invalid JSON structure received from AI");
        }

        res.json(json);
    } catch (error) {
        next(error);
    }
});

export default router;
