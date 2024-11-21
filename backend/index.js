import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDb from "./src/config/connectDB.js";
import userRouter from "./src/routes/user.route.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;

//middlewares

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);


// routes creation

app.use('/api/user',userRouter)

//connecting to DB and listening server

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
