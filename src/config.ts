import dotenv from 'dotenv';

dotenv.config();

const { DISCORD_TOKEN, SERVER_ID, TICKET_CATEGORY_ID, TEAMS_CARRIER_SUPPORT_HOOK_URL, TEAMS_1RPC_HOOK_URL } =
  process.env;

if (!DISCORD_TOKEN || !SERVER_ID || !TICKET_CATEGORY_ID || !TEAMS_CARRIER_SUPPORT_HOOK_URL || !TEAMS_1RPC_HOOK_URL) {
  throw new Error('Missing environment variables');
}

export const config = {
  DISCORD_TOKEN,
  SERVER_ID,
  TICKET_CATEGORY_ID,
  TEAMS_CARRIER_SUPPORT_HOOK_URL,
  TEAMS_1RPC_HOOK_URL,
};
