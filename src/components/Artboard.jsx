'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Artboard.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React from 'react';









const Artboard = ({ htmlContent, isLoading, activeNotesToggles, activeInsightsToggles, onExport }) => {

  const generateDynamicStyles = () => {
    let styles = `
      .tool-highlight { background-color: transparent; }
      .tool-markdown { /* default markdown styles */ }
      .tool-auto-outline { /* default outline styles */ }
      .tool-comments { /* default comment styles */ }
      .tool-tagging { /* default tagging styles */ }
      .tool-aiSummary { /* default aiSummary styles */ }
      .tool-versioning { /* default versioning styles */ }

      .tool-key-entities { /* default key-entities styles */ }
      .tool-topics { /* default topics styles */ }
      .tool-keywords { /* default keywords styles */ }
      .tool-questions { /* default questions styles */ }
      .tool-action-items { /* default action-items styles */ }
      .tool-dates-events { /* default dates-events styles */ }
    `;

    // Notes toggles
    if (_optionalChain([activeNotesToggles, 'optionalAccess', _ => _.highlight])) {
      styles += `.tool-highlight { background-color: #ffeb3b; }`; // Yellow highlight
    }
    // Add more styles for other notes toggles
    if (_optionalChain([activeNotesToggles, 'optionalAccess', _2 => _2.markdown])) {
      styles += `.tool-markdown { /* Add visible markdown styles */ }`;
    }
    if (_optionalChain([activeNotesToggles, 'optionalAccess', _3 => _3.comments])) {
      styles += `.tool-comments { border-bottom: 2px dotted blue; cursor: help; }`; // Example
    }
    // ... other notes toggles

    // Insights toggles
    if (_optionalChain([activeInsightsToggles, 'optionalAccess', _4 => _4['key-entities']])) {
      styles += `.tool-key-entities { border-bottom: 1px solid red; font-weight: bold; }`;
    }
    // ... other insights toggles

    return styles;
  };

  const iframeContent = `
    <html>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <style>
          body { margin: 0; font-family: sans-serif; }
          .artboard-content-wrapper { padding: 48px; }
          ${generateDynamicStyles()}
        </style>
      </head>
      <body>
        <div id="content-wrapper" class="artboard-content-wrapper">
          ${htmlContent || ''}
        </div>
      </body>
    </html>
  `;

  return (
    React.createElement('div', { className: "artboard bg-slate-100 w-full h-full rounded-lg shadow-xl text-black  overflow-y-auto text-base leading-relaxed border border-slate-200 relative"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
      , isLoading && (
        React.createElement('div', { className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}}
          , React.createElement('div', { className: "animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gemini-green"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}})
        )
      )

      , onExport && htmlContent && (
        React.createElement('button', {
          onClick: onExport,
          className: "absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-white hover:border-gemini-green hover:text-gemini-green transition-all shadow-sm"                     ,
          title: "Export Artboard as PDF"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}

          , React.createElement('svg', { className: "w-4 h-4" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
            , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}} )
          ), "Export"

        )
      )

      , htmlContent ? (
        React.createElement('iframe', {
          key: htmlContent, // Key to force re-render on content change
          srcDoc: iframeContent,
          sandbox: "allow-scripts", // Keep allow-scripts if MathJax or other scripts are needed
          className: "w-full h-full border-none bg-slate-100"   ,
          title: "Live Preview" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
        )
      ) : (
        React.createElement('div', { className: "flex items-center justify-center h-full text-gray-400 text-sm text-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, "No content to display"

        )
      )
    )
  );
};
export default Artboard;

