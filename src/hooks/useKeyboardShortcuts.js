 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * Handles Cmd/Ctrl+P for preview toggle
 */
export const useKeyboardShortcuts = (callbacks

) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd/Ctrl + P - Toggle Preview
            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                _optionalChain([callbacks, 'access', _ => _.onTogglePreview, 'optionalCall', _2 => _2()]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [callbacks]);
};
