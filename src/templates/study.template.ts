import { DocumentTemplate } from './types';
import { PreviewData } from '../utils/contentTransformer';

export const StudyTemplate: DocumentTemplate = {
    id: 'study',
    name: 'Study Note',
    css: `
        .template-container.study {
            font-family: 'Times New Roman', Georgia, serif;
            background: #fff;
            color: #000;
            line-height: 1.8;
            padding: 0;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.05);
        }

        /* Header & Info Section */
        .study-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 60px;
            text-align: center;
        }

        .study-header h1 {
            font-size: 2.8em;
            margin: 0 0 10px 0;
            font-weight: bold;
            line-height: 1.2;
        }

        .study-header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            font-style: italic;
        }

        .document-info {
            background: #f8f9fa;
            padding: 25px 60px;
            border-bottom: 3px solid #667eea;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            font-size: 0.9em;
        }

        .info-item .label {
            font-weight: bold;
            color: #667eea;
            display: block;
            margin-bottom: 2px;
            text-transform: uppercase;
            font-size: 0.8em;
            letter-spacing: 0.05em;
        }

        /* Table of Contents */
        .toc-section {
            padding: 40px 60px;
            background: #fff;
            border-bottom: 1px solid #eee;
        }

        .toc-section h2 {
            font-size: 1.5em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
            margin-bottom: 15px;
            color: #2c3e50;
        }

        .toc-list {
            list-style: none;
            padding: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .toc-item {
            font-size: 0.95em;
            color: #444;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .toc-number {
            font-weight: bold;
            color: #667eea;
            min-width: 20px;
        }

        /* Content Sections */
        .content-body {
            padding: 40px 60px;
        }

        .section {
            margin-bottom: 50px;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
        }

        .section-number {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9em;
        }

        .section-title {
            font-size: 1.6em;
            color: #2c3e50;
            font-weight: bold;
            margin: 0;
        }

        /* Specialized Professional Blocks */
        .info-block {
            background: #e3f2fd;
            border-left: 5px solid #2196f3;
            padding: 20px;
            margin: 25px 0;
            font-style: italic;
        }

        .important-block {
            background: #fff3e0;
            border-left: 5px solid #ff9800;
            padding: 20px;
            margin: 25px 0;
        }

        .note-block {
            background: #f3e5f5;
            border-left: 5px solid #9c27b0;
            padding: 20px;
            margin: 25px 0;
        }

        .example-block {
            background: #e8f5e9;
            border-left: 5px solid #4caf50;
            padding: 20px;
            margin: 25px 0;
        }

        .block-title {
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 8px;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Formula & Calculation Box */
        .formula-box {
            background: #f8f9fa;
            border: 2px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 1.4em;
            font-weight: bold;
        }

        .formula-label {
            display: block;
            font-size: 0.7em;
            color: #7f8c8d;
            font-family: 'Times New Roman', serif;
            margin-top: 10px;
            font-style: italic;
            font-weight: normal;
        }

        .calculation-box {
            border: 1px solid #ddd;
            padding: 20px;
            margin: 25px 0;
            background: #fff;
        }

        .calc-step {
            margin-bottom: 12px;
        }

        .calc-label {
            font-weight: bold;
            color: #667eea;
            font-size: 0.9em;
            display: block;
        }

        /* Keywords / Tags */
        .keywords-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 20px 0;
        }

        .keyword-tag {
            background: #ecf0f1;
            padding: 6px 14px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.85em;
            border: 1px solid #bdc3c7;
            color: #2c3e50;
        }

        /* Tables */
        .academic-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
        }

        .academic-table th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            border: 1px solid #555;
        }

        .academic-table td {
            padding: 12px;
            border: 1px solid #ddd;
        }

        .academic-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        /* Footer */
        .study-footer {
            background: #2c3e50;
            color: white;
            padding: 40px;
            text-align: center;
            font-size: 0.9em;
        }

        @media print {
            .template-container.study { box-shadow: none; max-width: 100%; }
            .study-header { -webkit-print-color-adjust: exact; }
            .section { page-break-inside: avoid; }
            .formula-box { border: 1px solid #000; }
        }
    `,
    render: (data: PreviewData) => {
        const blocks = data.adaptiveData || [];

        // Dynamic Title Generation for TOC and Header
        const docTitle = data.title || 'Study Material';
        const docDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const renderBlock = (block: any, index: number) => {
            const type = block.type || 'text';
            const title = block.title || '';

            switch (type) {
                case 'summary':
                    return `
                        <div class="info-block">
                            <div class="block-title">💡 Summary</div>
                            <p>${block.content || ''}</p>
                        </div>
                    `;
                case 'text':
                case 'explanation':
                    return `
                        <div class="section">
                            <div class="section-header">
                                <span class="section-number">${index + 1}</span>
                                <h2 class="section-title">${title || 'Core Concept'}</h2>
                            </div>
                            <div class="section-content">
                                <p>${block.content || ''}</p>
                            </div>
                        </div>
                    `;
                case 'keywords':
                    return `
                        <div class="note-block">
                            <div class="block-title">📌 Key Terms</div>
                            <div class="keywords-container">
                                ${(block.items || []).map((item: string) => `<span class="keyword-tag">${item}</span>`).join('')}
                            </div>
                        </div>
                    `;
                case 'definitions':
                    return `
                        <div class="section">
                            <div class="section-header">
                                <span class="section-number">${index + 1}</span>
                                <h2 class="section-title">${title || 'Terminology'}</h2>
                            </div>
                            <table class="academic-table">
                                <thead>
                                    <tr><th>Term</th><th>Definition</th></tr>
                                </thead>
                                <tbody>
                                    ${(block.items || []).map((item: any) => `
                                        <tr><td><strong>${item.term}</strong></td><td>${item.definition}</td></tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                case 'formulas':
                    return `
                        <div class="section">
                             <div class="section-header">
                                <span class="section-number">${index + 1}</span>
                                <h2 class="section-title">${title || 'Important Formulas'}</h2>
                            </div>
                            ${(block.items || []).map((item: any) => `
                                <div class="formula-box">
                                    ${item.formula}
                                    <span class="formula-label">${item.label || item.explanation || 'Principal Formula'}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                case 'examples':
                    return `
                        <div class="section">
                            <div class="section-header">
                                <span class="section-number">${index + 1}</span>
                                <h2 class="section-title">${title || 'Case studies & Examples'}</h2>
                            </div>
                            ${(block.items || []).map((item: any) => `
                                <div class="example-block">
                                    <div class="calculation-box">
                                        <div class="calc-step"><span class="calc-label">Scenario/Problem:</span> ${item.problem}</div>
                                        <div class="calc-step" style="border-top: 1px dotted #ccc; padding-top: 10px; margin-top: 15px;">
                                            <span class="calc-label" style="color: #4caf50;">Solution / Outcome:</span> ${item.solution}
                                        </div>
                                        ${item.answer ? `<div class="calc-step" style="background: #fffde7; padding: 10px; border-radius: 4px;"><strong>Final Result:</strong> ${item.answer}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                case 'quiz':
                    return `
                        <div class="section" style="background: #fafafa; padding: 30px; border: 1px solid #eee; border-radius: 8px;">
                            <div class="section-header">
                                <span class="section-number">${index + 1}</span>
                                <h2 class="section-title">${title || 'Knowledge Check'}</h2>
                            </div>
                            ${(block.items || []).map((item: any, idx: number) => `
                                <div style="margin-bottom: 20px;">
                                    <p><strong>Q${idx + 1}:</strong> ${item.question}</p>
                                    <div style="margin-top: 10px; color: #667eea; font-style: italic; font-size: 0.9em;">
                                        Answer: ${item.answer}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                default:
                    return `
                        <div class="section">
                            <div class="section-header">
                                <span class="section-number">${index + 1}</span>
                                <h2 class="section-title">${title || 'Information Block'}</h2>
                            </div>
                            <p>${block.content || ''}</p>
                        </div>
                    `;
            }
        };

        return `
            <div class="template-container study">
                <!-- Header -->
                <div class="study-header">
                    <h1>${docTitle}</h1>
                    <div class="subtitle">Comprehensive Educational Resource</div>
                </div>

                <!-- Document Info Grid -->
                <div class="document-info">
                    <div class="info-grid">
                        <div class="info-item"><span class="label">Date:</span> ${docDate}</div>
                        <div class="info-item"><span class="label">Level:</span> Advanced</div>
                        <div class="info-item"><span class="label">Source:</span> pdfx Synthesis</div>
                        <div class="info-item"><span class="label">Doc Type:</span> Study Notes</div>
                        <div class="info-item"><span class="label">Subject:</span> ${data.metadata.topics?.[0] || 'General Studies'}</div>
                        <div class="info-item"><span class="label">Blocks:</span> ${blocks.length} sections</div>
                    </div>
                </div>

                <!-- Table of Contents -->
                ${blocks.length > 0 ? `
                <div class="toc-section">
                    <h2>📑 Table of Contents</h2>
                    <div class="toc-list">
                        ${blocks.map((b: any, i: number) => `
                            <div class="toc-item">
                                <span class="toc-number">${i + 1}.</span>
                                <span>${b.title || b.type.charAt(0).toUpperCase() + b.type.slice(1)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Main Content -->
                <div class="content-body">
                    ${blocks.length > 0
                ? blocks.map((block: any, i: number) => renderBlock(block, i)).join('')
                : data.sections.map((section, i) => `
                            <div class="section">
                                <div class="section-header">
                                    <span class="section-number">${i + 1}</span>
                                    <h2 class="section-title">${section.heading || 'Section'}</h2>
                                </div>
                                <div class="section-content">
                                    <p>${section.content}</p>
                                </div>
                            </div>
                        `).join('')
            }
                </div>

                <!-- Footer -->
                <div class="study-footer">
                    <div><strong>${docTitle}</strong></div>
                    <div style="opacity: 0.7; margin-top: 10px; font-size: 0.8em;">
                        Synthesized by pdfx AI • Professional Study Resource • ${new Date().getFullYear()}
                    </div>
                </div>
            </div>
        `;
    }
};
