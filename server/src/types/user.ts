export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  passwordHash: string | null;
  subscription: Date | null;
  freeRequestsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Pick<
  User,
  "id" | "name" | "email" | "image" | "subscription"
>;
