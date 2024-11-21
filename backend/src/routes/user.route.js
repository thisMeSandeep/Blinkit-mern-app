import express from "express";
import {
  registerUserController,
  verifyEmailController,
  loginController,
  logoutController,
  uploadAvatar,
  updateUserDetails,
  forgotPasswordController,
  verifyForgotPasswordOtp,
  resetPasswordController,
  refreshToken,
  userDetails
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUserController); // for registering user
userRouter.route("/verify-email/:code").post(verifyEmailController); //for verifying email
userRouter.route("/login").post(loginController); // for login
userRouter.route("/logout").post(auth, logoutController); // for logout
userRouter
  .route("/upload-avatar")
  .put(auth, upload.single("avatar"), uploadAvatar); // uploading user avatar
userRouter.route("/update-user").put(auth, updateUserDetails);
userRouter.route("/forgot-password").post(forgotPasswordController); // forgot password
userRouter.route("/verify-forogot-password-otp").post(verifyForgotPasswordOtp); // password reset otp
userRouter.route("/reset-password").put(resetPasswordController); // reset password
userRouter.route("/refresh-token").post(refreshToken)  //refresh token
userRouter.route("/user-details").get(auth , userDetails)



export default userRouter;

//546155
