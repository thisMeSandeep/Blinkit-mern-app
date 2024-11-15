import bcryptjs from "bcryptjs";
import UserModel from "../models/user.model.js";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import generateOtp from "../utils/generateOtp.js";
import verifyOtpTemplate from "../utils/verifyOtpTemplate.js";

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

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    // Check email existence
    if (!user) {
      return res.status(400).json({
        message: "Email id is not available!",
        error: true,
        success: false,
      });
    }

    // Check account status
    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Email id is not active!",
        error: true,
        success: false,
      });
    }

    // Password match
    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalid password!",
        error: true,
        success: false,
      });
    }

    // Generating tokens
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    };

    // Sending tokens to cookies
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

//logout controller

export const logoutController = async (req, res) => {
  try {
    const userId = req.userId; // middleware
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    };
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    }); // removing refresh token once the user logout

    return res.status(200).json({
      message: "Logout succesfull",
      success: true,
      error: false,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};

//uploader user avatar

export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId; // auth middlware
    const image = req.file; // multer middleware

    const upload = await uploadImageClodinary(image);

    await UserModel.findByIdAndUpdate(userId, {
      avatar: upload.url,
    });

    return res.json({
      message: "upload profile",
      success: true,
      error: false,
      data: {
        _id: userId,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//update user details

export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId; //auth middleware
    const { name, email, mobile, password } = req.body;
    let hashPassword = "";
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }
    const updateUser = await UserModel.updateOne(
      { _id: userId },
      {
        ...(name && { name: name }),
        ...(email && { email: email }),
        ...(mobile && { mobile: mobile }),
        ...(password && { password: hashPassword }),
      }
    );
    return res.json({
      message: "Updated successfully",
      error: false,
      success: true,
      data: updateUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

// password forgot

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email is not registered!",
      });
    }

    // If refresh token is available, it means user is already logged in
    if (user.refresh_token) {
      return res.status(400).json({
        message: "Bad request!",
      });
    }

    const otp = generateOtp();
    const otpExpireTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour from now

    // Update user with OTP and expiration time
    await UserModel.updateOne(
      { email },
      {
        forgot_password_otp: otp,
        forgot_password_expiry: new Date(otpExpireTime).toISOString(),
      }
    );

    const otpEmail = {
      sendTo: email,
      subject: "Password reset OTP",
      html: verifyOtpTemplate(user.name, otp),
    };

    // Send email asynchronously
    await sendEmail(otpEmail);

    return res.status(200).json({
      message: "OTP has been sent to your email",
      success: true,
      error: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
      error: true,
    });
  }
};

// password reset otp verification

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Please provide both email and OTP!",
        success: false,
        error: true,
      });
    }

    const user = await UserModel.findOne({ email, forgot_password_otp: otp });

    if (!user) {
      return res.status(400).json({
        message: "Email and OTP did not match!",
        success: false,
        error: true,
      });
    }

    const currentTime = new Date();

    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "OTP is expired",
        error: true,
        success: false,
      });
    }

    await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: "",
      forgot_password_expiry: "",
    });

    return res.status(200).json({
      message:
        "OTP verified successfully. Please proceed to reset your password.",
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
      error: true,
    });
  }
};




// Password reset function

export const resetPasswordController = async (req, res) => {
  try {
    const { email, newPassword ,confirmPassword} = req.body;

    // Validate input
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Please provide both email and  password!",
        success: false,
        error: true,
      });
    }

    if(newPassword !== confirmPassword){
      return res.status(400).json({
        message: "Password did not match!",
        success: false,
        error: true,
      });
    }

    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found!",
        success: false,
        error: true,
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(newPassword, saltRounds);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful!",
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error!",
      success: false,
      error: true,
    });
  }
};


//refresh token controler
export async function refreshToken(req,res){
  try {
      const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

      if(!refreshToken){
          return res.status(401).json({
              message : "Invalid token",
              error  : true,
              success : false
          })
      }

      const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

      if(!verifyToken){
          return res.status(401).json({
              message : "token is expired",
              error : true,
              success : false
          })
      }

      const userId = verifyToken?._id

      const newAccessToken = await generateAccessToken(userId)

      const cookiesOption = {
          httpOnly : true,
          secure : true,
          sameSite : "None"
      }

      res.cookie('accessToken',newAccessToken,cookiesOption)

      return res.json({
          message : "New Access token generated",
          error : false,
          success : true,
          data : {
              accessToken : newAccessToken
          }
      })


  } catch (error) {
      return res.status(500).json({
          message : error.message || error,
          error : true,
          success : false
      })
  }
}

//get login user details
export async function userDetails(req,res){
  try {
      const userId  = req.userId

      console.log(userId)

      const user = await UserModel.findById(userId).select('-password -refresh_token')

      return res.json({
          message : 'user details',
          data : user,
          error : false,
          success : true
      })
  } catch (error) {
      return res.status(500).json({
          message : "Something is wrong",
          error : true,
          success : false
      })
  }
}