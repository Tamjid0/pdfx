
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

// Importing icons (assuming these are available or will be provided)
// For now, using generic SVG paths. In a real app, you'd import from a library like react-icons or lucide-react
import type { Mode } from '../store/useStore';

const IconCircle = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>;
const IconCheck = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>;
const IconFileText = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" /></svg>;
const IconBarChart = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M4 22H2V2h2v20zm4 0H6V10h2v12zm4 0h-2V6h2v16zm4 0h-2V14h2v8zm4 0h-2V2h2v20z" /></svg>;
const IconPlusCircle = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7v-2h4z" /></svg>;
const IconSearch = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>;
const IconType = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16M11 17h2" /></svg>;
const IconUserCheck = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>;
const IconLayoutList = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M14 10H3" /><path d="M14 6H3" /><path d="M14 14H3" /><path d="M14 18H3" /><rect width="3" height="3" x="21" y="21" rx="1" /><rect width="3" height="3" x="21" y="10" rx="1" /><rect width="3" height="3" x="21" y="6" rx="1" /><rect width="3" height="3" x="21" y="14" rx="1" /></svg>;
const IconListOrdered = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M10 6H3" /><path d="M10 12H3" /><path d="M10 18H3" /><rect width="3" height="3" x="21" y="21" rx="1" /><rect width="3" height="3" x="21" y="10" rx="1" /><rect width="3" height="3" x="21" y="6" rx="1" /><rect width="3" height="3" x="21" y="14" rx="1" /></svg>;
const IconCheckSquare = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M9 11L12 14L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
const IconBox = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>;
const IconFlaskConical = (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M4 22h16" /><path d="M12 4v14" /><path d="M4.5 4h15" /><path d="M6 22L12 12 18 22" /></svg>;


interface RightSidebarProps {
    onApplyTools: (mode: Mode) => void;
    hasGenerated: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
    onApplyTools,
    hasGenerated
}) => {
    const {
        mode,
        summarySettings, setSummarySettings,
        quizSettings, setQuizSettings,
        notesSettings, setNotesSettings,
        insightsSettings, setInsightsSettings,
        mindmapSettings, setMindmapSettings,
        flashcardsData,
        openExportModal: openGlobalExportModal,
        insightsData, notesData, quizData, summaryData, mindmapData, htmlPreview
    } = useStore();
    const [settingsChanged, setSettingsChanged] = useState(false);

    useEffect(() => {
        setSettingsChanged(false);
    }, [mode]);

    const handleSettingChange = (setter: (val: any) => void, currentSettings: any, key: string, value: any) => {
        setter({ ...currentSettings, [key]: value });
        setSettingsChanged(true);
    };

    const handleQuizSettingChange = (key: string, value: any) => handleSettingChange(setQuizSettings, quizSettings, key, value);
    const handleSummarySettingChange = (key: string, value: any) => handleSettingChange(setSummarySettings, summarySettings, key, value);
    const handleMindmapSettingChange = (key: string, value: any) => handleSettingChange(setMindmapSettings, mindmapSettings, key, value);
    const handleNotesSettingChange = (key: string, value: any) => handleSettingChange(setNotesSettings, notesSettings, key, value);
    const handleInsightsSettingChange = (key: string, value: any) => handleSettingChange(setInsightsSettings, insightsSettings, key, value);

    const applyTools = () => {
        onApplyTools(mode);
        setSettingsChanged(false);
    };

    const buttonText = hasGenerated ? 'Apply' : 'Generate';
    const isApplyDisabled = hasGenerated && !settingsChanged;

    const renderToolSection = () => {
        switch (mode) {
            case 'editor':
                return (
                    <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                        <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                            <IconCircle className="w-3.5 h-3.5 fill-current" />
                            Document Analysis
                        </div>
                        <div className="tool-options grid gap-2.5">
                            <button className="tool-option flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                <IconFileText className="w-4 h-4 fill-gemini-gray shrink-0" />
                                <span className="tool-option-label text-sm text-[#ccc]">Word Count</span>
                            </button>
                            <button className="tool-option flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                <IconBarChart className="w-4 h-4 fill-gemini-gray shrink-0" />
                                <span className="tool-option-label text-sm text-[#ccc]">Readability Score</span>
                            </button>
                        </div>
                    </div>
                );
            case 'notes':
                return (
                    <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                        <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Note Tools</div>
                        <div className="tool-options grid gap-2.5">
                            <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                <input type="checkbox" className="accent-gemini-green" checked={notesSettings.keyConcepts} onChange={() => handleNotesSettingChange('keyConcepts', !notesSettings.keyConcepts)} />
                                <span className="tool-option-label text-sm text-[#ccc]">Key Concepts</span>
                            </label>
                            <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                <input type="checkbox" className="accent-gemini-green" checked={notesSettings.actionItems} onChange={() => handleNotesSettingChange('actionItems', !notesSettings.actionItems)} />
                                <span className="tool-option-label text-sm text-[#ccc]">Action Items</span>
                            </label>
                            <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                <input type="checkbox" className="accent-gemini-green" checked={notesSettings.aiSummary} onChange={() => handleNotesSettingChange('aiSummary', !notesSettings.aiSummary)} />
                                <span className="tool-option-label text-sm text-[#ccc]">AI Summary</span>
                            </label>
                        </div>
                    </div>
                );
            case 'quiz':
                return (
                    <>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Question Types</div>
                            <div className="tool-options grid gap-2.5">
                                <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconCheckSquare className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <input type="checkbox" className="accent-gemini-green" checked={quizSettings.questionTypes.includes('multiple-choice')} onChange={() => {
                                        const newTypes = quizSettings.questionTypes.includes('multiple-choice')
                                            ? quizSettings.questionTypes.filter((t: string) => t !== 'multiple-choice')
                                            : [...quizSettings.questionTypes, 'multiple-choice'];
                                        handleQuizSettingChange('questionTypes', newTypes);
                                    }} />
                                    <span className="tool-option-label text-sm text-[#ccc]">Multiple Choice</span>
                                </label>
                                <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconCheckSquare className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <input type="checkbox" className="accent-gemini-green" checked={quizSettings.questionTypes.includes('true-false')} onChange={() => {
                                        const newTypes = quizSettings.questionTypes.includes('true-false')
                                            ? quizSettings.questionTypes.filter((t: string) => t !== 'true-false')
                                            : [...quizSettings.questionTypes, 'true-false'];
                                        handleQuizSettingChange('questionTypes', newTypes);
                                    }} />
                                    <span className="tool-option-label text-sm text-[#ccc]">True/False</span>
                                </label>
                                <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconCheckSquare className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <input type="checkbox" className="accent-gemini-green" checked={quizSettings.questionTypes.includes('fill-in-the-blank')} onChange={() => {
                                        const newTypes = quizSettings.questionTypes.includes('fill-in-the-blank')
                                            ? quizSettings.questionTypes.filter((t: string) => t !== 'fill-in-the-blank')
                                            : [...quizSettings.questionTypes, 'fill-in-the-blank'];
                                        handleQuizSettingChange('questionTypes', newTypes);
                                    }} />
                                    <span className="tool-option-label text-sm text-[#ccc]">Fill in the Blank</span>
                                </label>
                            </div>
                        </div>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Quiz Settings</div>
                            <div className="tool-options grid gap-4">
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Difficulty</label>
                                    <input type="range" min="0" max="2" step="1" value={quizSettings.difficulty === 'easy' ? 0 : quizSettings.difficulty === 'medium' ? 1 : 2} onChange={(e) => handleQuizSettingChange('difficulty', e.target.value === '0' ? 'easy' : e.target.value === '1' ? 'medium' : 'hard')} className="w-full accent-gemini-green" />
                                    <div className="flex justify-between text-xs text-gemini-gray">
                                        <span>Easy</span>
                                        <span>Medium</span>
                                        <span>Hard</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="tool-option-label text-sm text-[#ccc]">Timed Quiz</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={quizSettings.timed} onChange={() => handleQuizSettingChange('timed', !quizSettings.timed)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gemini-dark-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gemini-dark-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gemini-green"></div>
                                    </label>
                                </div>
                                {quizSettings.timed && (
                                    <div>
                                        <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Time Limit (minutes)</label>
                                        <input type="number" value={quizSettings.timeLimit} onChange={(e) => handleQuizSettingChange('timeLimit', Number(e.target.value))} className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Evaluation</div>
                            <div className="tool-options grid gap-2.5">
                                <button className="tool-option flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconCheck className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <span className="tool-option-label text-sm text-[#ccc]">Auto-Grading</span>
                                </button>
                                <button className="tool-option flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconUserCheck className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <span className="tool-option-label text-sm text-[#ccc]">Performance Review</span>
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'mindmap':
                return (
                    <>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Layouts</div>
                            <div className="tool-options grid gap-2.5">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-[#ccc]">

                                        <input type="radio" name="layout" value="organic" checked={mindmapSettings.layout === 'organic'} onChange={() => handleMindmapSettingChange('layout', 'organic')} className="accent-gemini-green" />
                                        Organic
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-[#ccc]">

                                        <input type="radio" name="layout" value="radial" checked={mindmapSettings.layout === 'radial'} onChange={() => handleMindmapSettingChange('layout', 'radial')} className="accent-gemini-green" />
                                        Radial
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-[#ccc]">
                                        <input type="radio" name="layout" value="linear" checked={mindmapSettings.layout === 'linear'} onChange={() => handleMindmapSettingChange('layout', 'linear')} className="accent-gemini-green" />
                                        Linear
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Customization</div>
                            <div className="tool-options grid gap-4">
                                <button className="tool-option flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconPlusCircle className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <span className="tool-option-label text-sm text-[#ccc]">Add Relationship</span>
                                </button>
                                <button className="tool-option flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconType className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <span className="tool-option-label text-sm text-[#ccc]">Styling</span>
                                </button>
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Theme</label>
                                    <select value={mindmapSettings.theme} onChange={(e) => handleMindmapSettingChange('theme', e.target.value)} className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white">
                                        <option value="default">Default</option>
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">View</div>
                            <div className="tool-options grid gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="tool-option-label text-sm text-[#ccc]">Focus Mode</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={mindmapSettings.focusMode} onChange={() => handleMindmapSettingChange('focusMode', !mindmapSettings.focusMode)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gemini-dark-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gemini-dark-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gemini-green"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="tool-option-label text-sm text-[#ccc]">Presentation Mode</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={mindmapSettings.presentationMode} onChange={() => handleMindmapSettingChange('presentationMode', !mindmapSettings.presentationMode)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gemini-dark-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gemini-dark-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gemini-green"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Search</label>
                                    <input type="text" value={mindmapSettings.searchTerm} onChange={(e) => handleMindmapSettingChange('searchTerm', e.target.value)} className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white" placeholder="Search nodes..." />
                                </div>
                                <button className="tool-option flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <IconSearch className="w-4 h-4 fill-gemini-gray shrink-0" />
                                    <span className="tool-option-label text-sm text-[#ccc]">Filter</span>
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'summary':
                return (
                    <>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Content</div>
                            <div className="tool-options grid gap-4">
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Summary Length: {summarySettings.summaryLength}%</label>
                                    <input type="range" min="10" max="100" step="10" value={summarySettings.summaryLength} onChange={(e) => handleSummarySettingChange('summaryLength', Number(e.target.value))} className="w-full accent-gemini-green" />
                                </div>
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Format</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-[#ccc]">
                                            <IconLayoutList className="w-4 h-4 fill-gemini-gray shrink-0" />
                                            <input type="radio" name="summary-format" value="paragraph" checked={summarySettings.summaryFormat === 'paragraph'} onChange={() => handleSummarySettingChange('summaryFormat', 'paragraph')} className="accent-gemini-green" />
                                            Paragraph
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[#ccc]">
                                            <IconListOrdered className="w-4 h-4 fill-gemini-gray shrink-0" />
                                            <input type="radio" name="summary-format" value="bullets" checked={summarySettings.summaryFormat === 'bullets'} onChange={() => handleSummarySettingChange('summaryFormat', 'bullets')} className="accent-gemini-green" />
                                            Bullets
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Keywords</label>
                                    <input type="text" value={summarySettings.keywords} onChange={(e) => handleSummarySettingChange('keywords', e.target.value)} className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white" placeholder="e.g., AI, machine learning" />
                                </div>
                            </div>
                        </div>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Style</div>
                            <div className="tool-options grid gap-4">
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Tone</label>
                                    <select value={summarySettings.tone} onChange={(e) => handleSummarySettingChange('tone', e.target.value)} className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white">
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="academic">Academic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Language</label>
                                    <input type="text" value={summarySettings.language} onChange={(e) => handleSummarySettingChange('language', e.target.value)} className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Advanced</div>
                            <div className="tool-options grid gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="tool-option-label text-sm text-[#ccc]">Key Sentences</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={summarySettings.keySentences} onChange={() => handleSummarySettingChange('keySentences', !summarySettings.keySentences)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gemini-dark-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gemini-dark-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gemini-green"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Summary Type</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-[#ccc]">
                                            <IconFlaskConical className="w-4 h-4 fill-gemini-gray shrink-0" />
                                            <input type="radio" name="summary-type" value="abstractive" checked={summarySettings.summaryType === 'abstractive'} onChange={() => handleSummarySettingChange('summaryType', 'abstractive')} className="accent-gemini-green" />
                                            Abstractive
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[#ccc]">
                                            <IconBox className="w-4 h-4 fill-gemini-gray shrink-0" />
                                            <input type="radio" name="summary-type" value="extractive" checked={summarySettings.summaryType === 'extractive'} onChange={() => handleSummarySettingChange('summaryType', 'extractive')} className="accent-gemini-green" />
                                            Extractive
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'insights':
                return (
                    <>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Extraction Type</div>
                            <div className="tool-options grid gap-2.5">
                                <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <input type="checkbox" className="accent-gemini-green" checked={insightsSettings.keyEntities} onChange={() => handleInsightsSettingChange('keyEntities', !insightsSettings.keyEntities)} />
                                    <span className="tool-option-label text-sm text-[#ccc]">Key Entities</span>
                                </label>
                                <label className="flex items-center gap-2.5 p-2.5 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg cursor-pointer transition-all hover:bg-gemini-green/10 hover:border-gemini-green">
                                    <input type="checkbox" className="accent-gemini-green" checked={insightsSettings.topics} onChange={() => handleInsightsSettingChange('topics', !insightsSettings.topics)} />
                                    <span className="tool-option-label text-sm text-[#ccc]">Topics</span>
                                </label>
                            </div>
                        </div>
                        <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                            <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Custom</div>
                            <div className="tool-options grid gap-2.5">
                                <input type="text" value={insightsSettings.customExtraction} onChange={(e) => handleInsightsSettingChange('customExtraction', e.target.value)} className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white" placeholder="Custom extraction query..." />
                            </div>
                        </div>
                    </>
                );
            case 'flashcards':
                return (
                    <div className="tool-section bg-gemini-dark-300 border border-gemini-dark-500 rounded-xl p-4 mb-5">
                        <div className="tool-section-title text-xs font-semibold text-gemini-green uppercase tracking-wider mb-3.5 flex items-center gap-1.5">Deck Settings</div>
                        <div className="tool-options grid gap-4">
                            <div>
                                <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Number of Cards</label>
                                <input type="number" min="5" max="50" step="5" value={flashcardsData?.flashcards?.length || 10} readOnly className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white opacity-50 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="tool-option-label text-sm text-[#ccc] mb-2 block">Difficulty</label>
                                <select className="w-full p-2 bg-gemini-dark-400 border border-gemini-dark-500 rounded-lg text-white">
                                    <option value="mixed">Mixed</option>
                                    <option value="easy">Easy</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <p className="text-[#666] text-sm text-center p-4">
                        Select a mode to see available tools.
                    </p>
                );
        }
    };

    return (
        <aside className="sidebar-right w-[320px] bg-gemini-dark-200 border-l border-gemini-dark-400 flex flex-col overflow-hidden h-[100vh]">
            <div className="right-sidebar-header p-4 border-b border-gemini-dark-400 bg-gemini-dark-300 flex justify-between items-center">
                <h3 className="right-sidebar-title text-base font-semibold text-white flex items-center gap-2">
                    <IconCircle className="w-5 h-5 fill-gemini-green" />
                    Tools
                </h3>
                <button
                    className={`apply-btn px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${isApplyDisabled ? 'bg-gemini-dark-500 text-gemini-gray cursor-not-allowed' : 'bg-gemini-green text-black hover:bg-gemini-green-300'}`}
                    onClick={applyTools}
                    disabled={isApplyDisabled}
                >
                    <IconCheck className="w-3.5 h-3.5 fill-current" />
                    {buttonText}
                </button>
            </div>
            <div className="right-sidebar-content flex-1 overflow-y-auto p-5">
                {renderToolSection()}
            </div>
            <div className="action-buttons p-5 border-t border-gemini-dark-500 flex flex-col gap-3 flex-shrink-0">
                <button
                    className="action-btn action-btn-export w-full p-3 rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 border-none bg-gemini-green text-black hover:bg-gemini-green-300"
                    onClick={() => {
                        let data = null;
                        if (mode === 'editor') {
                            data = htmlPreview;
                        } else {
                            switch (mode) {
                                case 'summary': data = summaryData; break;
                                case 'insights': data = insightsData; break;
                                case 'notes': data = notesData; break;
                                case 'quiz': data = quizData; break;
                                case 'flashcards': data = flashcardsData; break;
                                case 'mindmap': data = mindmapData; break;
                                default: data = null;
                            }
                        }
                        if (data) openGlobalExportModal(mode, data);
                        else alert("No content to export.");
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 fill-current"
                    >
                        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
                    </svg>
                    Export
                </button>
            </div>

        </aside>
    );
};

export default RightSidebar;
