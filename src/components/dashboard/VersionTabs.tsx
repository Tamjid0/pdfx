import React, { useState } from 'react';
import { type Revision, useStore } from '../../store/useStore';

interface VersionTabsProps {
    module: 'summary' | 'notes' | 'insights' | 'flashcards' | 'quiz' | 'mindmap';
    onRename?: (revisionId: string, newName: string) => void;
    onDelete?: (revisionId: string) => void;
}

export const VersionTabs: React.FC<VersionTabsProps> = ({
    module,
    onRename,
    onDelete
}) => {
    const {
        activeRevisionIds,
        switchRevision,
        addLocalDraft,
        getTabs,
        closeLocalDraft,
        renameLocalDraft,
        deleteRevision,
        renameRevision,
        deleteTab
    } = useStore();

    const tabs = getTabs(module);
    const activeRevisionId = activeRevisionIds[module];

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

    const handleDoubleClick = (rev: Revision<any>) => {
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

    const handleDelete = (rev: Revision<any>) => {
        setDeleteConfirm({ id: rev.id, name: rev.name || 'this version' });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteTab(module, deleteConfirm.id);
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-[#0a0a0a]/50 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        onClick={() => switchRevision(module, tab.id)}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingId(tab.id);
                            setEditName(tab.name);
                        }}
                        className={`group relative px-4 py-2 pr-8 rounded-t-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${activeRevisionId === tab.id
                            ? 'text-white bg-white/5'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                            }`}
                    >
                        {editingId === tab.id ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={(e) => {
                                    e.stopPropagation();
                                    const trimmed = editName.trim();
                                    if (trimmed && trimmed !== tab.name) {
                                        if (tab.type === 'draft') {
                                            renameLocalDraft(module, tab.id, trimmed);
                                        } else {
                                            renameRevision(module, tab.id, trimmed);
                                        }
                                    }
                                    setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') {
                                        const trimmed = editName.trim();
                                        if (trimmed && trimmed !== tab.name) {
                                            if (tab.type === 'draft') {
                                                renameLocalDraft(module, tab.id, trimmed);
                                            } else {
                                                renameRevision(module, tab.id, trimmed);
                                            }
                                        }
                                        setEditingId(null);
                                    } else if (e.key === 'Escape') {
                                        setEditingId(null);
                                    }
                                }}
                                className="bg-transparent border-b border-gemini-green outline-none w-24 text-white"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span>{tab.name || `Draft ${tabs.length - tabs.indexOf(tab)}`}</span>
                        )}

                        {/* Delete Button - All tabs are deletable */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ id: tab.id, name: tab.name || 'this version' });
                            }}
                            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md ${tab.type === 'draft' ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300'} opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center`}
                            title="Delete version"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {activeRevisionId === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gemini-green rounded-full"></div>
                        )}
                    </div>
                ))}

                {/* New Tab Button */}
                <button
                    onClick={() => addLocalDraft(module)}
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirm(null)}></div>
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Delete Version?</h3>
                                <p className="text-sm text-white/60 mt-1">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-white/80 text-sm mb-6">
                            Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirm.name}"</span>? This version will be permanently removed.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
