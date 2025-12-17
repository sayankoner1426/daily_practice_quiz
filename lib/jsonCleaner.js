export function cleanAndParseJSON(text) {
    try {
        //remove markdown code blocks
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // fix bad control characters (original error source)
        cleanText = cleanText.replace(/[\x00-\x1F\x7F]/g, (char) => {
             // allow valid JSON whitespace (newline, carriage return, tab)
            if (char === '\n' || char === '\r' || char === '\t') return char; 
            return ''; 
        });

        return JSON.parse(cleanText);
    } catch (e) {
        throw new Error("Failed to parse JSON: " + e.message);
    }
}