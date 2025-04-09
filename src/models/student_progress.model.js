import mongoose from "mongoose";

const studentProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    totalScore: { 
        type: Number, 
        required: true 
    },
    correctAnswers: { 
        type: Number, 
        required: true 
    },
    incorrectAnswers: { 
        type: Number, 
        required: true 
    },
    timeTaken: { 
        type: Number, 
        required: true 
    },
    result: { 
        type: String, 
        enum: ["Passed", "Failed"], 
        required: true 
    },
    answerDetails: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz.questions",
          required: true,
        },
        studentAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const StudentProgress = mongoose.model(
  "StudentProgress",
  studentProgressSchema
);

