import { Router } from "express";
import {
  getLiveQuizzes,
  getQuizHandler,
  getUserQuizHistory,
  insertQuizHandler,
} from "../controllers/quiz.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/live-quizzes").get(verifyToken, getLiveQuizzes)
router.route("/quiz-history").get(verifyToken, getUserQuizHistory)
router.route("/:id").get(getQuizHandler);
router.route("/submit/:id").post(verifyToken, insertQuizHandler);
export default router;
