export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  subscription: Date | null;
  freeRequestsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Pick<
  User,
  "id" | "name" | "email" | "image" | "subscription"
>;
