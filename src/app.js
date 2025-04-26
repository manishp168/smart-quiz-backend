import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
const app = express();

const allowedOrigins = ["http://localhost:5173", "http://smart-quizz.vercel.app", "https://smart-quizz.vercel.app", "https://smartquiz-chi.vercel.app", "http://smartquiz-chi.vercel.app"];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req,res) => {
    res.send("Hello world")
});


import userRoutes from "./routes/user.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import quizRoutes from './routes/quiz.route.js'
import { errorHandler } from "./middlewares/error.middleware.js";


app.use("/api/v1/users", userRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/quiz", quizRoutes);




app.use(errorHandler);
export { app }