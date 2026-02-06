export const getContent = (val: any) => {
    if (!val) return null;
    // 1. Check for standard active content field
    if (val.content !== undefined && val.content !== null) return val.content;
    // 2. Fallback to latest revision content if available
    if (Array.isArray(val.revisions) && val.revisions.length > 0) {
        return val.revisions[0].data || val.revisions[0].content;
    }
    // 3. Fallback to legacy format (no revisions or content field)
    if (typeof val === 'object' && !val.revisions && !val.content) return val;
    return null;
};
