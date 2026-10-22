import { pool } from "../config/db.js";
import type { QueryResultRow } from "pg";
import type { User } from "../types/user.js";

export class UserEmailAlreadyExistsError extends Error {
  constructor() {
    super("A user with this email already exists.");
    this.name = "UserEmailAlreadyExistsError";
  }
}

interface UserRow extends QueryResultRow {
  id: string;
  email: string;
  name: string;
  image: string;
  subscription: Date | null;
  free_requests_used: number;
  created_at: Date;
  updated_at: Date;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<UserRow>(
    `SELECT
       id,
       email,
       name,
       image,
       subscription,
       free_requests_used,
       created_at,
       updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    subscription: row.subscription,
    freeRequestsUsed: row.free_requests_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query<UserRow>(
    `SELECT
       id,
       email,
       name,
       image,
       subscription,
       free_requests_used,
       created_at,
       updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    subscription: row.subscription,
    freeRequestsUsed: row.free_requests_used,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export interface CreateUserInput {
  email: string;
  name: string;
  image: string;
}

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (email, name, image)
       VALUES ($1, $2, $3)
       RETURNING
         id,
         email,
         name,
         image,
         subscription,
         free_requests_used,
         created_at,
         updated_at`,
      [input.email, input.name, input.image],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("Failed to create user.");
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      image: row.image,
      subscription: row.subscription,
      freeRequestsUsed: row.free_requests_used,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505" &&
      "constraint" in error &&
      error.constraint === "users_email_key"
    ) {
      throw new UserEmailAlreadyExistsError();
    }

    throw error;
  }
};
