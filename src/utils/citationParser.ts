/**
 * Triggers a browser search by copying text to clipboard.
 * This is a utility function for manual search workflows.
 */
export function triggerBrowserSearch(searchText: string): void {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(searchText).catch(err => console.warn('Clipboard fail:', err));
    }
}
