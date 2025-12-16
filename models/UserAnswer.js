import mongoose from "mongoose";

const  UserAnswerSchema = new mongoose.Schema({
    userAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "UserAttempt", required: true }, //fk
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true }, //fk
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
});

export default mongoose.models.UserAnswer || mongoose.model("UserAnswer", UserAnswerSchema);