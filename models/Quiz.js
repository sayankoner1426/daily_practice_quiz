import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  requestedBy: { type: String, required: true },
  status: { type: String, default: 'generating' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);