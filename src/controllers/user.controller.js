import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendMessage } from "../utils/sendInTelegram.js";

const options = {
  httpOnly: true,
  secure: false,
  sameSite: "None",
};

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return next(
      new ApiError(
        "Something went wrong while generating access token and generate token"
      )
    );
  }
};

const registerHandler = async (req, res, next) => {
  // console.log(req.body);
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(new ApiError(httpStatus.BAD_REQUEST, "all fields are required"));
    }
    const userExists = await User.findOne({
      email: email,
    });
    if (userExists) {
      return res
        .status(httpStatus.CONFLICT)
        .json(new ApiError(httpStatus.CONFLICT, "User already exists"));
    }

    // const otp = Math.floor(100000 + Math.random() * 900000);

    const userCreate = await User.create({
      name,
      email,
      password,
      isVerified: true,
      role: "student",
      semester: role,
    });

    if (!userCreate) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(new ApiError(httpStatus.CONFLICT, "error while registring user"));
    }

    const user = await User.findById(userCreate._id).select(
      "-password -accessToken"
    );

    sendMessage(
      `<b> New User Registered \n\nName: ${name} \n\nEmail: ${email} \n\nRole: ${user.role} </b>`
    );

    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, "User registered successfully", user)
      );
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "something went wrong")
      );
  }
};

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(httpStatus.CONFLICT)
        .json(
          new ApiError(
            httpStatus.CONFLICT,
            `${!email ? "Email" : "Password"} field is required`
          )
        );
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(new ApiError(httpStatus.NOT_FOUND, "User does not exists"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json(
          new ApiError(httpStatus.UNAUTHORIZED, "invalid login credentials")
        );
    }
    const accessToken = await user.generateAccessToken();

    user.lastLogin = new Date().toISOString();
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });
    const loggedInUser = await User.findById(user._id).select(
      "-password"
    );

    return res
      .status(httpStatus.OK)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(httpStatus.OK, "user loggedin successfully", loggedInUser)
      );
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "something went wrong")
      );
  }
};

const getProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, "success", user));
};

const logoutHandler = async (req, res) => {
  const logOutUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        accessToken: 1,
      },
    }, 
    {
      new: true,
    }
  );

  if (logOutUser) {
    return res
      .status(httpStatus.OK)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(httpStatus.OK, "user logged out successfully", {}));
  }
};

export { registerHandler, loginHandler, logoutHandler, getProfile };
