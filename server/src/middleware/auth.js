import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { response } from "express";

dotenv.config();

const auth = (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        message: "Bad request",
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    if (!decode) {
      return response.status(401).json({
        message: "Unauthorized access !",
        error: true,
        success: false,
      });
    }
    req.userId = decode.id;
    console.log("decode:", decode);

    next();
  } catch (err) {
    return res.status(500).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

export default auth;
