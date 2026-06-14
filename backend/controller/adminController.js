import User from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { ResumeSession } from '../models/ResumeSession.js';

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

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalResumes = await Resume.countDocuments({ isDeleted: { $ne: true } });
    const totalSessions = await ResumeSession.countDocuments({});

    const recentUsers = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentUploads = await Resume.find({ isDeleted: { $ne: true } })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      message: "Admin stats fetched successfully",
      stats: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalResumes,
        totalSessions
      },
      recentUsers,
      recentUploads
    });
  } catch (err) {
    next(err);
  }
};
