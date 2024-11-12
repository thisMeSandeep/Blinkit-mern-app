import express from "express";
import {
  registerUserController,
  verifyEmailController,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUserController); // for registering user
userRouter.route("/verify-email/:code").post(verifyEmailController);

export default userRouter;
