import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createQuizHandler, getQuizzesHandler, updateQuizHandler, deleteQuizHandler, generateQuizHandler, getStudentListHandler, getQuizDetails } from "../controllers/teacher.controller.js";

const router = Router();

router.route("/create-quiz").post(verifyToken, createQuizHandler);
router.route("/generate-quiz").post(verifyToken, generateQuizHandler);
router.route("/update-quiz").post(verifyToken, updateQuizHandler);
router.route("/delete-quiz").delete(verifyToken, deleteQuizHandler);
router.route("/get-quizzes").get(verifyToken, getQuizzesHandler)
router.route("/student-list").get(verifyToken, getStudentListHandler)
router.route("/quiz-details/:id").get(verifyToken, getQuizDetails)

export default router;