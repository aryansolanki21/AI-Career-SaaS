import { pool } from "../config/db.js";
import type { QueryResultRow } from "pg";
import type { User } from "../types/user.js";

export class UserEmailAlreadyExistsError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "UserEmailAlreadyExistsError";
  }
}

interface UserRow extends QueryResultRow {
  id: string;
  email: string;
  name: string;
  image: string | null;
  password_hash: string | null;
  subscription: Date | null;
  free_requests_used: number;
  created_at: Date;
  updated_at: Date;
}

const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  image: row.image,
  passwordHash: row.password_hash,
  subscription: row.subscription,
  freeRequestsUsed: row.free_requests_used,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<UserRow>(
    `SELECT id, email, name, image, password_hash, subscription,
            free_requests_used, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  const row = result.rows[0];
  return row ? mapUser(row) : null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query<UserRow>(
    `SELECT id, email, name, image, password_hash, subscription,
            free_requests_used, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  const row = result.rows[0];
  return row ? mapUser(row) : null;
};

export interface CreateUserInput {
  email: string;
  name: string;
  image?: string | null;
  passwordHash?: string | null;
}

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (email, name, image, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, image, password_hash, subscription,
                 free_requests_used, created_at, updated_at`,
      [
        input.email,
        input.name,
        input.image ?? null,
        input.passwordHash ?? null,
      ],
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("Failed to create user.");
    }

    return mapUser(row);
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
