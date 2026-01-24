'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import * as apiService from '../../services/apiService';
import Header from '../../components/Header';
import LoadingOverlay from '../../components/LoadingOverlay';

const ProjectsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const { loadProject, isLoading: storeLoading, openExportModal } = useStore();
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            loadProjects();
        }
    }, [user, authLoading]);

    const loadProjects = async () => {
        try {
            setFetching(true);
            const data = await apiService.fetchUserDocuments(user?.uid || 'guest');
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleOpenProject = async (documentId: string) => {
        await loadProject(documentId);
        router.push('/');
    };

    if (authLoading || fetching) {
        return <LoadingOverlay message="Loading your library..." />;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-gemini-green/30">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">My Library</h1>
                        <p className="text-gemini-gray text-lg">Manage your study projects and AI-powered insights.</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gemini-green text-black px-6 py-2.5 rounded-xl font-bold hover:bg-gemini-green-300 transition-all flex items-center gap-2 shadow-lg shadow-gemini-green/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-gemini-dark-200 border border-gemini-dark-500 rounded-3xl p-20 text-center flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-gemini-green/10 rounded-full flex items-center justify-center text-gemini-green">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-2 text-white/90">No projects yet</h3>
                            <p className="text-gemini-gray max-w-md mx-auto">Upload a PDF or presentation to start your AI-powered study session. Your library will appear here.</p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="text-gemini-green font-bold hover:underline"
                        >
                            Upload your first file &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.documentId}
                                onClick={() => setSelectedProject(project)}
                                className="group bg-gemini-dark-200 border border-gemini-dark-500 rounded-2xl p-6 cursor-pointer transition-all hover:border-gemini-green/50 hover:bg-[#151515] flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${project.type.includes('pdf') ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {project.type.includes('pdf') ? (
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                                            )}
                                        </div>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-gemini-gray bg-white/5 px-2 py-1 rounded-md">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 line-clamp-1 text-white group-hover:text-gemini-green transition-colors">{project.originalFile?.name || 'Untitled Project'}</h3>
                                    <div className="flex gap-1.5 mb-6">
                                        {/* Status Indicators */}
                                        {['Summary', 'Flashcards', 'Quiz', 'Mindmap'].map(type => {
                                            const isComplete = project[`${type.toLowerCase()}Data`];
                                            return (
                                                <div
                                                    key={type}
                                                    title={`${type} ${isComplete ? 'Ready' : 'Pending'}`}
                                                    className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-gemini-green shadow-[0_0_5px_rgba(0,255,136,0.5)]' : 'bg-white/5'}`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xs font-semibold text-gemini-gray uppercase tracking-tight">
                                        {project.metadata?.pageCount || '0'} pages
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenProject(project.documentId);
                                            }}
                                            className="bg-white/5 hover:bg-gemini-green hover:text-black p-2 rounded-lg transition-all"
                                            title="Resume Session"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Project Overview Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-gemini-dark-200 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gemini-gray hover:text-white transition-all z-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="p-10 border-b border-white/5 bg-gradient-to-br from-gemini-dark-300/50 to-transparent">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-4 rounded-2xl ${selectedProject.type.includes('pdf') ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {selectedProject.type.includes('pdf') ?
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg> :
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                                    }
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-1">{selectedProject.originalFile?.name}</h2>
                                    <p className="text-gemini-gray uppercase text-xs font-black tracking-[0.2em]">Validated Study Project • {selectedProject.metadata?.pageCount || 0} Pages</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => handleOpenProject(selectedProject.documentId)}
                                    className="bg-gemini-green text-black px-6 py-2.5 rounded-xl font-bold hover:bg-gemini-green-300 transition-all flex items-center gap-2"
                                >
                                    Resume Session &rarr;
                                </button>
                                {['Summary', 'Notes', 'Flashcards', 'Quiz'].map(mode => (
                                    <button
                                        key={mode}
                                        disabled={!selectedProject[`${mode.toLowerCase()}Data`]}
                                        onClick={() => openExportModal(mode.toLowerCase(), selectedProject[`${mode.toLowerCase()}Data`])}
                                        className="bg-white/5 hover:bg-white/10 text-white/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
                                    >
                                        Export {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 bg-gemini-dark-300/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <h4 className="text-xs font-black text-gemini-green uppercase tracking-widest mb-4">Core Insights</h4>
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 min-h-[200px]">
                                        {selectedProject.summaryData ? (
                                            <div className="prose prose-invert prose-sm line-clamp-[10]"
                                                dangerouslySetInnerHTML={{ __html: typeof selectedProject.summaryData === 'string' ? selectedProject.summaryData : (selectedProject.summaryData.summary || selectedProject.summaryData.html) }}>
                                            </div>
                                        ) : (
                                            <p className="text-gemini-gray italic">No summary generated yet. Open the session to analyze this document.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-gemini-green uppercase tracking-widest mb-4">Stats & History</h4>
                                    <div className="space-y-4">
                                        <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5">
                                            <span className="text-gemini-gray text-sm font-medium">Chat Interaction</span>
                                            <span className="text-white font-bold">{selectedProject.chatHistory?.length || 0} Messages</span>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5">
                                            <span className="text-gemini-gray text-sm font-medium">Project Created</span>
                                            <span className="text-white font-bold">{new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5">
                                            <span className="text-gemini-gray text-sm font-medium">Processing Status</span>
                                            <span className="text-gemini-green text-sm font-black uppercase tracking-tighter">Verified High Fidelity</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
