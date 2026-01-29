import { generateChunkBasedTransformation, generateChunkBasedStreamingTransformation } from '../services/aiGenerationService.js';

export const chatWithDocument = async (req, res) => {
    const { fileId, message } = req.body;

    if (!fileId || !message) {
        return res.status(400).json({ error: 'fileId and message are required.' });
    }

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
};

/**
 * Stream-based chat using Server-Sent Events (SSE)
 */
export const chatWithDocumentStream = async (req, res) => {
    const { fileId, message } = req.body;

    if (!fileId || !message) {
        return res.status(400).json({ error: 'fileId and message are required.' });
    }

    // Set headers for SSE
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
        console.error('Error during streaming chat:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to stream response' })}\n\n`);
        res.end();
    }
};
