import genAI from '../config/gemini.js';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { hfEmbeddings } from './embeddingService.js';
import path from 'path';
import fs from 'fs';

const aiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

/**
 * Performs full-document transformation for raw text (e.g., summaries, notes).
 * @param {string} fullText - The raw text content to process.
 * @param {string} promptInstruction - Specific instructions for the AI.
 * @param {object} [options={}] - Additional options.
 * @returns {Promise<string>} - The AI generated content.
 */
export async function generateFullDocumentTransformation(fullText, promptInstruction, options = {}) {
    if (!fullText) {
        throw new Error('Full text must be provided for transformation.');
    }

    const systemPrompt = `
You are an expert AI assistant.
You MUST ONLY use information from the "Document content" below.
Do NOT invent facts. If the answer is not in the document, say so.
Maintain a ${options.outputFormat || 'text'} format for your output.

Document content:
"""
${fullText}
"""

User's specific instruction: "${promptInstruction}"
`;

    try {
        const result = await aiModel.generateContent(systemPrompt);
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        console.error('Error in full document transformation:', error);
        throw new Error('Failed to generate full document transformation.');
    }
}

/**
 * Performs chunk-based RAG generation using a FAISS vector index.
 * @param {string} fileId - The ID of the document to query.
 * @param {string} query - The user's query or question.
 * @param {number} [topN=4] - Number of top relevant documents to retrieve.
 * @returns {Promise<string>} - The AI generated content based on relevant documents.
 */
export async function generateChunkBasedTransformation(fileId, query, topN = 4) {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found. Please upload the file again.`);
    }

    // Load the FAISS index from disk
    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);

    const searchResults = await vectorStore.similaritySearch(query, topN);

    if (searchResults.length === 0) {
        return "Information not found in document. Try rephrasing your question.";
    }

    const context = searchResults.map(doc => doc.pageContent).join('\n\n---\n\n');

    const systemPrompt = `
You are an expert AI assistant answering questions based STRICTLY on the provided "Context".
Your goal is to provide a helpful and well-formatted answer.
- ONLY use information directly from the "Context" below.
- DO NOT invent facts. If the answer is not in the Context, say so clearly.
- Format your answer using Markdown. Use lists, bold text, and newlines to make the information clear and readable.
- Be concise but thorough in your answer.

Context:
"""
${context}
"""

User's query: "${query}"
`;

    try {
        const result = await aiModel.generateContent(systemPrompt);
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        console.error('Error in chunk-based transformation:', error);
        throw new Error('Failed to generate chunk-based transformation.');
    }
}

/**
 * Performs periodic RAG streaming generation using a FAISS vector index.
 * @param {string} fileId - The ID of the document to query.
 * @param {string} query - The user's query or question.
 * @param {number} [topN=4] - Number of top relevant documents to retrieve.
 * @returns {AsyncGenerator<string>} - Async generator yielding AI content chunks.
 */
export async function* generateChunkBasedStreamingTransformation(fileId, query, topN = 4) {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found.`);
    }

    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);
    const searchResults = await vectorStore.similaritySearch(query, topN);

    if (searchResults.length === 0) {
        yield "Information not found in document.";
        return;
    }

    const context = searchResults.map(doc => doc.pageContent).join('\n\n---\n\n');

    const systemPrompt = `
You are an expert AI assistant answering questions based STRICTLY on the provided "Context".
Format your answer using Markdown.
Context:
"""
${context}
"""

User's query: "${query}"
`;

    try {
        const result = await aiModel.generateContentStream(systemPrompt);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }
    } catch (error) {
        console.error('Error in streaming transformation:', error);
        throw new Error('Failed to generate streaming response.');
    }
}
