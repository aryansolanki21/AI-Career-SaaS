import { User } from "../types/user.js";

export const hasProAccess = (
  user: Pick<User, "subscription">,
  now: Date = new Date(),
): boolean => {
  return (
    user.subscription !== null && user.subscription.getTime() > now.getTime()
  );
};

export const canMakeRequest = (
  user: Pick<User, "subscription" | "freeRequestsUsed">,
  freeRequestLimit = 3,
  now: Date = new Date(),
): boolean => {
  return hasProAccess(user, now) || user.freeRequestsUsed < freeRequestLimit;
};
