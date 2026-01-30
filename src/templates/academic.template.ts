import { DocumentTemplate } from './types';
import { PreviewData } from '../utils/contentTransformer';

export const AcademicTemplate: DocumentTemplate = {
    id: 'academic',
    name: 'Academic',
    css: `
        .template-container.academic {
            font-family: 'Georgia', 'Times New Roman', Times, serif;
            line-height: 2.0;
            color: #1a1a1a;
            background-color: #ffffff;
            max-width: 900px;
            margin: 0 auto;
            padding: 80px 100px;
            text-align: justify;
        }
        .academic h1 { 
            font-size: 36px; 
            margin-bottom: 24px; 
            color: #000; 
            font-weight: bold;
            text-align: center;
            font-variant: small-caps;
        }
        .academic .metadata {
            text-align: center;
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 60px;
            padding-bottom: 30px;
            border-bottom: 2px solid #333;
        }
        .academic .section {
            margin-bottom: 48px;
        }
        .academic h2 { 
            font-size: 24px; 
            margin-top: 0;
            margin-bottom: 24px; 
            color: #111; 
            font-weight: bold;
            font-style: italic;
            border-bottom: 1px solid #ccc;
            padding-bottom: 8px;
            text-align: left;
        }
        .academic p { 
            margin: 0 0 20px 0; 
            text-indent: 40px;
        }
        .academic ul, .academic ol {
            margin: 0 0 24px 0;
            padding-left: 60px;
            text-align: left;
        }
        .academic li {
            margin-bottom: 12px;
        }
        .academic .footer {
            margin-top: 80px;
            padding-top: 30px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
        }
    `,
    render: (data: PreviewData) => {
        return `
            <div class="template-container academic">
                <h1>${data.title}</h1>
                
                <div class="metadata">
                    ${data.metadata.wordCount ? `<span>${data.metadata.wordCount} words</span>` : ''}
                    ${data.metadata.readTime ? `<span> • ${data.metadata.readTime} minute read</span>` : ''}
                </div>

                <div class="sections">
                    ${data.sections.map(section => `
                        <div class="section">
                            ${section.heading ? `<h2>${section.heading}</h2>` : ''}
                            <div class="content">
                                ${section.type === 'list'
                ? `<ol>${section.content.split('\n').filter(Boolean).map(item => `<li>${item}</li>`).join('')}</ol>`
                : `<div class="formatted-content">${section.content}</div>`
            }
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="footer">
                    Publication Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        `;
    }
};
