import express from "express";
import User from "../models/User.js";
import { registerUser, authenticateUser } from "../services/authService.js";
import { verifyToken } from "../middleware/auth.js"; // Make sure auth.js exists!

export const userRouter = express.Router();

/*
REGISTER
*/
userRouter.post("/register", async (req, res) => {
  try {
    await registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Registration failed" });
  }
});

/*
LOGIN
*/
userRouter.post("/login", async (req, res) => {
  try {
    const { token, user } = await authenticateUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Login failed" });
  }
});

/*
PROFILE ROUTE
Protected by verifyToken. Anyone logged in can access.
*/
userRouter.get("/profile", verifyToken(), async (req, res) => {
  try {
    // verifyToken attaches the decoded token to req.user
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/*
LOGOUT
*/
userRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});