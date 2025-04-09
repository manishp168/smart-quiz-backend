import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true
    },
    role: {
        type: String,
        default: 'student',
        enum: ['student', 'teacher'],
        required: true
    },
    semester: {
        type: String
    },
    profilePhoto: {
        type: String
    },
    accessToken: {
        type: String
    },
    lastLogin : {
        type: Date,
    }
},
{timestamps: true}
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function () {
    return await jwt.sign({
        _id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
    }, 
    process.env.JWT_SECRET, 
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id
    },
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
}

export const User = mongoose.model("User", userSchema); 