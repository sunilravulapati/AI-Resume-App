// apis/admin.js
import express from 'express';
import User from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { verifyToken } from '../middleware/auth.js';

export const adminRouter = express.Router();

function requireAdmin(req, res, next) {
  // verifyToken() returns a middleware function — invoke the factory first
  const middleware = verifyToken();
  middleware(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied — admins only.' });
    }
    next();
  });
}

adminRouter.get('/users', requireAdmin, async (req, res, next) => {
  try {
    // Fetch all users (exclude password)
    const users = await User
      .find({})
      .select('-password')
      .lean();

    // For each user, fetch their resumes (only the fields the dashboard needs)
    const usersWithResumes = await Promise.all(
      users.map(async (user) => {
        const resumes = await Resume
          .find({ userId: user._id })
          .select('_id atsScore matchScore analysisMode roleName company createdAt feedback.summary')
          .sort({ createdAt: -1 })
          .lean();

        return { ...user, resumes };
      })
    );

    res.status(200).json({ message: "Users fetched successfully", users: usersWithResumes });
  } catch (err) {
    next(err);
  }
});