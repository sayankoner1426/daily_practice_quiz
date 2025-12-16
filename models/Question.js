import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true }, //fk
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: String, required: true },
  explanation: { type: String },
});

export default mongoose.models.Question ||
  mongoose.model("Question", QuestionSchema);
