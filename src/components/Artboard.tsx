import React from 'react';
import { marked } from 'marked';

interface ArtboardProps {
    htmlContent: string | null;
    isLoading: boolean;
    activeNotesToggles?: { [key: string]: boolean };
    activeInsightsToggles?: { [key: string]: boolean };
    onExport?: () => void;
}

const Artboard: React.FC<ArtboardProps> = ({ htmlContent, isLoading, activeNotesToggles, activeInsightsToggles, onExport }) => {

    const getParsedContent = () => {
        if (!htmlContent) return '';
        try {
            // Use marked to parse the content. marked is robust and handles 
            // mixed HTML and Markdown. This is safer than custom extraction.
            return marked.parse(htmlContent) as string;
        } catch (error) {
            console.error("Error parsing content in Artboard:", error);
            return htmlContent;
        }
    };

    const generateDynamicStyles = () => {
        let styles = `
          :root {
            --primary-green: #00ff88;
            --text-dark: #1e293b;
            --text-muted: #64748b;
          }
          body { 
            margin: 0; 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: var(--text-dark);
            line-height: 1.6;
            background-color: transparent;
          }
          .artboard-content-wrapper { 
            padding: 60px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #0f172a;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 700;
          }
          h1 { font-size: 2.25rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; margin-top: 0; }
          h2 { font-size: 1.5rem; margin-top: 1.25em; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.2em; }
          h3 { font-size: 1.25rem; }
          p { margin-bottom: 1.25em; }
          ul, ol { margin-bottom: 1.25em; padding-left: 1.5em; }
          li { margin-bottom: 0.5em; }
          strong { color: #000; font-weight: 600; }
          blockquote {
            border-left: 4px solid var(--primary-green);
            background: #f8fafc;
            margin: 0 0 1.5em 0;
            padding: 1em 1.5em;
            font-style: italic;
            border-radius: 0 4px 4px 0;
          }
          code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            background-color: #f1f5f9;
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 0.9em;
          }
          pre {
            background-color: #1e293b;
            color: #f8fafc;
            padding: 1.5em;
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: 1.5em;
          }
          pre code {
            background-color: transparent;
            padding: 0;
            color: inherit;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.5em;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 0.75em;
            text-align: left;
          }
          th { background-color: #f8fafc; font-weight: 600; }

          ${activeNotesToggles?.highlight ? '.tool-highlight { background-color: #fef08a; padding: 0 0.1em; border-radius: 2px; }' : ''}
          ${activeInsightsToggles?.['key-entities'] ? '.tool-key-entities { border-bottom: 2px solid var(--primary-green); font-weight: 600; }' : ''}
          /* Add more visibility for other toggles as needed */
        `;
        return styles;
    };


    const parsedContent = getParsedContent();
    console.log("Artboard rendering content:", parsedContent.substring(0, 200));

    const iframeContent = `
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <style>
          ${generateDynamicStyles()}
        </style>
      </head>
      <body>
        <div id="content-wrapper" class="artboard-content-wrapper">
          ${parsedContent}
        </div>
      </body>
    </html>
  `;

    return (
        <div className="artboard bg-slate-100 w-full h-full rounded-lg shadow-xl text-black  overflow-y-auto text-base leading-relaxed border border-slate-200 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gemini-green"></div>
                </div>
            )}

            {onExport && htmlContent && (
                <button
                    onClick={onExport}
                    className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-white hover:border-gemini-green hover:text-gemini-green transition-all shadow-sm"
                    title="Export Artboard as PDF"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                </button>
            )}

            {htmlContent ? (
                <iframe
                    key={htmlContent} // Key to force re-render on content change
                    srcDoc={iframeContent}
                    sandbox="allow-scripts" // Keep allow-scripts if MathJax or other scripts are needed
                    className="w-full h-full border-none bg-slate-100"
                    title="Live Preview"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center">
                    No content to display
                </div>
            )}
        </div>
    );
};
export default Artboard;
