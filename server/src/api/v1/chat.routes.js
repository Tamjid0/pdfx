import express from 'express';
import { generateChunkBasedTransformation, generateChunkBasedStreamingTransformation } from '../../services/aiGenerationService.js';
import validate from '../../middleware/validate.js';
import { chatSchema, chatStreamSchema } from '../../validations/chat.validation.js';

const router = express.Router();

router.post('/', validate(chatSchema), async (req, res) => {
    const { fileId, message } = req.body;

    try {
        const response = await generateChunkBasedTransformation(fileId, message);
        res.json({
            sender: 'ai',
            text: response,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        });
    } catch (error) {
        console.error('Error during chat with document:', error);
        res.status(500).json({ error: error.message || 'Failed to get a response from the document.' });
    }
});

router.post('/stream', validate(chatStreamSchema), async (req, res) => {
    const { fileId, message } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream = generateChunkBasedStreamingTransformation(fileId, message);
        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        res.write('event: end\ndata: {}\n\n');
        res.end();
    } catch (error) {
        console.error('Streaming error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

export default router;
