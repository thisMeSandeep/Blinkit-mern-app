import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/user.model";
dotenv.config();

const generateRefreshToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: "7d",
  });

  const upgradeRefreshTokenUSer = await UserModel.findByIdAndUpdate(
    { userId },
    { refresh_token: token }
  );

  return token;
};

export default generateRefreshToken;
