import express from "express";
import {
  registerUserController,
  verifyEmailController,
  loginController,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUserController); // for registering user
userRouter.route("/verify-email/:code").post(verifyEmailController); //for verifying email
userRouter.route("/login").post(loginController);  // for login 

export default userRouter;
 