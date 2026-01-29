import { safeParseAiJson } from '../src/utils/aiUtils.js';

const testCases = [
    {
        name: "Pure JSON",
        input: '{"key": "value"}',
        expected: { key: "value" }
    },
    {
        name: "Markdown JSON Block",
        input: 'Sure! Here is the JSON:\n```json\n{"key": "value"}\n```',
        expected: { key: "value" }
    },
    {
        name: "Markdown Clean Block",
        input: '```\n{"key": "value"}\n```',
        expected: { key: "value" }
    },
    {
        name: "Conversational Text Before/After",
        input: 'Here is your data: {"key": "value"} hope it helps!',
        expected: { key: "value" }
    },
    {
        name: "Nested Object",
        input: 'Results: {"outer": {"inner": 123}} end.',
        expected: { outer: { inner: 123 } }
    },
    {
        name: "Invalid JSON",
        input: 'This is not JSON at all.',
        expected: null
    }
];

console.log("--- Testing safeParseAiJson ---");
let passed = 0;

testCases.forEach(tc => {
    const result = safeParseAiJson(tc.input, tc.name);
    const success = JSON.stringify(result) === JSON.stringify(tc.expected);
    if (success) {
        console.log(`[PASS] ${tc.name}`);
        passed++;
    } else {
        console.error(`[FAIL] ${tc.name}`);
        console.error(`  Expected: ${JSON.stringify(tc.expected)}`);
        console.error(`  Got:      ${JSON.stringify(result)}`);
    }
});

console.log(`\nResults: ${passed}/${testCases.length} passed.`);
if (passed === testCases.length) {
    process.exit(0);
} else {
    process.exit(1);
}
