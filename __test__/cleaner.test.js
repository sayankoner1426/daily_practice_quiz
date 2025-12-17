import { cleanAndParseJSON } from '../lib/jsonCleaner';

describe('AI JSON Cleaner', () => {

    test('parses clean JSON correctly', () => {
        const input = '[{"text": "Hello"}]';
        const result = cleanAndParseJSON(input);
        expect(result[0].text).toBe("Hello");
    });

    test('removes Markdown code blocks', () => {
        //response in ```json ... ```
        const input = '```json\n[{"text": "Hidden Code"}]\n```';
        const result = cleanAndParseJSON(input);
        expect(result[0].text).toBe("Hidden Code");
    });

    test('removes invisible bad control characters', () => {

        const input = '[{"text": "Bad\x00Char"}]';
        
        const result = cleanAndParseJSON(input);
        expect(result[0].text).toBe("BadChar"); 
    });

    test('throws error on invalid JSON', () => {
        const input = 'This is not JSON';
        expect(() => cleanAndParseJSON(input)).toThrow();
    });
}); 
