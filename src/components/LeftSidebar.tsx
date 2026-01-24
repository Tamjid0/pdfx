import React, { useState, useEffect } from "react";
import { fetchTemplates } from "../services/apiService";
import { useStore } from "../store/useStore";
import { useAuth } from "../hooks/useAuth";
import * as apiService from "../services/apiService";

interface Template {
    id: string;
    name: string;
    category: string;
    description: string;
    prompt: string;
}

const LeftSidebar: React.FC = () => {
    const {
        stats,
        prompt,
        setPrompt,
        setView,
        setMode,
        htmlPreview,
        setHtmlPreview,
        setIsLoading,
        templates, // From store
        setTemplates, // From store
    } = useStore();

    const { user } = useAuth();
    const isGuest = !user;

    const [activeTab, setActiveTab] = useState<"stats" | "format">("stats");
    // const [templates, setTemplates] = useState<Template[]>([]); // Removed local state
    // Initialize filtered templates with store templates immediately if available
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates || []);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const backToImport = () => {
        setView("import");
        setMode("editor");
    };

    const handleFormat = async () => {
        if (!htmlPreview) return;
        setIsLoading(true);
        try {
            const data = await apiService.formatContent(htmlPreview, prompt);
            setHtmlPreview(data.formattedHtml);
        } catch (error) {
            console.error("Error formatting content:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyTemplate = async (templatePrompt: string) => {
        if (!htmlPreview) return;
        setIsLoading(true);
        try {
            const data = await apiService.formatContent(htmlPreview, templatePrompt);
            setHtmlPreview(data.formattedHtml);
        } catch (error) {
            console.error("Error applying template:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const getTemplates = async () => {
            // Use minimal cache: if we already have templates in store, don't fetch again
            if (templates.length > 0) {
                setFilteredTemplates(templates);
                return;
            }

            try {
                const fetchedTemplates = await fetchTemplates();
                setTemplates(fetchedTemplates); // Save to store
                setFilteredTemplates(fetchedTemplates);
            } catch (error) {
                console.error("Error fetching templates:", error);
            }
        };
        getTemplates();
    }, []); // Still only run on mount, but now won't re-fetch if store has data

    useEffect(() => {
        let currentFiltered = templates;

        if (searchTerm) {
            currentFiltered = currentFiltered.filter(
                (template) =>
                    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredTemplates(currentFiltered);
    }, [searchTerm, templates]);

    return (
        <aside className="sidebar-left w-[320px] bg-gemini-dark-200 border-r border-gemini-dark-400 flex flex-col h-full overflow-hidden">
            <div className="left-sidebar-tabs flex-shrink-0 flex bg-gemini-dark-300 border-b border-gemini-dark-500">
                <button
                    className={`left-tab-btn flex-1 p-4 bg-none border-none text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${activeTab === "stats"
                        ? "text-gemini-green border-b-2 border-gemini-green bg-gemini-green/10"
                        : "text-gemini-gray border-b-2 border-transparent hover:text-white hover:bg-gemini-green/5"
                        }`}
                    onClick={() => setActiveTab("stats")}
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                    Stats
                </button>
                <button
                    className={`left-tab-btn flex-1 p-4 bg-none border-none text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${activeTab === "format"
                        ? "text-gemini-green border-b-2 border-gemini-green bg-gemini-green/10"
                        : "text-gemini-gray border-b-2 border-transparent hover:text-white hover:bg-gemini-green/5"
                        }`}
                    onClick={() => setActiveTab("format")}
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z" />
                    </svg>
                    Format
                </button>
            </div>

            <div className="left-tab-content flex-grow overflow-y-auto p-5">
                {activeTab === "stats" && (
                    <div className="flex flex-col gap-4">
                        <button
                            className="back-btn w-full p-2.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-white text-sm cursor-pointer transition-all flex items-center gap-2 hover:bg-gemini-dark-400 hover:border-gemini-green"
                            onClick={backToImport}
                        >
                            <svg
                                className="w-4 h-4 fill-current"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                            Back to Import
                        </button>
                        <div className="stats-card bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4">
                            <div className="stats-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-4">
                                Content Stats
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="stat-box text-center p-3 bg-gemini-green/5 rounded-lg">
                                    <span className="stat-value text-2xl font-bold text-gemini-green block mb-1">
                                        {stats.wordCount}
                                    </span>
                                    <span className="stat-label text-xs text-gemini-gray uppercase">
                                        Words
                                    </span>
                                </div>
                                <div className="stat-box text-center p-3 bg-gemini-green/5 rounded-lg">
                                    <span className="stat-value text-2xl font-bold text-gemini-green block mb-1">
                                        {stats.charCount}
                                    </span>
                                    <span className="stat-label text-xs text-gemini-gray uppercase">
                                        Characters
                                    </span>
                                </div>
                                <div className="stat-box text-center p-3 bg-gemini-green/5 rounded-lg">
                                    <span className="stat-value text-2xl font-bold text-gemini-green block mb-1">
                                        {stats.readTime}
                                    </span>
                                    <span className="stat-label text-xs text-gemini-gray uppercase">
                                        Min Read
                                    </span>
                                </div>
                                <div className="stat-box text-center p-3 bg-gemini-green/5 rounded-lg">
                                    <span className="stat-value text-2xl font-bold text-gemini-green block mb-1">
                                        {stats.lineCount}
                                    </span>
                                    <span className="stat-label text-xs text-gemini-gray uppercase">
                                        Lines
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="basic-tools-card bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 relative group">
                            {isGuest && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-gemini-dark-200 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl scale-90">
                                        <svg className="w-3 h-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span className="text-[9px] text-white font-bold uppercase tracking-widest">Login Required</span>
                                    </div>
                                </div>
                            )}
                            <div className="basic-tools-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-4">Quick Tools</div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="tool-btn flex flex-col items-center justify-center p-3 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-gemini-green/10 hover:border-gemini-green hover:text-white">
                                    <svg className="w-6 h-6 mb-1.5 fill-gemini-gray" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                                    Search
                                </div>
                                <div className="tool-btn flex flex-col items-center justify-center p-3 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-gemini-green/10 hover:border-gemini-green hover:text-white">
                                    <svg className="w-6 h-6 mb-1.5 fill-gemini-gray" viewBox="0 0 24 24"><path d="M15 21H9v-6H3v-2.83l14-14 2.83 2.83-14 14V18h5.17z" /></svg>
                                    Highlight
                                </div>
                                <div className="tool-btn flex flex-col items-center justify-center p-3 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-gemini-green/10 hover:border-gemini-green hover:text-white">
                                    <svg className="w-6 h-6 mb-1.5 fill-gemini-gray" viewBox="0 0 24 24"><path d="M4 13h5v-2H4v2zm7 0h10v-2H11v2zm-7 5h7v-2H4v2zm9 0h8v-2h-8v2zM4 9h10V7H4v2zm11 0h5V7h-5v2z" /></svg>
                                    Outline
                                </div>
                                <div className="tool-btn flex flex-col items-center justify-center p-3 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-gemini-green/10 hover:border-gemini-green hover:text-white">
                                    <svg className="w-6 h-6 mb-1.5 fill-gemini-gray" viewBox="0 0 24 24"><path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z" /></svg>
                                    Notes
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "format" && (
                    <div className="flex flex-col flex-grow h-full">
                        <div className="p-5">
                            <div className="format-search relative">
                                <svg
                                    className="search-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-[#666]"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                </svg>
                                <input
                                    type="text"
                                    className="search-input w-full pl-10 pr-4 py-3 bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-gemini-green focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]"
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="templates-list flex-grow  pt-0 flex flex-col gap-3 overflow-y-auto">
                            {filteredTemplates.length > 0 ? (
                                filteredTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="template-card bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg p-3.5 cursor-pointer transition-all flex items-center gap-3 hover:border-gemini-green hover:bg-gemini-green/5"
                                        onClick={() => handleApplyTemplate(template.prompt)}
                                    >
                                        <div className="template-icon w-8 h-8 min-w-[32px] bg-gemini-green/10 rounded-md flex items-center justify-center">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-4 h-4 fill-gemini-green"
                                            >
                                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                            </svg>
                                        </div>
                                        <div className="template-info flex-1">
                                            <div className="template-name text-sm font-semibold text-white">
                                                {template.name}
                                            </div>
                                            <div className="template-desc text-xs text-gemini-gray leading-snug">
                                                {template.description}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-[#666] text-sm py-4">
                                    No templates found.
                                </p>
                            )}
                        </div>
                        <div className="custom-prompt flex-shrink-0 pt-0 relative group">
                            {isGuest && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-gemini-dark-200 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl">
                                        <svg className="w-3 h-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">Login to Unlock</span>
                                    </div>
                                </div>
                            )}
                            <div className="bg-gemini-dark-300 border border-gemini-dark-500 rounded-lg p-4">
                                <h4 className="text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3">Custom Instructions</h4>
                                <textarea
                                    className="w-full h-24 bg-gemini-dark-400 border border-gemini-dark-500 rounded-md text-[#ccc] text-sm p-2.5 resize-none mb-3"
                                    placeholder="e.g., Add headers, Convert to table..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                ></textarea>
                                <button
                                    className="w-full p-2.5 bg-gemini-green text-black border-none rounded-md text-sm font-semibold cursor-pointer transition-all hover:bg-gemini-green-300"
                                    onClick={handleFormat}
                                >
                                    Apply Format
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default LeftSidebar;
