import dbConnect from "@/lib/mongodb";
import UserAttempt from "@/models/UserAttempt";
import Quiz from "@/models/Quiz"; 
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // fetch all attempts for the user (needed for full stats)
    const attempts = await UserAttempt.find({ username })
      .populate("quizId", "subject")
      .sort({ attemptedAt: -1 }) 
      .lean();

    if (!attempts.length) {
      return NextResponse.json({ empty: true });
    }

    // calculate stats
    // member Since (Date of first attempt of an user)
    const firstAttemptDate = attempts[attempts.length - 1].attemptedAt;

    // avg (accuracy & time)
    let totalScore = 0;
    let totalMaxScore = 0;
    let totalTimeSeconds = 0;
    let validTimeCount = 0;

    // subject tracking
    const subjectStats = {}; 
    let highestScoreVal = -1;
    let highestScoreSubject = "N/A";

    attempts.forEach(a => {
        // accuracy Stats
        totalScore += a.score;
        totalMaxScore += a.totalQuestions;

        // time Stats
        if (a.completedAt && a.attemptedAt) {
            const duration = (new Date(a.completedAt) - new Date(a.attemptedAt)) / 1000;
            if(duration > 0) {
                totalTimeSeconds += duration;
                validTimeCount++;
            }
        }

        // highest score check
        if (a.score > highestScoreVal) {
            highestScoreVal = a.score;
            highestScoreSubject = a.quizId?.subject || "General";
        }

        // subject grouping
        const subj = a.quizId?.subject || "General";
        if (!subjectStats[subj]) {
            subjectStats[subj] = { count: 0, attempts: [] };
        }
        subjectStats[subj].count++;
        subjectStats[subj].attempts.push({
            id: a._id,
            score: a.score,
            total: a.totalQuestions,
            date: a.attemptedAt
        });
    });

    // final calculations
    const avgAccuracy = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    const avgTimePerQuiz = validTimeCount > 0 ? Math.floor(totalTimeSeconds / validTimeCount) : 0;

    //find fav Sub
    let favSubject = "N/A";
    let maxPlays = -1;
    Object.entries(subjectStats).forEach(([subj, data]) => {
        if (data.count > maxPlays) {
            maxPlays = data.count;
            favSubject = subj;
        }
    });

    return NextResponse.json({
        stats: {
            memberSince: firstAttemptDate,
            avgAccuracy,
            avgTimeSeconds: avgTimePerQuiz,
            highestScore: highestScoreVal,
            highestScoreSubject,
            favoriteSubject: favSubject
        },
        subjectData: subjectStats
    });

  } catch (error) {
    console.error("History Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}