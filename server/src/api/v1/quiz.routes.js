import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { getVectorStore } from '../../services/vectorStoreService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { quizSchema, analysisSchema } from '../../validations/quiz.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';

const router = express.Router();

router.post('/analyze', validate(analysisSchema), async (req, res, next) => {
    const { fileId, text, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope);
        }

        if (!fullText) {
            return res.json({
                wordCount: 0,
                suggestedCount: 5,
                suggestedTopics: [],
                readingTime: 0
            });
        }

        const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200); // Avg 200 wpm

        const analysisPrompt = `Analyze the following text for an upcoming quiz. 
        Provide a recommendation for the number of questions (between 5 and 30) that would thoroughly test mastery of the material.
        Also, extract 3-5 core topics or key themes found in this specific text.

        Return ONLY a JSON object:
        {
          "suggestedCount": number,
          "suggestedTopics": ["topic1", "topic2", ...]
        }
        
        Text to analyze:
        ${fullText.substring(0, 10000)} // Capped for analysis efficiency
        `;

        const aiResponse = await generateFullDocumentTransformation(fullText, analysisPrompt, { outputFormat: 'json' });
        const analysis = safeParseAiJson(aiResponse, 'QuizAnalysis');

        res.json({
            wordCount,
            readingTime,
            suggestedCount: analysis?.suggestedCount || Math.min(30, Math.max(5, Math.floor(wordCount / 150))),
            suggestedTopics: analysis?.suggestedTopics || []
        });
    } catch (error) {
        next(error);
    }
});

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

        const promptInstruction = `Generate a ${difficulty} difficulty quiz with EXACTLY ${questionCount} questions based on the provided text.
        You MUST provide exactly ${questionCount} items.
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

        // Ensure we send exactly what was requested (truncate if AI over-generates)
        if (json.quiz.length > questionCount) {
            json.quiz = json.quiz.slice(0, questionCount);
        }

        res.json(json);
    } catch (error) {
        next(error);
    }
});

export default router;
