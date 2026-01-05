import path from 'path';
import fs from 'fs';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { hfEmbeddings } from './embeddingService.js';

const indexesDir = path.join(process.cwd(), 'src', 'database', 'indexes');

export const getVectorStore = async (fileId) => {
    const vectorStorePath = path.join(indexesDir, fileId);
    if (fs.existsSync(vectorStorePath)) {
        console.log(`[+] Loading existing vector store for fileId: ${fileId}`);
        return await FaissStore.load(vectorStorePath, hfEmbeddings);
    }
    return null;
};
