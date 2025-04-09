import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        // console.log(req.cookies.accessToken)
        if(!token) {
            next(new ApiError(401,"Unathorized request. token missing")); 
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
        // console.log("Decode")
        // console.log(decodedToken)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            next(new ApiError(409, "Invalid access token"));     
        }
    
        req.user = user;
        next();
    } catch (error) {
        // throw new ApiError(500, "something went wrong while verifying access token");
        next(new ApiError(500, "something went wrong while verifying access token"))
    }
}

export { verifyToken }