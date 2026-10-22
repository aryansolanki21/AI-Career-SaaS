import type { Request, Response, NextFunction } from "express";
import type { User } from "../types/user.js";
import { verifyToken } from "../utils/jwt.js";
import { findUserById } from "../repositories/user-repository.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({ message: "Authentication token is missing." });
    return;
  }

  let decodedToken: ReturnType<typeof verifyToken>;

  try {
    decodedToken = verifyToken(token);
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
    return;
  }

  if (
    typeof decodedToken !== "object" ||
    decodedToken === null ||
    typeof decodedToken.userId !== "string" ||
    decodedToken.userId.length === 0
  ) {
    res.status(401).json({ message: "Invalid authentication token." });
    return;
  }

  try {
    const user = await findUserById(decodedToken.userId);

    if (!user) {
      res.status(401).json({ message: "User account not found." });
      return;
    }

    req.user = user;
    next();
  } catch (error: unknown) {
    next(error);
  }
};
