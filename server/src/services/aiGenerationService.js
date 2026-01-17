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

const REPLY_PROFILES = {
    default: {
        name: "Research Assistant",
        instructions: "Generate a balanced, structured response using markdown. Mix text and lists naturally.",
        allowedBlocks: ["text", "list", "table", "insight"]
    },
    educational: {
        name: "Academic Tutor",
        instructions: "Deeply explain concepts. Prioritize Step-by-Step guides and Q&A pairs for clarity.",
        allowedBlocks: ["text", "steps", "qa", "list", "insight"]
    },
    data_analyst: {
        name: "Data Analyst",
        instructions: "Focus on facts, comparisons, and technical details. Use tables and code blocks extensively.",
        allowedBlocks: ["text", "table", "code", "list"]
    },
    executive: {
        name: "Executive Brief",
        instructions: "High-level summary. Focus on key insights and bullet points. Avoid long paragraphs.",
        allowedBlocks: ["insight", "list", "text", "table"]
    }
};

/**
 * Performs chunk-based RAG generation using a FAISS vector index.
 */
export async function generateChunkBasedTransformation(fileId, query, topN = 8, citationMode = true, replyProfile = 'default') {
    const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');
    const indexPath = path.join(indexesDir, fileId);

    if (!fs.existsSync(indexPath)) {
        throw new Error(`FAISS index for fileId '${fileId}' not found.`);
    }

    const vectorStore = await FaissStore.load(indexPath, hfEmbeddings);
    const searchResults = await vectorStore.similaritySearch(query, topN);

    if (searchResults.length === 0) {
        return "Information not found in document.";
    }

    const profile = REPLY_PROFILES[replyProfile] || REPLY_PROFILES.default;

    const context = searchResults.map((doc) => {
        const meta = doc.metadata || {};
        const displayIndex = (meta.pageIndex !== undefined) ? meta.pageIndex + 1 : 'Unknown';
        const type = meta.pageType || 'Page';
        return `[Source: ${type} ${displayIndex}]\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    const citationRules = citationMode ? `
SEAMLESS INLINE CITATIONS:
- Wrap essential phrases in <cite page="X">...</cite> where X is the Source Page number.
- Integrate these citations NATIVELY into your sentence flow.
` : "DO NOT use any <cite> tags or mention page numbers.";

    const systemPrompt = `
You are an expert ${profile.name}. ${profile.instructions}

RESPONSE STRUCTURE:
You must wrap your content in the following tag-based blocks for better categorization:
- <text>...</text> for standard paragraphs.
- <list>...</list> for bulleted or numbered items.
- <table>...</table> for data grids/comparisons.
- <steps>...</steps> for sequential instructions.
- <qa>...</qa> for Question/Answer pairs.
- <insight>...</insight> for key takeaways or evaluations.
- <code>...</code> for technical snippets.

ALLOWED BLOCKS for this profile: ${profile.allowedBlocks.join(', ')}.

CRITICAL:
- ZERO REDUNDANCY: Do not repeat info.
- ${citationRules}

Context:
"""
${context}
"""

User Query: "${query}"
`;

    try {
        const result = await aiModel.generateContent(systemPrompt);
        return result?.response?.text()?.trim() || "No content generated.";
    } catch (error) {
        console.error('Error in transformation:', error);
        throw new Error('Failed to generate response.');
    }
}

/**
 * Performs periodic RAG streaming generation using a FAISS vector index.
 */
export async function* generateChunkBasedStreamingTransformation(fileId, query, topN = 8, citationMode = true, replyProfile = 'default') {
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

    const profile = REPLY_PROFILES[replyProfile] || REPLY_PROFILES.default;

    const context = searchResults.map((doc) => {
        const meta = doc.metadata || {};
        const displayIndex = (meta.pageIndex !== undefined) ? meta.pageIndex + 1 : 'Unknown';
        const type = meta.pageType || 'Page';
        return `[Source: ${type} ${displayIndex}]\n${doc.pageContent}`;
    }).join('\n\n---\n\n');

    const citationRules = citationMode ? `
SEAMLESS INLINE CITATIONS:
- Wrap essential phrases in <cite page="X">...</cite> where X is the Source Page number.
- Integrate these citations NATIVELY into your sentence flow.
` : "DO NOT use any <cite> tags or mention page numbers.";

    const systemPrompt = `
You are an expert ${profile.name}. ${profile.instructions}

RESPONSE STRUCTURE:
You must wrap your content in the following tag-based blocks for better categorization:
- <text>...</text> for standard paragraphs.
- <list>...</list> for bulleted or numbered items.
- <table>...</table> for data grids/comparisons.
- <steps>...</steps> for sequential instructions.
- <qa>...</qa> for Question/Answer pairs.
- <insight>...</insight> for key takeaways or evaluations.
- <code>...</code> for technical snippets.

ALLOWED BLOCKS for this profile: ${profile.allowedBlocks.join(', ')}.

CRITICAL:
- ZERO REDUNDANCY: Do not repeat info.
- ${citationRules}

Context:
"""
${context}
"""

User Query: "${query}"
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
