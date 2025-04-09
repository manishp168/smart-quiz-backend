import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config();

import connectDB from "./db/index.js";


connectDB().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log("App is Running");
    })
}).catch(()=> {
    console.log("ERROR")
})
