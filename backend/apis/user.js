import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { registerUser, authenticateUser } from "../services/authService.js";
import { verifyToken } from "../middleware/auth.js";

import { register, login, getProfile, updateProfile, logout } from "../controller/userController.js";

export const userRouter = express.Router();

/*
REGISTER
*/
userRouter.post("/register", register);

/*
LOGIN
*/
userRouter.post("/login", login);

/*
PROFILE ROUTE
Protected by verifyToken. Anyone logged in can access.
*/
userRouter.get("/profile", verifyToken(), getProfile);

/*
UPDATE PROFILE
*/
userRouter.put("/profile", verifyToken(), updateProfile);

/*
LOGOUT
*/
userRouter.post("/logout", logout);