# URGENT FIX INSTRUCTIONS

## Problem 1: PDF Shows HTML Source Code

**Root Cause:** The summary content is plain text, not HTML. When wrapped in the HTML template and sent to Puppeteer, it renders as plain text.

**Quick Fix Option 1 - Use a different export method:**
Instead of using the custom export, try using the browser's built-in print-to-PDF:
1. Open your project
2. Press Ctrl+P (or Cmd+P on Mac)
3. Select "Save as PDF" as the destination
4. Click Save

**Quick Fix Option 2 - Check what's actually being sent:**
Open browser console and run this before exporting:
```javascript
console.log('Summary data:', useStore.getState().summaryData);
```

## Problem 2: State Reset When Clicking History/Tabs

**Root Cause:** The `ERR_INSUFFICIENT_RESOURCES` error means your browser is running out of resources.

**Immediate Solutions:**

### Option A: Restart Everything
1. Close ALL browser tabs and windows
2. Stop the Next.js dev server (Ctrl+C)
3. Stop the backend server (Ctrl+C)
4. Restart your computer (yes, really - this clears system resources)
5. Start backend server
6. Start Next.js dev server
7. Open ONLY your app in the browser

### Option B: Check for Memory Leaks
Open Task Manager (Ctrl+Shift+Esc) and check:
- Is Chrome/Edge using >4GB of RAM?
- Are there multiple Node.js processes running?
- Is your disk at 100% usage?

If yes to any, you have a system resource issue, not a code issue.

### Option C: Use Production Build
Development mode uses more resources. Try production:
```bash
npm run build
npm start
```

## If NONE of this works

**The issue is environmental, not code-related. You need to:**
1. Check your system resources (RAM, disk space)
2. Close other applications
3. Check if antivirus is blocking requests
4. Try on a different computer
5. Check network/firewall settings

## What I've Already Fixed in the Code

1. ✅ Added HTML entity decoding in ExportModal.tsx
2. ✅ Added plain text to HTML conversion
3. ✅ Fixed loadProjectModule to handle legacy data
4. ✅ Fixed updateRevisionsFromSync to parse dot-notation keys
5. ✅ Added extensive logging

**These fixes ARE in the code. If they're not working, it's because:**
- The dev server isn't recompiling (check terminal for errors)
- Browser cache is serving old code (hard refresh with Ctrl+Shift+R)
- System resources are exhausted (restart computer)
