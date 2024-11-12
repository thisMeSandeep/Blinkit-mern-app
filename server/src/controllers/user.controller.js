import bcryptjs from "bcryptjs";
import UserModel from "../models/user.model.js";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";

//register user
export const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide email, name, and password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email is already registered",
        error: true,
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10); // hashing password

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
    const save = await newUser.save(); //saving data

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${newUser._id}`;

    // sending email
    try {
      await sendEmail({
        sendTo: email,
        subject: "Verify Your Email",
        html: verifyEmailTemplate(name, verifyEmailUrl),
      });
    } catch (emailError) {
      return res.status(500).json({
        message: "User registered, but failed to send verification email",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || error,
      error: true,
    });
  }
};

//verify emial controller

export const verifyEmailController = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Verification code is required",
      });
    }

    const user = await UserModel.findOne({ _id: code });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid or expired verification code",
      });
    }

    // Check if the email is already verified
    if (user.verify_email) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email is already verified",
      });
    }

    // Update the user's email verification status
    await UserModel.findByIdAndUpdate({ _id: code }, { verify_email: true });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Email verification failed!",
    });
  }
};

//login controller

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    //check email existence
    if (!user) {
      return res.status(400).json({
        message: "Email id is not available !",
        error: true,
        success: false,
      });
    }

    //check account status
    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Email id is not Active !",
        error: true,
        success: false,
      });
    }

    // password match
    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalid Password !",
        error: true,
        success: false,
      });
    }


    
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || error,
    });
  }
};
