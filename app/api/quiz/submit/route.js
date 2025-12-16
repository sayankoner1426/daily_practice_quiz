import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import UserAttempt from "@/models/UserAttempt";
import UserAnswer from "@/models/UserAnswer";
import { NextResponse } from "next/server";
import { calculateQuizScore } from "@/lib/quizLogic";

export async function POST(req) {
  try {
    await dbConnect();

    // accept startedAt from frontend
    const { quizId, username, answers, startedAt } = await req.json();

    // input validation
    if (!quizId || !username || !answers) {
      return NextResponse.json({ error: "Missing data (quizId, username, or answers)" }, { status: 400 });
    }

    // fetch real answers from db
    const questions = await Question.find({ quizId: quizId });
    
    const answerKey = {};
    questions.forEach(q => {
      answerKey[q._id.toString()] = q.correctOption;
    });

    const { score, detailedResults } = calculateQuizScore(answers, answerKey);
    
    // record the attempt
    const actualStartTime = startedAt ? new Date(startedAt) : new Date();

    const newAttempt = await UserAttempt.create({
      username: username,
      quizId: quizId,
      score: score,
      totalQuestions: questions.length,
      attemptedAt: actualStartTime, //actual start time
      completedAt: new Date(),      //actual end time
    });

    // link detailed answers to this attempt
    const finalAnswers = detailedResults.map(ans => ({
      ...ans,
      userAttemptId: newAttempt._id
    }));

    await UserAnswer.insertMany(finalAnswers);

    return NextResponse.json({ 
      success: true, 
      score: score, 
      total: questions.length,
      attemptId: newAttempt._id 
    });

  } catch (error) {
    console.error("Submit Error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}