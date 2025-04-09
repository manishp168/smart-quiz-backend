import { Router } from "express";
import { getProfile, loginHandler, logoutHandler, registerHandler } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerHandler);
router.route("/login").post(loginHandler);
router.route("/logout").get(verifyToken, logoutHandler);
router.route("/profile").get(verifyToken, getProfile)

export default router;