import mongoose from "mongoose";

const UserAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true }, //fk
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  attemptedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export default mongoose.models.UserAttempt ||
  mongoose.model("UserAttempt", UserAttemptSchema);
