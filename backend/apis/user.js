import exp from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "dotenv";

config();

export const userRouter = exp.Router();

/*
REGISTER
*/
userRouter.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      mobile,
      password,
      role
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      mobile,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});


/*
LOGIN
*/
userRouter.post("/login", async (req, res) => {
  try {

    const { loginIdentifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        role: user.role,
        username: user.username
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});


/*
AUTH MIDDLEWARE
*/
export const authenticate = (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.role = decoded.role;

    next();

  } catch (err) {

    return res.status(401).json({
      error: "Invalid session"
    });

  }

};


/*
PROFILE ROUTE
*/
userRouter.get("/profile", authenticate, async (req, res) => {

  try {

    const user = await User
      .findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(user);

  } catch (err) {

    res.status(500).json({
      error: "Server error"
    });

  }

});


/*
LOGOUT
*/
userRouter.post("/logout", (req, res) => {

  res.clearCookie("token");

  res.json({
    message: "Logged out successfully"
  });

});