import React, { useState } from 'react';

interface VersionTabsProps {
    module: string;
    revisions: any[];
    activeRevisionId: string | null;
    onSwitch: (revisionId: string | null) => void;
    onNew: () => void;
    onRename?: (revisionId: string, newName: string) => void;
}

export const VersionTabs: React.FC<VersionTabsProps> = ({
    module,
    revisions,
    activeRevisionId,
    onSwitch,
    onNew,
    onRename
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleDoubleClick = (rev: any) => {
        if (onRename) {
            setEditingId(rev.id);
            setEditName(rev.name || '');
        }
    };

    const handleRename = (revId: string) => {
        if (onRename && editName.trim()) {
            onRename(revId, editName.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, revId: string) => {
        if (e.key === 'Enter') {
            handleRename(revId);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-[#0a0a0a]/50 overflow-x-auto no-scrollbar">
            {/* Current/Active Version Tab */}
            <button
                onClick={() => onSwitch(null)}
                className={`group relative px-4 py-2 rounded-t-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeRevisionId === null
                        ? 'text-white bg-white/5'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
            >
                <span>Current</span>
                {activeRevisionId === null && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gemini-green rounded-full"></div>
                )}
            </button>

            {/* Revision Tabs */}
            {revisions.map((rev) => (
                <button
                    key={rev.id}
                    onClick={() => onSwitch(rev.id)}
                    onDoubleClick={() => handleDoubleClick(rev)}
                    className={`group relative px-4 py-2 rounded-t-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeRevisionId === rev.id
                            ? 'text-white bg-white/5'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    {editingId === rev.id ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRename(rev.id)}
                            onKeyDown={(e) => handleKeyDown(e, rev.id)}
                            className="bg-transparent border-b border-gemini-green outline-none w-24 text-white"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span>{rev.name || `Draft ${revisions.length - revisions.indexOf(rev)}`}</span>
                    )}
                    {activeRevisionId === rev.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gemini-green rounded-full"></div>
                    )}
                </button>
            ))}

            {/* New Version Tab */}
            <button
                onClick={onNew}
                className="group relative px-4 py-2 rounded-t-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border border-dashed border-white/20 hover:border-gemini-green hover:text-gemini-green text-white/40"
            >
                <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    New
                </span>
            </button>
        </div>
    );
};
