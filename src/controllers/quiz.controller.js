import { Quiz } from "../models/quiz.model.js";
import httpStatus from "http-status";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { QuizAttempt } from "../models/quiz_attempt.model.js";

const getQuizHandler = async (req, res) => {
  const quizId = req.params.id;
  if (quizId.length !== 24) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(new ApiError(httpStatus.BAD_REQUEST, "Invalid quiz id"));
  }
  try { 
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(new ApiError(httpStatus.NOT_FOUND, "Quiz not found"));
    }
    res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "Quiz found", quiz));
  } catch (error) {
    
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const insertQuizHandler = async (req, res) => {
  const user = req.user;
  const { userQuizData, title, timeLimit, timeTaken, quizId } = req.body;
  
  let totalCorrect = 0;
  let totalIncorrect = 0;

  console.log(userQuizData)
  userQuizData.forEach((question) => {
    if (question.isAttempted) {
      question.options.forEach((option) => {
        if (option.isCorrect === true && option.selectedAnswer === true) {
          totalCorrect++;
        } else if (option.isCorrect === true && option.selectedAnswer === false) {
          totalIncorrect++;
        }
      });
    } else {
      totalIncorrect++;
    }
  });

  try {
    let findQuiz = await QuizAttempt.findOne({
      studentId: user._id,
      quizId,
    });

    if (findQuiz) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(
          new ApiResponse(
            httpStatus.BAD_REQUEST,
            "You have already participated in this quiz",
            findQuiz
          )
        );
    }

    let insertQuiz = await QuizAttempt.create({
      studentId: user._id,
      quizId,
      quizTitle: title,
      questions: userQuizData,
      timeLimit: timeLimit,
      timeTaken: timeTaken === null ? 1 : timeTaken,
      totalCorrect: totalCorrect,
      totalIncorrect: totalIncorrect,
    });

    if (!insertQuiz) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(new ApiError(httpStatus.BAD_REQUEST, "Failed to submit quiz"));
    }

    let quizDetail = await Quiz.findById(quizId);
    let quizAttemptedDetails = await QuizAttempt.find({
      quizId: quizDetail._id,
    });

    let findAverageScore = await QuizAttempt.aggregate([
      {
        $match: { quizId: quizId },
      },
      {
        $group: {
          _id: "$quizId",
          averageScore: { $avg: "$totalCorrect" },
        },
      },
    ]);

    let averageScore = findAverageScore.length > 0 ? findAverageScore[0].averageScore : 0;

    let updateQuiz = await Quiz.updateOne(
      { _id: quizDetail._id },
      {
        $set: {
          totalParticipated: quizDetail.totalParticipated + 1,
          averageScore,
        },
      }
    );

    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "Quiz submitted successfully", insertQuiz));

  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "An error occurred while submitting the quiz"));
  }
};


const getLiveQuizzes = async (req, res) => {
  console.log("Yaha aarha hai");
  const user = req.user;

  try {
    const allQuizzes = await Quiz.find({ isPublished: true });
    if (allQuizzes.length <= 0) {
      return null;
    }

    const userAttemptedQuiz = await QuizAttempt.find({
      studentId: user._id,
    }).distinct("quizId").sort({createdAt: -1});

    let liveQuizzes = allQuizzes.filter(
      (quiz) => !userAttemptedQuiz.includes(quiz._id.toString())
    ).sort();

    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "success", liveQuizzes));
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

const getUserQuizHistory = async (req, res) => {
  const user = req.user;
  try {
    const history = await QuizAttempt.find({ studentId: user._id });
    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "success", history));
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};
export {
  getQuizHandler,
  insertQuizHandler,
  getLiveQuizzes,
  getUserQuizHistory,
};
