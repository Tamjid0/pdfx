import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface ExampleBlockProps {
    title?: string;
    content?: string;
    items?: {
        problem: string;
        solution: string;
        answer: string;
        note?: string;
    }[];
    icon?: string;
}

const FormulaDisplay: React.FC<{ text: string }> = ({ text }) => {
    const isFormula = (line: string) => line.includes('=') || line.match(/[\d\w\s]+[\+\-\*\/][\d\w\s]+/);

    if (isFormula(text)) {
        try {
            const html = katex.renderToString(text, { throwOnError: false, displayMode: true });
            return <div className="text-center my-2 text-lg text-[#00ff88]" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (e) {
            return <p>{text}</p>;
        }
    }
    return <p>{text}</p>
};


export const ExampleBlock: React.FC<ExampleBlockProps> = ({
    title = "Example Problem",
    content,
    items,
    icon = "📝"
}) => {
    const examples = items || (content ? [{ problem: "Example", solution: content, answer: "", note: "" }] : []);

    if (examples.length === 0) return null;

    return (
        <div className="mb-[30px] rounded-[20px] p-[25px] bg-[#0c0c0c] border border-blue-500/20 animate-in fade-in slide-in-from-bottom-4 group">
            <div className="flex items-center mb-[20px] gap-[10px]">
                <div className="text-[1.2rem] w-[36px] h-[36px] flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                    {icon}
                </div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{title}</div>
            </div>

            <div className="space-y-6">
                {examples.map((ex, i) => (
                    <div key={i} className="bg-[#111] p-[25px] rounded-[15px] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                        <p className="mb-4 text-white text-sm">
                            <strong className="text-blue-400 block text-xs uppercase tracking-wider mb-2">Problem</strong>
                            {ex.problem}
                        </p>

                        <div className="mb-6 pl-4 border-l-2 border-white/10">
                            <strong className="text-gray-500 text-[10px] uppercase tracking-wider block mb-2">Solution Process</strong>
                            <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                    p: ({ node, ...props }) => <div className="my-2" {...props} />
                                }}>
                                    {ex.solution}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {ex.answer && (
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 inline-block">
                                <span className="text-[10px] font-black text-blue-400 uppercase mr-3">Final Answer</span>
                                <span className="text-white font-bold font-mono">{ex.answer}</span>
                            </div>
                        )}

                        {ex.note && (
                            <div className="mt-4 flex gap-2 items-start text-xs text-gray-500 italic">
                                <span>📌</span>
                                <div>{ex.note}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
