import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import User from '../src/models/User.js';
import Document from '../src/models/Document.js';

const __dirname = path.resolve();
const DB_JSON_PATH = path.join(__dirname, 'src/database/db.json');
const DOCUMENTS_DIR = path.join(__dirname, 'src/database/documents');

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        // 1. Migrate Users
        if (fs.existsSync(DB_JSON_PATH)) {
            console.log('Migrating users from db.json...');
            const dbData = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf-8'));
            if (dbData.users && Array.isArray(dbData.users)) {
                for (const userData of dbData.users) {
                    const existingUser = await User.findOne({ email: userData.email });
                    if (!existingUser) {
                        await User.create(userData);
                        console.log(`Migrated user: ${userData.email}`);
                    } else {
                        console.log(`User already exists: ${userData.email}`);
                    }
                }
            }
        }

        // 2. Migrate Documents
        if (fs.existsSync(DOCUMENTS_DIR)) {
            console.log('Migrating documents from src/database/documents/');
            const files = fs.readdirSync(DOCUMENTS_DIR).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(DOCUMENTS_DIR, file);
                const docData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                // documentId is at top level or inside metadata
                const documentId = docData.documentId || docData.id;
                if (!documentId) continue;

                const existingDoc = await Document.findOne({ documentId });
                if (!existingDoc) {
                    await Document.create(docData);
                    console.log(`Migrated document: ${documentId}`);
                } else {
                    console.log(`Document already exists: ${documentId}`);
                }
            }
        }

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
