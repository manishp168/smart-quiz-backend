import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
const app = express();

app.use(cors({
    origin: "http://mr-ketan.xyz",
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