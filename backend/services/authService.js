import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const registerUser = async (userObj) => {
    const existingUser = await User.findOne({ 
        $or: [{ email: userObj.email }, { username: userObj.username }] 
    });
    
    if (existingUser) {
        const err = new Error("User already exists with that email or username");
        err.status = 409;
        throw err;
    }

    const userDoc = new User(userObj);
    userDoc.password = await bcrypt.hash(userDoc.password, 12);
    
    const created = await userDoc.save();
    const newUser = created.toObject();
    delete newUser.password;
    
    return newUser;
};

export const authenticateUser = async ({ loginIdentifier, password }) => {
    const user = await User.findOne({ 
        $or: [{ email: loginIdentifier }, { username: loginIdentifier }] 
    });
    
    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
    }

    // You can add the isActive check here later!

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const userObj = user.toObject();
    delete userObj.password;
    
    return { token, user: { id: userObj._id, role: userObj.role, username: userObj.username } };
};