import express from 'express';
import { generateFullDocumentTransformation } from '../../services/aiGenerationService.js';
import { aiGenerationLimiter } from '../../middleware/rateLimitMiddleware.js';
import validate from '../../middleware/validate.js';
import { quizSchema, analysisSchema } from '../../validations/quiz.validation.js';
import ApiError from '../../utils/ApiError.js';

import { resolveScopedText } from '../../utils/scoping.js';
import { safeParseAiJson } from '../../utils/aiUtils.js';
import logger from '../../utils/logger.js';
import { addAIJob, isRedisConnected } from '../../services/queueService.js';

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
                readingTime: 0
            });
        }

        const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200); // Avg 200 wpm

        // Dynamic density algorithm
        // Suggested: 1 question per ~150 words, min 5, max 50
        const suggestedCount = Math.min(50, Math.max(5, Math.floor(wordCount / 150)));

        // Maximum: 1 question per ~75 words, min 20, max 100
        const maxCount = Math.min(100, Math.max(20, Math.floor(wordCount / 75)));

        res.json({
            wordCount,
            readingTime,
            suggestedCount,
            maxCount
        });
    } catch (error) {
        logger.error('[Quiz] Analysis failed:', error);
        next(error);
    }
});

router.post('/', aiGenerationLimiter, validate(quizSchema), async (req, res, next) => {
    const { text, fileId, settings, scope } = req.body;
    let fullText = text;

    try {
        if (fileId) {
            fullText = await resolveScopedText(fileId, scope, true);
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
        
        CITATIONS:
        The text is tagged with [[nodeId]]. 
        For EACH question, you MUST provide a "hint" (a subtle clue) and "hintNodeIds" (an array of EXACT nodeId strings from where the hint or answer can be found).

        CRITICAL: Follow this formatting for types:
        ${questionTypeInstructions}

        Return ONLY a valid JSON object in this exact structure:
        {
          "quiz": [
            { 
              "question": "...", 
              "type": "mc|tf|fib", 
              "hint": "clue here", 
              "hintNodeIds": ["id1", "id2"], 
              ...rest_of_fields 
            }
          ]
        }
        Do NOT include markdown formatting, explanations, or any text outside the JSON.`;

        // --- BACKGROUND PROCESSING LOGIC ---
        const useBackground = req.body.background || fullText.length > 10000;
        const redisAvailable = await isRedisConnected();

        if (useBackground && redisAvailable) {
            logger.info(`[QuizRoute] Backgrounding generation for ${fileId || 'raw text'} (Length: ${fullText.length})`);
            const job = await addAIJob('quiz', {
                fullText,
                promptInstruction,
                options: { outputFormat: 'json' }
            });
            return res.json({ success: true, jobId: job.id, isBackground: true });
        }
        // ------------------------------------

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
        logger.error('[Quiz] Generation failed:', error);
        next(error);
    }
});

export default router;
