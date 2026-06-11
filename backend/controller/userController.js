import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { registerUser, authenticateUser } from "../services/authService.js";

export const register = async (req, res) => {
  try {
    await registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { token, user } = await authenticateUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Login failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    // verifyToken attaches the decoded token to req.user
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, mobile, githubUrl, linkedinUrl, languages, preferredRoles } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validate firstName and lastName
    if (firstName && !/^[A-Za-z]+$/.test(firstName)) {
      return res.status(400).json({ error: "First Name must contain only alphabets" });
    }
    if (lastName && !/^[A-Za-z]+$/.test(lastName)) {
      return res.status(400).json({ error: "Last Name must contain only alphabets" });
    }

    // Validate username
    if (username && !/^[A-Za-z][A-Za-z0-9]*$/.test(username)) {
      return res.status(400).json({ error: "Username must start with a letter and contain only letters/numbers" });
    }

    // Validate email
    if (email && email !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }
      // Check duplicate email
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email is already taken" });
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      // Check duplicate username
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: "Username is already taken" });
      }
      user.username = username;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (mobile) user.mobile = mobile;

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(password, 12);
    }

    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (languages !== undefined) {
      user.languages = Array.isArray(languages) ? languages : languages.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (preferredRoles !== undefined) {
      user.preferredRoles = Array.isArray(preferredRoles) ? preferredRoles : preferredRoles.split(",").map(s => s.trim()).filter(Boolean);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.json({ message: "Profile updated successfully", user: userObj });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  res.json({ message: "Logged out successfully" });
};
