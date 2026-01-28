import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    documentId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true }, // Firebase UID or 'guest'
    type: { type: String, required: true },
    storage: {
        type: { type: String, enum: ['local', 'firebase'], default: 'local' },
        key: { type: String }, // Path on disk or cloud key
        bucket: { type: String }, // For cloud storage
        url: { type: String } // Public or signed URL
    },
    originalFile: {
        name: { type: String },
        mime: { type: String },
        size: { type: Number },
        processedAt: { type: Date, default: Date.now },
        path: { type: String } // Local relative path
    },
    metadata: {
        title: { type: String },
        pageCount: { type: Number },
        language: { type: String },
        author: { type: String }
    },
    // AI Generated Content (Versioned Storage)
    summaryData: {
        content: { type: mongoose.Schema.Types.Mixed, default: null },
        revisions: [{
            id: { type: String },
            name: { type: String },
            timestamp: { type: Date, default: Date.now },
            scope: { type: mongoose.Schema.Types.Mixed },
            data: { type: mongoose.Schema.Types.Mixed }
        }]
    },
    notesData: {
        content: { type: mongoose.Schema.Types.Mixed, default: null },
        revisions: [{
            id: { type: String },
            name: { type: String },
            timestamp: { type: Date, default: Date.now },
            scope: { type: mongoose.Schema.Types.Mixed },
            data: { type: mongoose.Schema.Types.Mixed }
        }]
    },
    flashcardsData: {
        content: { type: mongoose.Schema.Types.Mixed, default: null },
        revisions: [{
            id: { type: String },
            name: { type: String },
            timestamp: { type: Date, default: Date.now },
            scope: { type: mongoose.Schema.Types.Mixed },
            data: { type: mongoose.Schema.Types.Mixed }
        }]
    },
    quizData: {
        content: { type: mongoose.Schema.Types.Mixed, default: null },
        revisions: [{
            id: { type: String },
            name: { type: String },
            timestamp: { type: Date, default: Date.now },
            scope: { type: mongoose.Schema.Types.Mixed },
            data: { type: mongoose.Schema.Types.Mixed }
        }]
    },
    mindmapData: { type: mongoose.Schema.Types.Mixed, default: null },
    insightsData: {
        content: { type: mongoose.Schema.Types.Mixed, default: null },
        revisions: [{
            id: { type: String },
            name: { type: String },
            timestamp: { type: Date, default: Date.now },
            scope: { type: mongoose.Schema.Types.Mixed },
            data: { type: mongoose.Schema.Types.Mixed }
        }]
    },
    chatHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },

    structure: { type: mongoose.Schema.Types.Mixed }, // Full DocumentGraph (Nodes)
    chunks: { type: mongoose.Schema.Types.Mixed },     // Segmented text for vectoring
    extractedText: { type: String },
    convertedPdfPath: { type: String },
    isArchived: { type: Boolean, default: false },
    topics: [{
        id: { type: String },
        title: { type: String },
        startPage: { type: Number },
        endPage: { type: Number },
        nodes: [{ type: String }] // IDs of nodes in this topic
    }],
    lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
