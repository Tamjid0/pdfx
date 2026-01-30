import { DocumentTemplate } from './types';
import { PreviewData } from '../utils/contentTransformer';

export const MinimalTemplate: DocumentTemplate = {
    id: 'minimal',
    name: 'Minimal',
    css: `
        .template-container.minimal {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #111;
            background-color: #ffffff;
            max-width: 650px;
            margin: 0 auto;
            padding: 60px 40px;
        }
        .minimal h1 { 
            font-size: 24px; 
            margin-bottom: 40px; 
            color: #000; 
            font-weight: 700;
            letter-spacing: -0.05em;
            text-transform: lowercase;
        }
        .minimal .section {
            margin-bottom: 30px;
        }
        .minimal h2 { 
            font-size: 18px; 
            margin-top: 0;
            margin-bottom: 12px; 
            color: #666; 
            font-weight: 500;
        }
        .minimal .content { 
            font-size: 15px;
        }
        .minimal ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .minimal li {
            margin-bottom: 10px;
            display: flex;
            gap: 12px;
        }
        .minimal li::before {
            content: "—";
            color: #ccc;
        }
    `,
    render: (data: PreviewData) => {
        return `
            <div class="template-container minimal">
                <h1>${data.title}</h1>
                
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
            </div>
        `;
    }
};
