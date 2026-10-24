import { Router } from "express";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getCurrentUser,
} from "../controllers/user-controller.js";
import { isAuth } from "../middlewares/auth-middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", loginWithGoogle);
router.get("/me", isAuth, getCurrentUser);

export default router;
