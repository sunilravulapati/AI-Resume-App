import User from '../models/User.js';
import { Resume } from '../models/Resume.js';

export const getUsers = async (req, res, next) => {
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
};
