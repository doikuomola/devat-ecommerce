import express from "express";
import { userController } from "../controllers/userControllers.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logout);
router.get("/refresh_token", userController.refreshToken);
router.get("/Infor", auth, userController.getUser);

export default router;
