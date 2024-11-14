import express from "express";
import {
  registerUserController,
  verifyEmailController,
  loginController,
  logoutController,
  uploadAvatar,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUserController); // for registering user
userRouter.route("/verify-email/:code").post(verifyEmailController); //for verifying email
userRouter.route("/login").post(loginController); // for login
userRouter.route("/logout").post(auth, logoutController); // for logout
userRouter.route("/upload-avatar").put(auth, upload.single("avatar"), uploadAvatar); // uploading user avatar



export default userRouter;
