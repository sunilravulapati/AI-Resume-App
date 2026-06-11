// apis/admin.js
import express from 'express';
import User from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { verifyToken } from '../middleware/auth.js';

import { getUsers } from '../controller/adminController.js';

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

adminRouter.get('/users', requireAdmin, getUsers);