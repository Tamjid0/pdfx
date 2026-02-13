import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, system-ui, sans-serif',
            themeVariables: {
                primaryColor: '#00ff88',
                primaryTextColor: '#fff',
                primaryBorderColor: '#00ff88',
                lineColor: '#666',
                secondaryColor: '#1a1a1a',
                tertiaryColor: '#0b0b0b'
            }
        });
    }, []);

    useEffect(() => {
        if (ref.current && chart) {
            ref.current.removeAttribute('data-processed');
            mermaid.contentLoaded();
        }
    }, [chart]);

    return (
        <div className="mermaid-container my-6 p-4 bg-[#0a0a0a] rounded-xl border border-[#333] overflow-x-auto">
            <div ref={ref} className="mermaid flex justify-center">
                {chart}
            </div>
        </div>
    );
};

export default Mermaid;
