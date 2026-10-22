import { google } from "googleapis";

const getGoogleCredentials = (): {
  clientId: string;
  clientSecret: string;
} => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured.",
    );
  }

  return { clientId, clientSecret };
};

export const createGoogleOAuthClient = () => {
  const { clientId, clientSecret } = getGoogleCredentials();

  return new google.auth.OAuth2(clientId, clientSecret, "postmessage");
};
