import mongoose from "mongoose";

console.log(process.env.PORT)
const connectDB = async() => {
        try {
            const connect = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
            console.log(`DATABASE CONNECTED`);
        } catch (error) {
            console.log("Error While Connection Database", error);
            process.exit(1);
        }
}

export default connectDB;