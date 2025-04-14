import mongoose, { mongo } from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
      type: String,
      required: true
    },
    quizTitle: {
        type: String,
        required: true
    },
    questions: [{
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['MCQ', 'TRUE/FALSE'], 
          required: true,
        },
        options: [{
          option: {
            type: String,
            required: true
          },
          isCorrect: {
            type: Boolean,
            required: true
          },
          selectedAnswer: {
            type: Boolean
          }  
        }],
        isAttempted: {
          type: Boolean,
          required: true
        }
      }],
    timeLimit: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number,
        required: true
    },
    totalCorrect: {
        type: Number,
        required: true
    },
    totalIncorrect: {
        type: Number, 
        required: true
    }

}, {timestamps: true});

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);