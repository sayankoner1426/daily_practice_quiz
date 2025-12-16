import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import Quiz from "@/models/Quiz";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { quizId } = await params;
    if (!quizId || quizId === 'undefined') {
      return NextResponse.json({ error: "Quiz ID is missing from URL" }, { status: 400 });
    }

    // check quiz status
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // return status if not ready (Loading State in Frontend)
    if (quiz.status !== 'ready') {
      return NextResponse.json({
        status: quiz.status,
        message: "Quiz is still being generated."
      }, { status: 202 });
    }

    // fetch questions without answers and explanations
    const questions = await Question.find({ quizId: quizId })
      .select('-correctOption -explanation');

    return NextResponse.json({
      quizStatus: quiz.status,
      subject: quiz.subject,
      questions: questions
    });

  } catch (error) {
    console.error("Fetch Questions Error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}