import axios from "axios";

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

/** Turns any thrown value into a message that is safe to show to the user. */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_MESSAGE,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "The request timed out. Please try again."
      : "Unable to reach the server. Check your connection and try again.";
  }

  if (error.response.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  // The server sends a readable message for validation, quota and AI errors.
  const message = error.response.data?.message;

  return typeof message === "string" && message.trim() ? message : fallback;
};
