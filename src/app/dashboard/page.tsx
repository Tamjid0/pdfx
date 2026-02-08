'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useStore, type DocumentOverview } from '../../store/useStore';
import * as apiService from '../../services/apiService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import LoadingOverlay from '../../components/LoadingOverlay';
import ProjectExportAction from '../../components/dashboard/ProjectExportAction';
import ProjectStylePreviewPopup from '../../components/dashboard/ProjectStylePreviewPopup';
import { ProjectSkeletonGrid } from '../../components/dashboard/ProjectSkeleton';
import { hasProjectContent } from '../../utils/contentVisibility';

const ProjectsPage = () => {
    const { user, loading: authLoading } = useAuth();
    // Use granular page loading
    const { loadProject, isPageLoading, setIsPageLoading, openExportModal } = useStore();
    const router = useRouter();
    const [projects, setProjects] = useState<DocumentOverview[]>([]);
    const [fetching, setFetching] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const LIMIT = 12; // Use a reasonable limit for the grid
    const [selectedProject, setSelectedProject] = useState<DocumentOverview | null>(null);
    const [previewTarget, setPreviewTarget] = useState<{ mode: string; data: any } | null>(null);
    const [activeExportDropdown, setActiveExportDropdown] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Files');
    const [projectToDelete, setProjectToDelete] = useState<DocumentOverview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            loadProjects(currentPage);
        }
    }, [user, authLoading, currentPage]);

    const loadProjects = async (page: number) => {
        try {
            setFetching(true);
            setIsPageLoading(true);

            const offset = (page - 1) * LIMIT;
            const result = await apiService.fetchUserDocuments(user?.uid || 'guest', LIMIT, offset);

            setProjects(result.data);
            setTotalProjects(result.pagination.total);
            const total = Math.ceil(result.pagination.total / LIMIT);
            setTotalPages(total);

            // Sync selectedProject with new data if open
            if (selectedProject) {
                const updated = result.data.find(p => p.documentId === selectedProject.documentId);
                if (updated) setSelectedProject(updated);
            }

            // Handle empty page scenario (e.g. after deletion)
            if (result.data.length === 0 && page > 1) {
                setCurrentPage(page - 1);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setFetching(false);
            setIsPageLoading(false);
        }
    };

    const handleOpenProject = async (documentId: string) => {
        setIsPageLoading(true);
        await loadProject(documentId);
        setIsPageLoading(false);
        router.push('/');
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            setIsDeleting(true);
            const { deleteDocument } = useStore.getState();
            await deleteDocument(projectToDelete.documentId);

            // Re-fetch current page to "refill"
            await loadProjects(currentPage);
            setProjectToDelete(null);

            // If the deleted project was the selected one, clear it
            if (selectedProject?.documentId === projectToDelete.documentId) {
                setSelectedProject(null);
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Page-level transition loader
    const showLoader = isPageLoading || authLoading;

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white selection:bg-gemini-green/30">
            <Header />

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar />

                <main className="flex-1 overflow-y-auto px-8 py-12 custom-scrollbar">
                    <div className="max-w-7xl mx-auto relative h-full">
                        {/* Hero Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="w-5 h-[1.5px] bg-gemini-green rounded-full"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gemini-green/80">Vault • Library</span>
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Knowledge Base</h1>
                                <p className="text-gemini-gray text-base max-w-lg font-medium leading-relaxed">Manage your project library and AI-powered study insights.</p>
                            </div>
                            <button
                                onClick={() => router.push('/')}
                                className="group relative bg-white text-black px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gemini-green transition-all shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                New Project
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                {['All Files', 'Recent', 'Documents', 'Slides'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${activeFilter === filter ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-gemini-gray hover:border-white/10 hover:text-white'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group w-full md:w-72">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <svg className="w-3.5 h-3.5 text-gemini-gray group-focus-within:text-gemini-green transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="SEARCH VAULT..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-[10px] font-bold tracking-widest uppercase text-white placeholder:text-gemini-gray focus:outline-none focus:border-gemini-green/30 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                        </div>

                        {/* Truly Transparent Transition Overlay */}
                        {showLoader && !fetching && (
                            <div className="absolute inset-0 z-50 rounded-2xl overflow-hidden pointer-events-none">
                                <LoadingOverlay />
                            </div>
                        )}

                        {fetching && projects.length === 0 ? (
                            <ProjectSkeletonGrid />
                        ) : !showLoader && projects.length === 0 ? (
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-20 text-center flex flex-col items-center gap-8 backdrop-blur-sm animate-in zoom-in-95 duration-700">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gemini-green/5 rounded-3xl flex items-center justify-center text-gemini-green border border-gemini-green/10">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="absolute -inset-4 bg-gemini-green/10 blur-[40px] rounded-full -z-10 animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold tracking-tight text-white">Vault is empty</h3>
                                    <p className="text-gemini-gray max-w-sm mx-auto text-base leading-relaxed">Upload a research file or presentation to start building your second brain.</p>
                                </div>
                                <button
                                    onClick={() => router.push('/')}
                                    className="text-gemini-green font-bold uppercase text-[10px] tracking-[0.3em] hover:tracking-[0.4em] transition-all border border-gemini-green/20 px-6 py-2.5 rounded-lg hover:bg-gemini-green/5"
                                >
                                    Initiate Process &rarr;
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects
                                    .filter(p => {
                                        // 1. Category Filter
                                        if (activeFilter === 'Documents') return p.type.includes('pdf') || p.type.includes('text');
                                        if (activeFilter === 'Slides') return p.type.includes('presentation') || p.type.includes('pptx');
                                        if (activeFilter === 'Recent') {
                                            const aWeekAgo = new Date();
                                            aWeekAgo.setDate(aWeekAgo.getDate() - 7);
                                            return new Date(p.createdAt) > aWeekAgo;
                                        }
                                        return true; // All Files
                                    })
                                    .filter(p => {
                                        // 2. Search Query
                                        const name = (p.originalFile?.name || 'Untitled document').toLowerCase();
                                        const query = searchQuery.toLowerCase();
                                        return name.includes(query);
                                    })
                                    .map((project, idx) => (
                                        <div
                                            key={project.documentId}
                                            onClick={() => setSelectedProject(project)}
                                            style={{ animationDelay: `${idx * 40}ms` }}
                                            className="group relative bg-[#111] border border-white/[0.05] rounded-xl p-5 cursor-pointer transition-all hover:border-gemini-green/30 hover:-translate-y-1 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
                                        >
                                            {/* Minimal subtle glow */}
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gemini-green/5 blur-3xl rounded-full group-hover:bg-gemini-green/10 transition-colors"></div>

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-5">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 duration-300 ${project.type.includes('pdf') ? 'bg-red-500/5 text-red-500 border border-red-500/10' : 'bg-orange-500/5 text-orange-500 border border-orange-500/10'}`}>
                                                        {project.type.includes('pdf') ? (
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#555] group-hover:text-gemini-green/60 transition-colors">{new Date(project.createdAt).toLocaleDateString()}</span>

                                                    </div>
                                                </div>

                                                <h3 className="text-base font-bold mb-2 line-clamp-1 text-white group-hover:text-gemini-green transition-colors">{project.originalFile?.name || 'Untitled Document'}</h3>

                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex -space-x-1">
                                                        {['Summary', 'Notes', 'Insights', 'Quiz', 'Mindmap'].map(type => {
                                                            const isComplete = project[`${type.toLowerCase()}Data`];
                                                            return (
                                                                <div
                                                                    key={type}
                                                                    title={`${type}`}
                                                                    className={`w-1.5 h-1.5 rounded-full border border-black transition-all ${isComplete ? 'bg-gemini-green shadow-[0_0_4px_rgba(0,255,136,0.6)]' : 'bg-white/5'}`}
                                                                ></div>
                                                            );
                                                        })}
                                                    </div>
                                                    <span className="text-[8px] font-bold tracking-[0.1em] text-gemini-gray uppercase">Processed</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.03] relative z-10">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-gemini-gray uppercase tracking-widest leading-none mb-0.5">Scale</span>
                                                    <span className="text-[10px] font-bold text-white/40">
                                                        {project.metadata?.pageCount || '0'} Pages
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProjectToDelete(project);
                                                        }}
                                                        className="w-10 h-10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all flex items-center justify-center border border-white/5 active:scale-95 group/delete"
                                                        title="Delete Project"
                                                    >
                                                        <svg className="w-4 h-4 transition-transform group-hover/delete:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenProject(project.documentId);
                                                        }}
                                                        className="w-10 h-10 bg-white/5 hover:bg-gemini-green hover:text-black rounded-xl transition-all flex items-center justify-center group/play border border-white/5 active:scale-95 shadow-lg"
                                                        title="Open Workspace"
                                                    >
                                                        <svg className="w-5 h-5 transition-transform group-hover/play:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Numeric Pagination Switcher */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gemini-gray hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                                >
                                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <div className="flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        // Simple logic to show current, first, last, and a few around current
                                        const shouldShow =
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                                        if (!shouldShow) {
                                            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                return <span key={pageNum} className="px-2 text-white/20 text-[10px] font-black uppercase tracking-widest">...</span>;
                                            }
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`min-w-[40px] h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === pageNum ? 'bg-white text-black shadow-lg shadow-white/10 scale-105' : 'text-gemini-gray hover:text-white hover:bg-white/5'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gemini-gray hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                                >
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Refined Project Overview Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedProject(null)}></div>
                    <div className="bg-[#111] border border-white/10 w-full max-w-4xl h-full max-h-[80vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">

                        {/* Modal Header */}
                        <div className="p-10 pb-6 border-b border-white/5 z-20 relative bg-gradient-to-br from-white/[0.01] to-transparent">
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gemini-gray hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${selectedProject.type.includes('pdf') ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-orange-500/5 text-orange-500 border-orange-500/10'}`}>
                                    {selectedProject.type.includes('pdf') ?
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg> :
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                                    }
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedProject.originalFile?.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gemini-green text-[9px] font-bold uppercase tracking-[0.2em]">Verified Vault</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                        <span className="text-gemini-gray text-[9px] font-bold uppercase tracking-widest">{selectedProject.metadata?.pageCount || 0} Pages • Indexed {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4">
                                <button
                                    onClick={() => handleOpenProject(selectedProject.documentId)}
                                    className="bg-gemini-green text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-gemini-green-300 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-gemini-green/10 whitespace-nowrap"
                                >
                                    <span className="flex items-center gap-2">
                                        Open Session <span className="text-sm">&rarr;</span>
                                    </span>
                                </button>
                                <div className="flex flex-wrap gap-2 items-center z-30">


                                    {['Summary', 'Notes', 'Insights', 'Flashcards', 'Quiz', 'Mindmap']
                                        .filter(mode => {
                                            const moduleKey = `${mode.toLowerCase()}Data`;
                                            const moduleData = selectedProject[moduleKey];
                                            return hasProjectContent(mode, moduleData);
                                        })
                                        .map(mode => {
                                            const moduleKey = `${mode.toLowerCase()}Data`;
                                            const moduleData = selectedProject[moduleKey];
                                            const revisions = moduleData?.revisions || [];

                                            return (
                                                <ProjectExportAction
                                                    key={mode}
                                                    mode={mode}
                                                    documentId={selectedProject.documentId}
                                                    data={moduleData}
                                                    revisions={revisions}
                                                    filename={selectedProject.originalFile?.name?.split('.')[0] || 'project'}
                                                    activeDropdown={activeExportDropdown}
                                                    setActiveDropdown={setActiveExportDropdown}
                                                />
                                            );
                                        })}
                                </div>

                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    {/* Abstract Synthesis (Summary) */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-4 h-1 bg-gemini-green rounded-full"></span>
                                                <h4 className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em]">Abstract Synthesis</h4>
                                            </div>
                                            {selectedProject.summaryData && (
                                                <button
                                                    onClick={() => setPreviewTarget({ mode: 'summary', data: selectedProject.summaryData })}
                                                    className="p-1.5 hover:bg-white/5 rounded-lg text-gemini-gray hover:text-gemini-green transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 leading-relaxed text-white/70 overflow-hidden relative min-h-[100px]">
                                            {selectedProject.summaryData ? (
                                                <div className="prose prose-invert prose-xs max-w-none line-clamp-[6] text-sm"
                                                    dangerouslySetInnerHTML={{
                                                        __html: typeof selectedProject.summaryData === 'string'
                                                            ? selectedProject.summaryData
                                                            : (Array.isArray((selectedProject.summaryData as any).summary)
                                                                ? (selectedProject.summaryData as any).summary.join('\n')
                                                                : ((selectedProject.summaryData as any).summary || ''))
                                                    }}>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-6 gap-3 opacity-30">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    <p className="italic text-[11px]">No summary available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Collaborative Analysis Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                                            <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Mastery Test
                                            </h4>
                                            {hasProjectContent('quiz', selectedProject.quizData) ? (
                                                <div className="flex items-end justify-between">
                                                    <span className="text-xl font-bold text-white">{(selectedProject.quizData as any).quiz?.length || 0}</span>
                                                    <span className="text-[10px] text-white/40 font-medium">Questions</span>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-white/20 italic">Generated session pending</div>
                                            )}
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                                            <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                Knowledge Deck
                                            </h4>
                                            {hasProjectContent('flashcards', selectedProject.flashcardsData) ? (
                                                <div className="flex items-end justify-between">
                                                    <span className="text-xl font-bold text-white">{(selectedProject.flashcardsData as any).flashcards?.length || 0}</span>
                                                    <span className="text-[10px] text-white/40 font-medium">Flashcards</span>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-white/20 italic">Generated session pending</div>
                                            )}
                                        </div>

                                        <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                                            <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Core Insights
                                            </h4>
                                            {hasProjectContent('insights', selectedProject.insightsData) ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {((selectedProject.insightsData as any).topics || []).slice(0, 5).map((t: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-[9px] text-white/60 font-bold uppercase tracking-tight">{t}</span>
                                                    ))}
                                                    {((selectedProject.insightsData as any).topics || []).length > 5 && <span className="text-[9px] text-gemini-green/50 font-bold">+ More</span>}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-white/20 italic">Insight session pending</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-4 h-1 bg-white/10 rounded-full"></span>
                                            <h4 className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em]">Vault Metas</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-center group hover:bg-white/[0.03]">
                                                <span className="text-gemini-gray text-[10px] font-bold uppercase tracking-widest">Cognitive Scope</span>
                                                <span className="text-white text-xs font-bold">{selectedProject.chatHistory?.length || 0} Interactions</span>
                                            </div>
                                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex justify-between items-center group hover:bg-white/[0.03]">
                                                <span className="text-gemini-gray text-[10px] font-bold uppercase tracking-widest">Study Assets</span>
                                                <div className="flex gap-2">
                                                    {hasProjectContent('notes', selectedProject.notesData) && <span className="text-gemini-green text-[9px] font-bold px-2 py-0.5 bg-gemini-green/10 rounded">NOTES</span>}
                                                    {hasProjectContent('flashcards', selectedProject.flashcardsData) && <span className="text-gemini-green text-[9px] font-bold px-2 py-0.5 bg-gemini-green/10 rounded">CARDS</span>}
                                                    {hasProjectContent('quiz', selectedProject.quizData) && <span className="text-gemini-green text-[9px] font-bold px-2 py-0.5 bg-gemini-green/10 rounded">QUIZ</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gemini-green/5 border border-gemini-green/10 rounded-2xl p-8 relative overflow-hidden group">
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gemini-green/10 blur-2xl rounded-full"></div>
                                        <div className="relative z-10">
                                            <p className="text-white text-sm font-bold tracking-tight mb-2">Workspace Ready</p>
                                            <p className="text-gemini-gray text-[11px] leading-relaxed font-medium mb-6">Launch the full session to explore the complete interactive knowledge network and test your recall with custom AI flashcards.</p>
                                            <button
                                                onClick={() => handleOpenProject(selectedProject.documentId)}
                                                className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gemini-green transition-all"
                                            >
                                                Start Deep Study Session
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {previewTarget && (
                <ProjectStylePreviewPopup
                    mode={previewTarget.mode}
                    data={previewTarget.data}
                    onClose={() => setPreviewTarget(null)}
                />
            )}
            {/* Confirmation Modal */}
            {projectToDelete && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isDeleting && setProjectToDelete(null)}></div>
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-center mb-2">Discard Information?</h3>
                        <p className="text-gemini-gray text-center text-sm font-medium mb-8 leading-relaxed">
                            This will move <span className="text-white font-bold">{projectToDelete.originalFile?.name}</span> to the archive. You can restore it later from your dashboard settings.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setProjectToDelete(null)}
                                disabled={isDeleting}
                                className="px-6 py-3 rounded-xl bg-white/5 text-gemini-gray font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                Retain Asset
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                disabled={isDeleting}
                                className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                            >
                                {isDeleting ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : 'Discard Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
