import dbConnect from "@/lib/mongodb";
import UserAttempt from "@/models/UserAttempt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Check if we have any record of this user
    const userExists = await UserAttempt.findOne({ username }).select("_id").lean();

    return NextResponse.json({ exists: !!userExists });
  } catch (error) {
    console.error("User Check Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}