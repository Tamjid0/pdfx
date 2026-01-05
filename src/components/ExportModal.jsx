'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\ExportModal.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useStore } from '../store/useStore';



export const ExportModal = () => {
    const {
        isExportModalOpen,
        setExportModalOpen,
        exportContext
    } = useStore();

    const [isExporting, setIsExporting] = useState(false);

    if (!isExportModalOpen || !exportContext) return null;

    const { mode, data } = exportContext;

    const renderDataToHtml = (mode, data) => {
        if (mode === 'editor') return data || '';
        if (!data) return '<h1>No content available</h1>';

        try {
            switch (mode) {
                case 'summary':
                    return `
                        <h1>Executive Summary</h1>
                        <div>${data.summary || '<i>No summary content available.</i>'}</div>
                        <h2>Key Highlights</h2>
                        <ul>${(data.keyPoints && data.keyPoints.length > 0)
                            ? data.keyPoints.map((p) => `<li>${p}</li>`).join('')
                            : '<li>No key points available.</li>'}</ul>
                    `;
                case 'notes':
                    return `
                        <h1>Study Notes</h1>
                        ${(data.notes && data.notes.length > 0)
                            ? data.notes.map((s) => `
                                <h2>${s.section || 'Unstructured Section'}</h2>
                                <ul>${(s.points || []).map((p) => `<li>${p}</li>`).join('')}</ul>
                            `).join('') : '<p>No notes available.</p>'}
                    `;
                case 'insights':
                    return `
                        <h1>Core Insights</h1>
                        ${(data.insights && data.insights.length > 0)
                            ? data.insights.map((i) => `
                                <h3>${i.title || 'Untitled Insight'}</h3>
                                <p>${i.description || ''}</p>
                            `).join('') : '<p>No insights available.</p>'}
                    `;
                case 'flashcards':
                    return `
                        <h1>Flashcards</h1>
                        <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            ${(data.flashcards && data.flashcards.length > 0)
                            ? data.flashcards.map((f) => `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; width: 40%; background: #f9f9f9;">${f.front || ''}</td>
                                        <td style="border: 1px solid #ddd; padding: 12px;">${f.back || ''}</td>
                                    </tr>
                                `).join('') : '<tr><td>No flashcards available.</td></tr>'}
                        </table>
                    `;
                case 'quiz':
                    return `
                        <h1>Quiz Assessment</h1>
                        ${(data.quiz && data.quiz.length > 0)
                            ? data.quiz.map((q, idx) => `
                                <div style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                                    <p style="font-size: 1.1em;"><strong>Question ${idx + 1}: ${q.question || '...'}</strong></p>
                                    ${q.type === 'mc' ? `
                                        <ul style="list-style-type: none; padding-left: 20px;">
                                            ${(q.options || []).map((o) => `<li style="margin-bottom: 8px;">[ ] ${o.label}: ${o.value}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                    <p style="color: #666; font-size: 0.9em; margin-top: 10px;"><i>Correct Answer: ${q.correctAnswer || 'Not provided'}</i></p>
                                </div>
                            `).join('') : '<p>No quiz questions available.</p>'}
                    `;
                case 'mindmap':
                    return `
                        <h1>Mind Map Structure</h1>
                        <ul>${(data.nodes && data.nodes.length > 0)
                            ? data.nodes.map((n) => `<li>${_optionalChain([n, 'access', _ => _.data, 'optionalAccess', _2 => _2.label]) || n.id}</li>`).join('')
                            : '<li>No mind map nodes available.</li>'}</ul>
                    `;
                default:
                    return typeof data === 'string' ? data : JSON.stringify(data);
            }
        } catch (err) {
            console.error('Error rendering data to HTML:', err);
            return `<h1>Error rendering content</h1><p>${JSON.stringify(data)}</p>`;
        }
    };

    const handleExportAction = async (format) => {
        setIsExporting(true);
        try {
            const body = {
                format,
                filename: `pdfy-${mode}-${new Date().getTime()}`,
                mode,
            };

            // Ensure we have HTML for PDF/DOCX
            if (format === 'pdf' || format === 'docx') {
                body.html = wrapInStyle(renderDataToHtml(mode, data));
            } else if (format === 'csv') {
                body.data = data;
            }

            const response = await fetch('/api/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${body.filename}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setExportModalOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export document. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const wrapInStyle = (html) => {
        return `
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                        h1, h2, h3 { color: #111; }
                        .preview-list { list-style: none; padding: 0; }
                        .preview-list-item { margin-bottom: 12px; }
                        img { max-width: 100%; height: auto; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                    </style>
                </head>
                <body>${html}</body>
            </html>
        `;
    };

    const getOptions = () => {
        const options = [
            { id: 'pdf', label: 'PDF Document', icon: '📄', desc: 'High-fidelity PDF for printing', format: 'pdf' },
            { id: 'docx', label: 'Word Document', icon: '📝', desc: 'Editable Microsoft Word file', format: 'docx' },
        ];

        if (mode === 'quiz' || (mode === 'preview' && _optionalChain([exportContext, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.quiz]))) {
            options.push({ id: 'csv', label: 'CSV Spreadsheet', icon: '📊', desc: 'Results in a spreadsheet format', format: 'csv' });
        }

        return options;
    };

    return (
        React.createElement('div', { className: "fixed inset-0 z-[200] flex items-center justify-center p-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
            , React.createElement('div', {
                className: "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"    ,
                onClick: () => !isExporting && setExportModalOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
            )

            , React.createElement('div', { className: "relative w-full max-w-md bg-[#111] border border-[#333] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}
                , React.createElement('div', { className: "p-6 border-b border-[#222] bg-[#1a1a1a] flex items-center justify-between"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}
                    , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
                        , React.createElement('h2', { className: "text-xl font-bold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}, "Export Options" )
                        , React.createElement('p', { className: "text-xs text-gray-400 mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}, "Select your preferred format for "     , mode)
                    )
                    , React.createElement('button', {
                        onClick: () => setExportModalOpen(false),
                        className: "p-2 hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-colors"     ,
                        disabled: isExporting, __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}

                        , React.createElement('svg', { className: "w-6 h-6" , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}
                            , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}} )
                        )
                    )
                )

                , React.createElement('div', { className: "p-6 space-y-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}
                    , getOptions().map((opt) => (
                        React.createElement('button', {
                            key: opt.id,
                            onClick: () => handleExportAction(opt.format ),
                            disabled: isExporting,
                            className: `w-full group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'bg-[#1a1a1a] border-[#333] hover:border-[#00ff88] hover:bg-[#1a1a1a]/50'}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}

                            , React.createElement('div', { className: "w-12 h-12 flex items-center justify-center text-2xl bg-[#222] rounded-xl group-hover:bg-[#00ff88]/10 transition-colors"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}
                                , opt.icon
                            )
                            , React.createElement('div', { className: "text-left flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
                                , React.createElement('div', { className: "text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}, opt.label)
                                , React.createElement('div', { className: "text-xs text-gray-500" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}, opt.desc)
                            )
                            , React.createElement('div', { className: "opacity-0 group-hover:opacity-100 transition-opacity"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 212}}
                                , React.createElement('svg', { className: "w-5 h-5 text-[#00ff88]"  , fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
                                    , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}} )
                                )
                            )
                        )
                    ))
                )

                , isExporting && (
                    React.createElement('div', { className: "absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm z-50"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}
                        , React.createElement('div', { className: "w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-4"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 223}} )
                        , React.createElement('p', { className: "text-sm font-semibold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}, "Generating your file..."  )
                        , React.createElement('p', { className: "text-xs text-gray-400 mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}, "This may take a few seconds"     )
                    )
                )
            )
        )
    );
};
