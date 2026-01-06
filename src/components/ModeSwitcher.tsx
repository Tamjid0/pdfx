
import React, { useState, useEffect, useRef } from 'react';

const ALL_MODES = [
    { id: 'editor', label: 'Editor' },
    { id: 'chat', label: 'Chat' },
    { id: 'notes', label: 'Notes' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'summary', label: 'Summary' },
    { id: 'mindmap', label: 'Mind Map' },
    { id: 'insights', label: 'Insights' },
    { id: 'flashcards', label: 'Flashcards' }
];

interface ModeSwitcherProps {
    currentMode: string;
    onModeChange: (mode: string) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
    const [visibleModes, setVisibleModes] = useState(ALL_MODES.slice(0, 4));
    const [hiddenModes, setHiddenModes] = useState(ALL_MODES.slice(4));
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleModeClick = (modeId: string) => {
        onModeChange(modeId);
        setIsDropdownOpen(false);

        // If the selected mode is one of the hidden ones, swap it into view
        if (hiddenModes.some(m => m.id === modeId)) {
            const newHiddenModes = [...hiddenModes];
            const newVisibleModes = [...visibleModes];

            const modeToMakeVisible = newHiddenModes.find(m => m.id === modeId);
            const lastVisibleMode = newVisibleModes[3];

            if (modeToMakeVisible) {
                // Swap
                newVisibleModes[3] = modeToMakeVisible;
                const visibleIndex = newHiddenModes.indexOf(modeToMakeVisible);
                newHiddenModes.splice(visibleIndex, 1, lastVisibleMode);

                setVisibleModes(newVisibleModes);
                setHiddenModes(newHiddenModes);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="mode-selector inline-flex bg-[#1a1a1a] p-1.5 rounded-2xl border border-[#333] gap-1 shadow-lg">
            {visibleModes.map(mode => (
                <button
                    key={mode.id}
                    className={`mode-btn px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${currentMode === mode.id ? 'bg-[#00ff88] text-black font-semibold shadow-md' : 'bg-transparent text-[#aaa] hover:bg-[#2a2a2a] hover:text-white'}`}
                    onClick={() => handleModeClick(mode.id)}
                >
                    {mode.label}
                </button>
            ))}
            {hiddenModes.length > 0 && (
                <div className="more-btn-container relative" ref={dropdownRef}>
                    <button
                        className={`more-btn px-3 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-1.5 ${isDropdownOpen ? 'bg-[#2a2a2a] text-white' : 'bg-transparent text-[#aaa] hover:bg-[#2a2a2a] hover:text-white'}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span>More</span>
                    </button>
                    {isDropdownOpen && (
                        <div className="more-dropdown absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl min-w-[180px] z-[100] overflow-hidden">
                            {hiddenModes.map(mode => (
                                <button
                                    key={mode.id}
                                    className="more-dropdown-item w-full px-4 py-2.5 text-left text-sm font-medium text-[#ccc] bg-transparent hover:bg-[#252525] hover:text-white flex items-center gap-3"
                                    onClick={() => handleModeClick(mode.id)}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModeSwitcher;
