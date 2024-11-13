import express from "express";
import {
  registerUserController,
  verifyEmailController,
  loginController,
  logoutController,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUserController); // for registering user
userRouter.route("/verify-email/:code").post(verifyEmailController); //for verifying email
userRouter.route("/login").post(loginController); // for login
userRouter.route("/logout").post(auth,logoutController); // for logout
export default userRouter;
