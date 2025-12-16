import { calculateQuizScore } from '../lib/quizLogic';

describe('Quiz Scoring Logic', () => {
    
    // Mock Data
    const mockAnswerKey = {
        'q1': 'Option A',
        'q2': 'Option B',
        'q3': 'Option C'
    };

    test('calculates perfect score correctly', () => {
        const userAnswers = [
            { questionId: 'q1', selectedOption: 'Option A' },
            { questionId: 'q2', selectedOption: 'Option B' },
            { questionId: 'q3', selectedOption: 'Option C' }
        ];

        const result = calculateQuizScore(userAnswers, mockAnswerKey);
        
        expect(result.score).toBe(3); // Expect score to be 3
        expect(result.detailedResults[0].isCorrect).toBe(true);
    });

    test('calculates partial score correctly', () => {
        const userAnswers = [
            { questionId: 'q1', selectedOption: 'Option A' }, // Correct
            { questionId: 'q2', selectedOption: 'Option D' }, // Wrong (Correct is B)
            { questionId: 'q3', selectedOption: 'Option C' }  // Correct
        ];

        const result = calculateQuizScore(userAnswers, mockAnswerKey);
        
        expect(result.score).toBe(2); // Expect score to be 2
        expect(result.detailedResults[1].isCorrect).toBe(false);
    });

    test('calculates zero score correctly', () => {
        const userAnswers = [
            { questionId: 'q1', selectedOption: 'Wrong' },
            { questionId: 'q2', selectedOption: 'Wrong' },
            { questionId: 'q3', selectedOption: 'Wrong' }
        ];

        const result = calculateQuizScore(userAnswers, mockAnswerKey);
        
        expect(result.score).toBe(0);
    });
});