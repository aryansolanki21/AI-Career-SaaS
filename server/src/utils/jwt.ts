import jwt, { SignOptions } from "jsonwebtoken";

const getJWTSecret = () => {
  const secret = process.env.JWT_SEC;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SEC must contain at least 32 characters.");
  }

  return secret;
};

export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: "15d",
    algorithm: "HS256",
  };

  return jwt.sign({ userId }, getJWTSecret(), options);
};

export const verifyToken = (token: string): jwt.JwtPayload | string => {
  return jwt.verify(token, getJWTSecret(), {
    algorithms: ["HS256"],
  });
};
