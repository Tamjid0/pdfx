import React, { useState, useRef, useCallback } from 'react';

interface DualRangeSliderProps {
    min: number;
    max: number;
    startValue: number;
    endValue: number;
    onChange: (start: number, end: number) => void;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
    min,
    max,
    startValue,
    endValue,
    onChange
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

    const getValueFromPosition = useCallback((clientX: number) => {
        if (!trackRef.current) return min;
        const rect = trackRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return Math.round(min + percentage * (max - min));
    }, [min, max]);

    const handleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
        e.preventDefault();
        setDragging(handle);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging) return;

        const newValue = getValueFromPosition(e.clientX);

        if (dragging === 'start') {
            onChange(Math.min(newValue, endValue), endValue);
        } else {
            onChange(startValue, Math.max(newValue, startValue));
        }
    }, [dragging, startValue, endValue, getValueFromPosition, onChange]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    React.useEffect(() => {
        if (dragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [dragging, handleMouseMove, handleMouseUp]);

    const startPercentage = ((startValue - min) / (max - min)) * 100;
    const endPercentage = ((endValue - min) / (max - min)) * 100;

    return (
        <div className="relative h-12 flex items-center">
            {/* Track background */}
            <div ref={trackRef} className="absolute w-full h-1 bg-gemini-dark-400 rounded-full cursor-pointer"></div>

            {/* Active range */}
            <div
                className="absolute h-1 bg-gemini-green rounded-full pointer-events-none"
                style={{
                    left: `${startPercentage}%`,
                    width: `${endPercentage - startPercentage}%`
                }}
            ></div>

            {/* Start handle */}
            <div
                className="absolute w-4 h-4 bg-gemini-green rounded-full border-2 border-gemini-dark cursor-grab active:cursor-grabbing shadow-[0_0_8px_rgba(0,255,136,0.3)] hover:scale-125 transition-transform z-10"
                style={{ left: `calc(${startPercentage}% - 8px)` }}
                onMouseDown={handleMouseDown('start')}
            ></div>

            {/* End handle */}
            <div
                className="absolute w-4 h-4 bg-gemini-green rounded-full border-2 border-gemini-dark cursor-grab active:cursor-grabbing shadow-[0_0_8px_rgba(0,255,136,0.3)] hover:scale-125 transition-transform z-10"
                style={{ left: `calc(${endPercentage}% - 8px)` }}
                onMouseDown={handleMouseDown('end')}
            ></div>
        </div>
    );
};
