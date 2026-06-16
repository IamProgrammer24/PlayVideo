import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      username,
      password: hashedPassword,
      credits: 0,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🍪 SET TOKEN IN HTTP-ONLY COOKIE
    res.cookie("token", token, {
      httpOnly: true, // prevents JS access (XSS protection)
      secure: false, // set true in production (HTTPS)
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
