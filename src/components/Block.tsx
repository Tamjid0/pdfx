import React from 'react';

interface BlockProps {
    children: React.ReactNode;
    isSelected: boolean;
    onSelect: () => void;
}

const Block: React.FC<BlockProps> = ({ children, isSelected, onSelect }) => {
    const handleDuplicate = () => {
        alert('Duplicate Block - Coming Soon');
    };

    const handleDelete = () => {
        alert('Delete Block - Coming Soon');
    };

    return (
        <div
            className={`bg-white border-2 rounded-lg p-4 mb-4 relative cursor-move transition-all ${isSelected ? 'border-[#00ff88] shadow-md shadow-green-500/[.2]' : 'border-gray-200 hover:border-[#00ff88] hover:shadow-md hover:shadow-green-500/[.1]'}`}
            onClick={onSelect}
        >
            <div className={`absolute -top-9 right-0 gap-1 ${isSelected ? 'flex' : 'hidden'}`}>
                <button
                    className="bg-white border border-gray-300 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all flex items-center gap-1 hover:bg-gray-50 hover:border-[#00ff88]"
                    onClick={handleDuplicate}
                >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 fill-gray-600">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    </svg>
                    Copy
                </button>
                <button
                    className="bg-white border border-gray-300 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all flex items-center gap-1 hover:bg-gray-50 hover:border-[#00ff88]"
                    onClick={handleDelete}
                >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 fill-gray-600">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                    Delete
                </button>
            </div>
            {children}
        </div>
    );
};

export default Block;
