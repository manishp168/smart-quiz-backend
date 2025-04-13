import mongoose from "mongoose";
import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quiz_attempt.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import httpStatus from "http-status";
import OpenAI from "openai";
import { User } from "../models/user.model.js";

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

const createQuizHandler = async (req, res) => {
  // console.log(req.body);
  try {
    const { title, timer, privacy, questions } = req.body;

    if ((!title, !timer, !privacy, !questions)) {
      return res
        .status(httpStatus.CONFLICT)
        .json(new ApiError(httpStatus.CONFLICT, "All fields are required"));
    }

    let createQuiz = await Quiz.create({
      title,
      timeLimit: timer,
      isPublished: privacy === "public" ? true : false,
      createdBy: req.user._id,
      questions: questions,
    });
    if (!createQuiz) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "something went wrong")
        );
    }
    console.log("Quiz Created");
    // console.log(createQuiz);
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, "Quiz created successfully", createQuiz)
      );
  } catch (error) {
    // console.log("ERROR QUIZ: ", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "something went wrong")
      );
  }
};

const getQuizzesHandler = async (req, res) => {
  const user = req.user;
  try {
    let quizzes = await Quiz.find({ createdBy: user._id }).sort({
      createdAt: -1,
    });

    if (quizzes.length === 0) {
      return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, "No quizzes found", {
          quizzes: [],
          totalUserParticipated: 0,
          todayParticipated: 0,
        })
      );
    }

    let teacherQuizzes = quizzes.map((quiz) => quiz._id);

    const totalUserParticipated = await QuizAttempt.find({
      quizId: { $in: teacherQuizzes },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayParticipated = await QuizAttempt.find({
      quizId: { $in: teacherQuizzes },
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    return res.status(httpStatus.OK).json(
      new ApiResponse(httpStatus.OK, "Quizzes fetched", {
        quizzes,
        totalUserParticipated: totalUserParticipated.length,
        todayParticipated: todayParticipated.length,
      })
    );
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

const updateQuizHandler = async (req, res) => {
  try {
    const { id, title, timer, privacy, questions } = req.body;

    if ((!title, !timer, !privacy, !questions)) {
      return res
        .status(httpStatus.CONFLICT)
        .json(new ApiError(httpStatus.CONFLICT, "All fields are required"));
    }

    let updateQuiz = await Quiz.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          timeLimit: timer,
          isPublished: privacy === "public" ? true : false,
          createdBy: req.user._id,
          questions: questions,
        },
      },
      {
        new: true,
      }
    );
    if (!updateQuiz) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(new ApiError(httpStatus.NOT_FOUND, "quiz not found"));
    }
    console.log("Quiz Updated");
    // console.log(updateQuiz);
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, "Quiz updated successfully", updateQuiz)
      );
  } catch (error) {
    // console.log("ERROR QUIZ: ", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "something went wrong")
      );
  }
};

const deleteQuizHandler = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    let deleteQuiz = await Quiz.findByIdAndDelete(id);

    if (!deleteQuiz) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(new ApiError(httpStatus.NOT_FOUND, "quiz not deleted"));
    }
    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "Quiz deleted successfully", null));
  } catch (error) {
    // console.log(error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "something went wrong")
      );
  }
};

const generateQuizHandler = async (req, res) => {
  const { topic, difficulty, mcqQuestions, trueFalseQuestions } = req.body;

  if (!topic || !difficulty || !mcqQuestions || !trueFalseQuestions) {
    return res
      .status(httpStatus.CONFLICT)
      .json(new ApiError(httpStatus.CONFLICT, "All fields are required"));
  }
  const prompt = `
You are an expert quiz generator. Generate ${mcqQuestions} multiple-choice questions (MCQs) and ${trueFalseQuestions} true/false questions on the topic of "${topic}" with a difficulty level of "${difficulty}".

For MCQs:
- Each question must have **4 options** with only **one correct answer**.
- **Ensure the correct answer appears in a truly random position**. Use internal logic to simulate randomness, like assigning a random index from 0–3 for the correct answer in each question.
- Avoid patterns like always placing the correct answer first. You must shuffle hard.

For TRUE/FALSE:
- Each question must have **2 options**: "TRUE" and "FALSE", with only one correct answer randomly assigned as either TRUE or FALSE.

Format the response as a **JSON array**, where each question is an object.

Each question object must include:
- "question": The question text.
- "type": Either "MCQ" or "TRUE/FALSE".
- "options": An array of objects with:
  - "option": The text of the option.
  - "isCorrect": Boolean (true only for the correct answer)

Ensure the correct option index is **evenly distributed** across MCQs. For example, avoid making 6 out of 8 questions have the correct answer in the same index.

Return only the final JSON array. No explanations or notes. Keep it clean and production-ready.
`;


  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "" },
        { role: "user", content: prompt },
      ],
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 5096,
      top_p: 1,
    });

    // console.log("CONTENT", response.choices[0].message.content);
    // console.log("RESPONSE", response);

    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(
          httpStatus.OK,
          "Quiz generated successfully",
          response.choices[0].message.content
        )
      );
  } catch (error) {
    // console.log(error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "something went wrong")
      );
  }
};

const getStudentListHandler = async (req, res) => {
  try {
    const studentList = await User.find({ role: "student" });

    res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "fetched", studentList));
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

const getQuizDetails = async (req, res) => {
  const id = req.params.id;

  const quizData = await QuizAttempt.find({ quizId: id }).populate("studentId", "name");
  // console.log(quizData)
  if (!quizData) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(new ApiError(httpStatus.NOT_FOUND, "Quiz not found"));
  }

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, "success", quizData));
};
export {
  createQuizHandler,
  getQuizzesHandler,
  updateQuizHandler,
  deleteQuizHandler,
  generateQuizHandler,
  getStudentListHandler,
  getQuizDetails,
};
