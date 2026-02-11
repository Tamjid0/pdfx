import { DocumentTemplate } from './types';
import { PreviewData } from '../utils/contentTransformer';

export const PresentationTemplate: DocumentTemplate = {
    id: 'presentation',
    name: 'Presentation Note',
    css: `
        .template-container.presentation {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #fff;
            color: #111;
            line-height: 1.6;
            padding: 50px 70px;
            max-width: 900px;
            margin: 0 auto;
        }

        .document-header {
            text-align: left;
            margin-bottom: 50px;
            border-bottom: 2px solid #111;
            padding-bottom: 30px;
        }

        .document-header h1 {
            font-size: 32px;
            font-weight: 800;
            margin: 0 0 10px 0;
            color: #000;
            letter-spacing: -0.02em;
        }

        .document-header .subtitle {
            font-size: 20px;
            color: #555;
            font-weight: 500;
        }

        .meta-info {
            font-size: 13px;
            margin-top: 20px;
            color: #777;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .slide-section {
            margin-bottom: 60px;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            overflow: hidden;
            background: #fafafa;
        }

        .slide-header {
            padding: 24px 30px;
            background: #111;
            color: #fff;
        }

        .slide-number {
            font-size: 12px;
            font-weight: 700;
            opacity: 0.7;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .slide-title {
            font-size: 22px;
            font-weight: 700;
        }

        .slide-body {
            padding: 35px;
        }

        .zone-block {
            margin-bottom: 40px;
        }

        .zone-block:last-child {
            margin-bottom: 0;
        }

        .zone-label {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #666;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .zone-label::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #e0e0e0;
        }

        .zone-content {
            font-size: 17px;
            color: #222;
        }

        .zone-content p {
            margin: 0 0 15px 0;
            white-space: pre-wrap;
        }

        .zone-content ul {
            margin: 0;
            padding-left: 25px;
            list-style: none;
        }

        .zone-content li {
            position: relative;
            margin-bottom: 12px;
        }

        .zone-content li::before {
            content: "●";
            position: absolute;
            left: -20px;
            color: #888;
            font-size: 14px;
            top: 1px;
        }

        .timer {
            display: inline-block;
            background: #f0f0f0;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            color: #444;
            margin-top: 10px;
        }

        .subsection {
            margin-top: 18px;
            padding: 20px;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }

        .subsection-title {
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 8px;
            color: #111;
        }

        .subsection-content {
            font-size: 15px;
            color: #333;
            line-height: 1.6;
        }

        .footer {
            margin-top: 80px;
            padding-top: 30px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 11px;
            color: #aaa;
        }

        @media print {
            .template-container.presentation {
                padding: 0;
            }
            .slide-section {
                break-inside: avoid;
                border: 2px solid #000;
            }
            .slide-header {
                background: #000 !important;
                -webkit-print-color-adjust: exact;
            }
        }
    `,
    render: (data: PreviewData) => {
        // Defensive check for presentation data
        const pd = (data as any).presentationData || (data as any).content || data;
        // Even deeper check: AI might slightly vary the structure
        const slides = pd.slides || pd.content?.slides || (data as any).slides || [];

        if (slides.length === 0) {
            // Fallback to regular sections if slides are missing
            if (data.sections && data.sections.length > 0) {
                return `
                    <div class="template-container presentation">
                        <div class="document-header">
                            <h1>${data.title}</h1>
                        </div>
                        <div class="sections">
                            ${data.sections.map(section => `
                                <div class="slide-section">
                                    <div class="slide-header">
                                        <div class="slide-title">${section.heading || 'Section'}</div>
                                    </div>
                                    <div class="zone-block">
                                        <div class="zone-block-content">
                                            <p>${section.content}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            return `<div class="presentation" style="padding: 40px; text-align: center;">No slide content found for this presentation.</div>`;
        }

        return `
            <div class="template-container presentation">
                <div class="document-header">
                    <h1>${pd.title || data.title}</h1>
                    ${pd.subtitle ? `<div class="subtitle">${pd.subtitle}</div>` : ''}
                    <div class="meta-info">
                        Total Slides: ${slides.length} | Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                ${slides.map((slide: any, index: number) => `
                    <div class="slide-section">
                        <div class="slide-header">
                            <div class="slide-number">Slide ${index + 1} of ${slides.length}</div>
                            <div class="slide-title">${slide.title || 'Untitled Slide'}</div>
                        </div>
                        <div class="slide-body">
                            ${slide.script ? `
                            <div class="zone-block">
                                <div class="zone-label">Speech Script</div>
                                <div class="zone-content">
                                    <p>${slide.script}</p>
                                    ${slide.timing ? `<span class="timer">⏱ ${slide.timing}</span>` : ''}
                                </div>
                            </div>
                            ` : ''}

                            ${slide.delivery && slide.delivery.length > 0 ? `
                            <div class="zone-block">
                                <div class="zone-label">Delivery Notes</div>
                                <div class="zone-content">
                                    <ul>
                                        ${slide.delivery.map((item: string) => `<li>${item}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                            ` : ''}

                            ${slide.deep_dive && slide.deep_dive.length > 0 ? `
                            <div class="zone-block">
                                <div class="zone-label">Background & Deep Dive</div>
                                <div class="zone-content">
                                    ${slide.deep_dive.map((item: any) => `
                                        <div class="subsection">
                                            <div class="subsection-title">${item.title || item.question || item.heading || 'Reference'}</div>
                                            <div class="subsection-content">
                                                ${item.content || item.answer || item.description || ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ${index < slides.length - 1 ? '<div class="page-break"></div>' : ''}
                `).join('')}

                <div class="footer">
                    <p><strong>${pd.title || data.title} - Presentation Notes</strong></p>
                    <p>Exported: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        `;
    }
};
