import { GoogleGenAI } from "@google/genai";
import dbConnect from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";
import { NextResponse } from "next/server";
import { cleanAndParseJSON } from "@/lib/jsonCleaner";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.topic || !body.username) {
      return NextResponse.json(
        { error: "Topic and username are required" },
        { status: 400 }
      );
    }

    // Create quiz immediately with 'generating' status
    const quiz = await Quiz.create({
      subject: body.topic,
      requestedBy: body.username,
      status: "generating",
    });

    // Start background generation
    generateQuestionsInBackground(quiz._id, body.topic);

    return NextResponse.json({
      success: true,
      quizId: quiz._id.toString(),
    });
  } catch (error) {
    console.error("Generate Route Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// --- Background Job ---
async function generateQuestionsInBackground(quizId, topic) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    //prompt
    const prompt = `Generate 10 multiple-choice questions for UPSC preparation on: "${topic}".
    
    RULES:
    1. Return ONLY a valid JSON array.
    2. No Markdown, no backticks, no explanations outside the JSON.
    3. Ensure all strings are properly escaped.
    
    JSON Structure per object:
    {
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": "Option A", 
      "explanation": "Brief explanation here"
    }`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // extract raw text from response
    let rawText = result.text; 
    
    if (typeof rawText === 'function') {
        rawText = rawText(); 
    } else if (!rawText && result.response && typeof result.response.text === 'function') {
        rawText = result.response.text(); 
    }

    if (!rawText) {
        throw new Error("AI returned empty text");
    }

    // clean and parse JSON safely
    const questions = cleanAndParseJSON(rawText);

    if (!questions || questions.length === 0) {
        throw new Error("Parsed JSON is empty or invalid");
    }

    //prepare data for DB
    const questionDocs = questions.map((q) => ({
      quizId,
      text: q.text,
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation,
    }));

    // save to DB
    await Question.insertMany(questionDocs);

    // update Quiz Status to READY
    await Quiz.findByIdAndUpdate(quizId, {
      status: "ready",
    });

    console.log(` Quiz ${quizId} generated successfully.`);

  } catch (err) {
    console.error(" Background generation failed:", err);
    await Quiz.findByIdAndUpdate(quizId, {
      status: "failed",
    });
  }
}
