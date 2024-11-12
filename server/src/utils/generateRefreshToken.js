import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/user.model.js";

dotenv.config();

const generateRefreshToken = async (userId) => {
  try {
    const token = jwt.sign({ id: userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
      expiresIn: "7d",
    });

    await UserModel.findByIdAndUpdate(
      userId,
      { refresh_token: token },
      { new: true }
    );

    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Could not generate refresh token");
  }
};

export default generateRefreshToken;
