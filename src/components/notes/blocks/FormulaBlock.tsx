import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface FormulaItem {
    formula: string;
    label?: string;
    explanation?: string;
}

interface FormulaBlockProps {
    title?: string;
    items: FormulaItem[];
    icon?: string;
}

const FormulaDisplay: React.FC<{ formula: string }> = ({ formula }) => {
    let html = '';
    try {
        html = katex.renderToString(formula, { throwOnError: false, displayMode: true });
    } catch (e) {
        html = formula;
    }
    return (
        <div
            className="bg-[#050505] p-[20px] rounded-[15px] my-[15px] text-center border border-white/5 overflow-x-auto text-[1.2em] text-white shadow-inner"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export const FormulaBlock: React.FC<FormulaBlockProps> = ({
    title = "Important Formulas",
    items,
    icon = "∑"
}) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-[30px] rounded-[20px] p-[25px] bg-[#111] border border-[#00ff88]/10 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00ff88] opacity-50"></div>

            <div className="flex items-center mb-[20px] gap-[10px]">
                <div className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em]">{title}</div>
            </div>

            <div className="grid gap-6">
                {items.map((item, i) => (
                    <div key={i} className="relative">
                        {item.label && <h3 className="text-sm font-bold text-white mb-2 ml-1">{item.label}</h3>}
                        <FormulaDisplay formula={item.formula || ''} />
                        {item.explanation && <p className="text-gray-500 text-xs italic ml-1 border-l-2 border-[#00ff88]/20 pl-3">{item.explanation}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};
