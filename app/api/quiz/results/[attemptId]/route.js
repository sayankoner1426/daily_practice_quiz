import dbConnect from "@/lib/mongodb";
import UserAttempt from "@/models/UserAttempt";
import UserAnswer from "@/models/UserAnswer";
import Question from "@/models/Question";
import Quiz from "@/models/Quiz";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { attemptId } = await params;

    if (!attemptId) {
      return NextResponse.json(
        { error: "Attempt ID is required" },
        { status: 400 }
      );
    }

    // fetch the user attempt details
    const attempt = await UserAttempt.findById(attemptId).lean();
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // fetch Quiz details
    const quiz = await Quiz.findById(attempt.quizId).lean();
    
    // fetch all user answers
    const userAnswers = await UserAnswer.find({ userAttemptId: attemptId }).lean();
    
    // fetch all original questions
    const questionIds = userAnswers.map(ans => ans.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const questionMap = questions.reduce((map, q) => {
      map[q._id.toString()] = {
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
      };
      return map;
    }, {});

    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;

    const reviewDetails = userAnswers.map(ans => {
      const qDetail = questionMap[ans.questionId.toString()];
      
      attemptedCount++;
      if (ans.isCorrect) {
          correctCount++;
      } else {
          incorrectCount++;
      }
      
      return {
        questionId: ans.questionId,
        text: qDetail?.text,
        options: qDetail?.options, 
        selectedOption: ans.selectedOption,
        correctOption: qDetail?.correctOption,
        isCorrect: ans.isCorrect,
        explanation: qDetail?.explanation,
      };
    });

    const timeTakenSeconds = attempt.completedAt && attempt.attemptedAt
      ? Math.floor(
          (new Date(attempt.completedAt) - new Date(attempt.attemptedAt)) / 1000
        )
      : null;

    return NextResponse.json({
      success: true,
      username: attempt.username,
      subject: quiz?.subject || 'Unknown Subject',
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      attemptedCount,
      correctCount,
      incorrectCount,
      timeTakenSeconds,
      reviewDetails,
    });

  } catch (error) {
    console.error("Results Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz results" },
      { status: 500 }
    );
  }
}