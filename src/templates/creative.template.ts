import { DocumentTemplate } from './types';
import { PreviewData } from '../utils/contentTransformer';

export const CreativeTemplate: DocumentTemplate = {
    id: 'creative',
    name: 'Creative',
    css: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        
        .template-container.creative {
            font-family: 'Outfit', sans-serif;
            line-height: 1.7;
            color: #0f172a;
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            max-width: 850px;
            margin: 0 auto;
            padding: 70px 60px;
            min-height: 100vh;
        }
        .creative h1 { 
            font-size: 48px; 
            margin-bottom: 32px; 
            font-weight: 900;
            background: linear-gradient(to right, #00ff88, #00cc66);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.05em;
        }
        .creative .metadata {
            display: flex;
            gap: 12px;
            margin-bottom: 50px;
        }
        .creative .metadata span {
            background: white;
            padding: 6px 16px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            color: #059669;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .creative .section {
            margin-bottom: 50px;
            position: relative;
            padding-left: 30px;
            border-left: 4px solid #00ff88;
        }
        .creative h2 { 
            font-size: 26px; 
            margin-top: 0;
            margin-bottom: 20px; 
            color: #1e293b; 
            font-weight: 800;
        }
        .creative .content {
            background: rgba(255, 255, 255, 0.5);
            padding: 20px;
            border-radius: 16px;
            backdrop-filter: blur(8px);
        }
        .creative ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .creative li {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        .creative li::before {
            content: "";
            width: 10px;
            height: 10px;
            background: #00ff88;
            border-radius: 50%;
            margin-top: 8px;
            flex-shrink: 0;
        }
        .creative .footer {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
        }
    `,
    render: (data: PreviewData) => {
        return `
            <div class="template-container creative">
                <h1>${data.title}</h1>
                
                <div class="metadata">
                    ${data.metadata.wordCount ? `<span>${data.metadata.wordCount} words</span>` : ''}
                    ${data.metadata.readTime ? `<span>${data.metadata.readTime} min read</span>` : ''}
                    ${data.metadata.count ? `<span>${data.metadata.count} items</span>` : ''}
                </div>

                <div class="sections">
                    ${data.sections.map(section => `
                        <div class="section">
                            ${section.heading ? `<h2>${section.heading}</h2>` : ''}
                            <div class="content">
                                ${section.type === 'list'
                ? `<ul>${section.content.split('\n').filter(Boolean).map(item => `<li>${item}</li>`).join('')}</ul>`
                : `<div class="formatted-content">${section.content}</div>`
            }
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="footer">
                    <span>PDFy Creative Export</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }
};
