import type { RequestHandler } from "express";
import { google } from "googleapis";
import bcrypt from "bcryptjs";
import validator from "validator";
import { createGoogleOAuthClient } from "../config/google-oauth.js";
import {
  createUser,
  findUserByEmail,
  UserEmailAlreadyExistsError,
} from "../repositories/user-repository.js";
import { generateToken } from "../utils/jwt.js";
import type { User, PublicUser } from "../types/user.js";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";

const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  image: user.image,
  subscription: user.subscription,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const passwordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Name, email, and password are required.",
      });
      return;
    }

    const normalizedName = name.trim();
    const normalizedEmail = normalizeEmail(email);

    if (!validator.isLength(normalizedName, { min: 2, max: 100 })) {
      res.status(400).json({
        message: "Name must contain between 2 and 100 characters.",
      });
      return;
    }

    if (!validator.isEmail(normalizedEmail)) {
      res.status(400).json({
        message: "Enter a valid email address.",
      });
      return;
    }

    if (
      Buffer.byteLength(password, "utf8") > 72 ||
      !validator.isStrongPassword(password, passwordOptions)
    ) {
      res.status(400).json({
        message:
          "Password must have at least 8 characters, including uppercase, lowercase, a number, and a symbol. Maximum length is 72 bytes.",
      });
      return;
    }

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
    });

    res.status(201).json({
      message: "Account created successfully.",
      token: generateToken(user.id),
      user: toPublicUser(user),
    });
  } catch (error: unknown) {
    if (error instanceof UserEmailAlreadyExistsError) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    next(error);
  }
};

export const loginUser: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        message: "Email and password are required.",
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validator.isEmail(normalizedEmail)) {
      res.status(400).json({
        message: "Enter a valid email address.",
      });
      return;
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    const user = await findUserByEmail(normalizedEmail);

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    res.status(200).json({
      message: "Login successful.",
      token: generateToken(user.id),
      user: toPublicUser(user),
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const loginWithGoogle: RequestHandler = async (req, res, next) => {
  try {
    const { code } = req.body as { code?: unknown };

    if (typeof code !== "string" || !code.trim()) {
      res.status(400).json({
        message: "Google authorization code is required.",
      });
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
      res.status(401).json({
        message: "Google authentication failed.",
      });
      return;
    }

    oauthClient.setCredentials(tokens);

    const oauth2 = google.oauth2({
      version: "v2",
      auth: oauthClient,
    });

    const { data: profile } = await oauth2.userinfo.get();

    const email = profile.email ? normalizeEmail(profile.email) : "";
    const name = profile.name?.trim();

    if (
      profile.verified_email !== true ||
      !email ||
      !validator.isEmail(email) ||
      !name
    ) {
      res.status(401).json({
        message: "Google account information is incomplete or unverified.",
      });
      return;
    }

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({
        email,
        name,
        image: profile.picture?.trim() || null,
      });
    }

    res.status(200).json({
      message: "Google login successful.",
      token: generateToken(user.id),
      user: toPublicUser(user),
    });
  } catch (error: unknown) {
    if (error instanceof UserEmailAlreadyExistsError) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    next(error);
  }
};

export const getCurrentUser: RequestHandler = (req, res) => {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    res.status(401).json({
      message: "Authentication required.",
    });
    return;
  }

  res.status(200).json(toPublicUser(user));
};
