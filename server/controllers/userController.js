import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createNotification } from "./notificationController.js";

// ─── Generate a unique referral code ───
const generateReferralCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "A1B2C3D4"
    exists = await User.findOne({ referralCode: code });
  }

  return code;
};

// GET LOGGED IN USER (fresh data)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        credits: user.credits,
        plan: user.plan,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again",
    });
  }
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      !username ||
      username.trim().length < 3 ||
      username.trim().length > 20
    ) {
      return res
        .status(400)
        .json({ message: "Username must be 3–20 characters" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

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

    // ─── Handle referral ───
    const { referralCode } = req.body;
    let referrer = null;
    const BASE_SIGNUP_CREDITS = 5;
    let signupBonus = BASE_SIGNUP_CREDITS; // every new user gets 5 by default

    if (referralCode) {
      referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
      });

      // only valid if referrer exists and hasn't hit the cap
      if (referrer && referrer.referralCount < 2) {
        signupBonus += 5; // +5 more on top of base = 10 total
      } else {
        referrer = null; // invalid/maxed out referral — ignore silently
      }
    }

    const newReferralCode = await generateReferralCode();

    const user = await User.create({
      username,
      password: hashedPassword,
      credits: signupBonus,
      referralCode: newReferralCode,
      referredBy: referrer ? referrer._id : null,
    });

    // ─── Reward the referrer ───
    if (referrer) {
      referrer.credits += 10;
      referrer.referralCount += 1;
      await referrer.save();

      // ─── Notify referrer ───
      await createNotification({
        userId: referrer._id,
        type: "referral_reward",
        title: "Referral Reward! 🎉",
        message: `${username} joined using your referral link. You earned 10 credits!`,
        link: "/referrals",
      });
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        credits: user.credits,
      },
      referralBonus: referrer
        ? `You got ${signupBonus} credits (5 base + 5 referral bonus)!`
        : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: "Something went wrong. Please try again",
    });
  }
};

// ─── GET REFERRAL STATS ───
export const getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "referralCode referralCount credits",
    );

    const referredUsers = await User.find({ referredBy: req.user._id }).select(
      "username createdAt",
    );

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      maxReferrals: 2,
      referredUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
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
        message: "Invalid Username or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Username or Password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🍪 SET TOKEN IN HTTP-ONLY COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        credits: user.credits,
        plan: user.plan,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again" });
  }
};
