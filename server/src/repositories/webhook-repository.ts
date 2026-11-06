import { pool } from "../config/db.js";

export const recordWebhookEvent = async (
  eventId: string,
  eventType: string,
): Promise<void> => {
  await pool.query(
    `INSERT INTO webhook_events (event_id, event_type)
     VALUES ($1, $2)
     ON CONFLICT (event_id) DO NOTHING`,
    [eventId, eventType],
  );
};
