import { pool } from "../config/db.js";

const HAS_ACTIVE_PRO = "(subscription IS NOT NULL AND subscription > NOW())";

/**
 * Takes one free request in a single statement, so two requests sent at the
 * same time cannot both pass the limit. Pro users are never charged.
 * Returns false when the free limit is already used up.
 */
export const reserveAiRequest = async (
  userId: string,
  freeLimit: number,
): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE users
     SET free_requests_used = free_requests_used
           + CASE WHEN ${HAS_ACTIVE_PRO} THEN 0 ELSE 1 END,
         updated_at = NOW()
     WHERE id = $1
       AND (${HAS_ACTIVE_PRO} OR free_requests_used < $2)`,
    [userId, freeLimit],
  );

  return result.rowCount === 1;
};

/** Gives a reserved request back when the AI call failed. */
export const releaseAiRequest = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users
     SET free_requests_used = GREATEST(free_requests_used - 1, 0),
         updated_at = NOW()
     WHERE id = $1
       AND NOT ${HAS_ACTIVE_PRO}`,
    [userId],
  );
};
