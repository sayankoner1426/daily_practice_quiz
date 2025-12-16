export function cleanAndParseJSON(text) {
    try {
        // 1. Remove markdown code blocks
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // 2. Fix bad control characters (The original error source)
        cleanText = cleanText.replace(/[\x00-\x1F\x7F]/g, (char) => {
             // Allow valid JSON whitespace (newline, carriage return, tab)
            if (char === '\n' || char === '\r' || char === '\t') return char; 
            return ''; 
        });

        return JSON.parse(cleanText);
    } catch (e) {
        throw new Error("Failed to parse JSON: " + e.message);
    }
}