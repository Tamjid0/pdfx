import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

interface GenerationScopeSelectorProps {
    className?: string;
}

const GenerationScopeSelector: React.FC<GenerationScopeSelectorProps> = ({ className = '' }) => {
    const {
        generationScope,
        setGenerationScope,
        topics,
        stats,
        isAppendMode,
        setIsAppendMode
    } = useStore();

    const [pageRange, setPageRange] = useState({
        start: 1,
        end: stats.pageCount || 1
    });

    useEffect(() => {
        setPageRange({ start: 1, end: stats.pageCount || 1 });
    }, [stats.pageCount]);

    const scopeTypes = [
        { id: 'all', label: 'Entire File', icon: '📄', description: 'Analyze the complete document' },
        { id: 'pages', label: 'Page Range', icon: '🔢', description: 'Select specific pages to process' },
        { id: 'topics', label: 'Topic Wise', icon: '🎯', description: 'Select detected semantic topics' }
    ];

    const handleTypeChange = (type: 'all' | 'pages' | 'topics') => {
        if (type === 'all') {
            setGenerationScope({ type: 'all', value: null });
        } else if (type === 'pages') {
            setGenerationScope({ type: 'pages', value: [pageRange.start, pageRange.end] });
        } else if (type === 'topics') {
            setGenerationScope({ type: 'topics', value: [] }); // Start with empty selection
        }
    };

    const handlePageChange = (start: number, end: number) => {
        setPageRange({ start, end });
        setGenerationScope({ type: 'pages', value: [start, end] });
    };

    const toggleTopic = (topicId: string) => {
        const currentValue = (generationScope.type === 'topics' && Array.isArray(generationScope.value))
            ? (generationScope.value as string[])
            : [];

        const newValue = currentValue.includes(topicId)
            ? currentValue.filter(id => id !== topicId)
            : [...currentValue, topicId];

        setGenerationScope({ type: 'topics', value: newValue });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="grid grid-cols-3 gap-2">
                {scopeTypes.map((scope) => (
                    <button
                        key={scope.id}
                        onClick={() => handleTypeChange(scope.id as any)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${generationScope.type === scope.id
                            ? 'bg-gemini-green/10 border-gemini-green shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                    >
                        <span className="text-xl">{scope.icon}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${generationScope.type === scope.id ? 'text-gemini-green' : 'text-white/60'
                            }`}>
                            {scope.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {generationScope.type === 'all' && (
                    <p className="text-[11px] text-gemini-gray leading-relaxed text-center px-4">
                        We'll analyze the complete <strong>{stats.wordCount} words</strong> across <strong>{stats.pageCount} pages</strong> for a comprehensive output.
                    </p>
                )}

                {generationScope.type === 'pages' && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Select Pages</span>
                            <span className="text-[10px] font-black text-gemini-green uppercase">{pageRange.start} - {pageRange.end}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max={stats.pageCount || 1}
                                value={pageRange.start}
                                onChange={(e) => handlePageChange(parseInt(e.target.value), Math.max(parseInt(e.target.value), pageRange.end))}
                                className="flex-1 accent-gemini-green h-1 rounded-full appearance-none bg-white/10"
                            />
                            <input
                                type="range"
                                min="1"
                                max={stats.pageCount || 1}
                                value={pageRange.end}
                                onChange={(e) => handlePageChange(Math.min(parseInt(e.target.value), pageRange.start), parseInt(e.target.value))}
                                className="flex-1 accent-gemini-green h-1 rounded-full appearance-none bg-white/10"
                            />
                        </div>
                    </div>
                )}

                {generationScope.type === 'topics' && (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
                        {topics && topics.length > 0 ? (
                            topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => toggleTopic(topic.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${(generationScope.type === 'topics' && Array.isArray(generationScope.value) && (generationScope.value as string[]).includes(topic.id))
                                        ? 'bg-gemini-green/10 border-gemini-green/30 text-white'
                                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className="text-[11px] font-bold line-clamp-1 text-left">{topic.title}</span>
                                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">Page {topic.startPage + 1}</span>
                                    </div>
                                    {(generationScope.type === 'topics' && Array.isArray(generationScope.value) && (generationScope.value as string[]).includes(topic.id)) && (
                                        <div className="w-2 h-2 rounded-full bg-gemini-green shadow-[0_0_8px_rgba(0,255,136,1)]"></div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">No Topics Detected</p>
                                <p className="text-[9px] text-white/20 mt-1 uppercase tracking-widest leading-relaxed">Try re-processing the file with better structure</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                        onClick={() => setIsAppendMode(!isAppendMode)}
                        className={`w-10 h-5 rounded-full transition-all duration-300 relative ${isAppendMode ? 'bg-gemini-green' : 'bg-white/10'
                            }`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isAppendMode ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">Append to existing</span>
                        <span className="text-[8px] text-white/20 uppercase tracking-tighter">Merge new analysis without losing old data</span>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default GenerationScopeSelector;
