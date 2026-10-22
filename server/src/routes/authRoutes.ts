import express from "express";
import { loginUser, myProfile } from "../controllers/user-controller.js";
import { isAuth } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);

export default router;
