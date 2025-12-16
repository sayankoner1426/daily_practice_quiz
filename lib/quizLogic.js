/**
 * Calculates the score for a quiz submission.
 * * @param {Array} userAnswers - Array of objects { questionId, selectedOption }
 * @param {Object} answerKey - Object where keys are questionIds and values are correct options
 * @returns {Object} - { score, detailedResults }
 */
export function calculateQuizScore(userAnswers, answerKey) {
    let score = 0;
    const detailedResults = [];
  
    for (const ans of userAnswers) {
      const validAnswer = answerKey[ans.questionId];
      // Check if answer exists and matches
      const isCorrect = validAnswer && ans.selectedOption === validAnswer;
  
      if (isCorrect) score++;
  
      detailedResults.push({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect: isCorrect,
      });
    }
  
    return { score, detailedResults };
  }