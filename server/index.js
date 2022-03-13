import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import colors from "colors";
import connectDB from "./config/db.js";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRouter.js";
import productRouter from "./routes/productRouter.js";
import upload from "./routes/upload.js";

const app = express();

connectDB();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//  **** routes *****

app.use("/user", userRoutes);
app.use("/api", categoryRouter);
app.use("/api", productRouter);
app.use("/api", upload);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to devat stores" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
