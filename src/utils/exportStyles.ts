import { PreviewPreset } from '../store/useStore';
import { getTemplate } from '../templates';

/**
 * Utility to provide preset-specific CSS for exported PDF/HTML content.
 */
export const getExportStyles = (preset: PreviewPreset): string => {
    const template = getTemplate(preset);

    // Common global resets for PDF generation
    const baseStyles = `
        body {
            margin: 0;
            padding: 0;
            background: #fff;
        }
        * {
            box-sizing: border-box;
        }
        @media print {
            body { padding: 0; }
            .template-container { 
                padding: 40px !important; 
                min-height: auto !important;
                background: #fff !important;
            }
        }
    `;

    return `
        ${baseStyles}
        ${template.css}
    `;
};
