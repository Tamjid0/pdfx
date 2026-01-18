Prompt for Your Coding Assistant

Objective:
Implement a robust system for rendering AI responses in the chat mode of our document assistant. Currently, AI replies appear broken/unformatted. The goal is to receive structured output from the AI and render it cleanly in the chat UI, similar to ChatGPT, Claude, or Gemini.

Requirements / Instructions:

AI Output Format

The AI should always return a JSON object with predefined fields.

Markdown formatting should be used inside each field for headings, lists, code blocks, bold/italic, etc.

Example response:

{
  "summary": "Patient shows **mild symptoms**.",
  "notes": "- Fatigue\n- Mild cough",
  "code": "```c\n#include <stdio.h>\nint main() { return 0; }\n```"
}


Fields explanation:

summary → Short structured text / paragraph.

notes → Bullet points or lists in Markdown.

code → Optional code block with triple backticks, language specified.

Frontend Rendering

Each JSON field must be rendered separately to preserve layout.

Use a Markdown renderer for each field (e.g., marked.js for vanilla JS, react-markdown for React).

Wrap each block in a styled container (card or chat bubble).

Example HTML structure:

<div class="chat-message">
  <div class="chat-summary">{rendered summaryHTML}</div>
  <div class="chat-notes">{rendered notesHTML}</div>
  <div class="chat-code">{rendered codeHTML}</div>
</div>


CSS should handle spacing, borders, background, and typography.

Safety & Reliability

Sanitize Markdown before rendering to prevent XSS or broken HTML.

Ensure code blocks, bullet points, and headings render properly and never break the layout.

Maintain consistent spacing and indentation.

Scalability

Design so that new content blocks (like images, tables, links) can be added in the future without changing AI prompt structure.

Frontend should dynamically render all fields present in JSON.

User Experience

Responses should appear visually clean and structured, like modern AI chat apps.

Avoid extra newlines, broken lists, or improperly formatted code.

Support multi-block replies where each block is clearly separated.

Prompt Engineering (Optional)

When querying the AI, instruct it:

“Return your response strictly as a JSON object with fields summary, notes, and code. Use Markdown inside each field. Do not add any extra text outside JSON.”