import type { RequestHandler } from "express";
import { google } from "googleapis";
import { createGoogleOAuthClient } from "../config/google-oauth.js";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user-repository.js";
import { generateToken } from "../utils/jwt.js";
import type { PublicUser } from "../types/user.js";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";

export const loginUser: RequestHandler = async (req, res, next) => {
  try {
    const { code } = req.body as { code?: unknown };

    if (typeof code !== "string" || !code.trim()) {
      res
        .status(400)
        .json({ message: "Google authorization code is required." });
      return;
    }

    const oauthClient = createGoogleOAuthClient();

    let tokens;

    try {
      ({ tokens } = await oauthClient.getToken(code));
    } catch (error: unknown) {
      const response =
        typeof error === "object" && error !== null && "response" in error
          ? error.response
          : undefined;

      const status =
        typeof response === "object" &&
        response !== null &&
        "status" in response
          ? response.status
          : undefined;

      if (status === 400 || status === 401) {
        res.status(401).json({
          message: "Google authorization code is invalid or expired.",
        });
        return;
      }

      next(error);
      return;
    }

    if (!tokens.access_token) {
      res.status(401).json({ message: "Google authentication failed." });
      return;
    }

    oauthClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauthClient });
    const { data: profile } = await oauth2.userinfo.get();

    const email = profile.email?.trim().toLowerCase();
    const name = profile.name?.trim();
    const image = profile.picture?.trim();

    if (profile.verified_email !== true || !email || !name || !image) {
      res.status(401).json({
        message: "Google account information is incomplete or unverified.",
      });
      return;
    }

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({ email, name, image });
    }

    const token = generateToken(user.id);

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      subscription: user.subscription,
    };

    res.status(200).json({
      message: "User logged in successfully.",
      token,
      user: publicUser,
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const myProfile: RequestHandler = (req, res, next) => {
  const authenticatedRequest = req as AuthenticatedRequest;
  const user = authenticatedRequest.user;

  if (!user) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    subscription: user.subscription,
  };

  res.status(200).json(publicUser);
};
