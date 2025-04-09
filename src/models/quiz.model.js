import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true, // Quiz ka title required hai
    },
    description: {
      type: String, // Optional description
    },
    questions: [{
      question: {
        type: String,
        required: true, // Question text required hai
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
      }],
    }],
    timeLimit: {
      type: String,
      required: true, 
    },
    passingScore: {
      type: Number,
      
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Kis teacher ne create kiya
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false, // Quiz initially unpublished rahega
    },
    avarageScore: {
      type: Number,
      default: 0
    },
    totalParticipated: {
      type: Number,
      default: 0
    }
  }, { timestamps: true });

export const Quiz = mongoose.model("Quiz", quizSchema);