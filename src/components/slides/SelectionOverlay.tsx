import React, { useState, useRef, useEffect } from 'react';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface SelectionOverlayProps {
    onSelectionComplete: (rect: Rect) => void;
    isActive: boolean;
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ onSelectionComplete, isActive }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setStartPos(null);
            setCurrentPos(null);
            setIsDragging(false);
        }
    }, [isActive]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isActive || !overlayRef.current) return;

        const rect = overlayRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setStartPos({ x, y });
        setCurrentPos({ x, y });
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isActive || !isDragging || !startPos || !overlayRef.current) return;

        const rect = overlayRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

        setCurrentPos({ x, y });
    };

    const handleMouseUp = () => {
        if (!isActive || !isDragging || !startPos || !currentPos || !overlayRef.current) return;

        const rect = overlayRef.current.getBoundingClientRect();

        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        // Convert to percentages
        if (width > 5 && height > 5) {
            onSelectionComplete({
                x: (x / rect.width) * 100,
                y: (y / rect.height) * 100,
                width: (width / rect.width) * 100,
                height: (height / rect.height) * 100
            });
        }

        setIsDragging(false);
        setStartPos(null);
        setCurrentPos(null);
    };

    if (!isActive) return null;

    return (
        <div
            ref={overlayRef}
            className="absolute inset-0 z-[60] cursor-crosshair overflow-hidden touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {isDragging && startPos && currentPos && (
                <div
                    className="absolute border-2 border-[#00ff88] bg-[#00ff88]/20 shadow-[0_0_15px_rgba(0,255,136,0.3)] pointer-events-none"
                    style={{
                        left: Math.min(startPos.x, currentPos.x),
                        top: Math.min(startPos.y, currentPos.y),
                        width: Math.abs(currentPos.x - startPos.x),
                        height: Math.abs(currentPos.y - startPos.y),
                        transition: 'none'
                    }}
                />
            )}

            {/* Guide Text */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest pointer-events-none animate-in fade-in slide-in-from-top-2">
                Click and drag to select an area
            </div>
        </div>
    );
};

export default SelectionOverlay;
