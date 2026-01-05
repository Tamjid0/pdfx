import { generateChunkBasedTransformation } from '../services/aiGenerationService.js';

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
