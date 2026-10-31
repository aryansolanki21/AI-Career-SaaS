import {
  releaseAiRequest,
  reserveAiRequest,
} from "../repositories/ai-usage-repository.js";
import { HttpError } from "./http-error.js";

export const FREE_REQUEST_LIMIT = 3;

export class AiQuotaExceededError extends HttpError {
  constructor() {
    super(
      `You have used all ${FREE_REQUEST_LIMIT} free requests. Upgrade to Pro to continue.`,
      403,
    );
  }
}

// Counts one request against the user's quota and refunds it if the task fails.
export const runWithAiQuota = async <T>(
  userId: string,
  task: () => Promise<T>,
): Promise<T> => {
  const reserved = await reserveAiRequest(userId, FREE_REQUEST_LIMIT);

  if (!reserved) {
    throw new AiQuotaExceededError();
  }

  try {
    return await task();
  } catch (error: unknown) {
    await releaseAiRequest(userId).catch((refundError: unknown) => {
      console.error("Failed to refund an AI request:", refundError);
    });

    throw error;
  }
};
