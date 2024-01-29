import { GuildChannel, Message, TextChannel } from 'discord.js';
import axios, { isCancel, AxiosError } from 'axios';
import { config } from './config';
const { Client, Events, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient: { user: { tag: any } }) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.ChannelCreate, async (channel: TextChannel) => {
  if (
    !channel.parentId ||
    channel.guild.id !== `${config.SERVER_ID}` ||
    (channel.parentId && channel.parentId !== `${config.TICKET_CATEGORY_ID}`) ||
    channel.name.toLowerCase().startsWith('closed')
  ) {
    // only listen to the channels that are directly under TICKETS PENDING
    // ignore closed tickets
    return;
  }

  const ticketName = `${channel.name}`;
  const ticketDiscordUrl = `${channel.url}`;
  let teamsWebhookUrl = config.TEAMS_CARRIER_SUPPORT_HOOK_URL;

  channel.messages.fetch({ limit: 1 }).then((messages) => {
    messages.forEach((message) => console.log(message.content));
  });

  if (ticketName.toLowerCase().startsWith('1rpc')) {
    // send each ticket to its own channel on Teams
    teamsWebhookUrl = config.TEAMS_1RPC_HOOK_URL;
  }

  axios
    .post(teamsWebhookUrl, {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          contentUrl: ticketDiscordUrl,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.5',
            body: [
              {
                type: 'TextBlock',
                size: 'medium',
                weight: 'bolder',
                text: ticketName,
                style: 'heading',
              },
              {
                type: 'TextBlock',
                text: `Created on ${channel.createdAt}`,
                wrap: true,
                isSubtle: true,
              },
            ],
            actions: [
              {
                type: 'Action.OpenUrl',
                title: 'View',
                url: `${ticketDiscordUrl}`,
                role: 'button',
              },
            ],
          },
        },
      ],
    })
    .then((response) => {
      // do nothing
      if (response.status === 200) {
        console.log(`Send ${channel.name} to Teams!`);
      }
    })
    .catch((error) => console.log(error));
});

// Log in to Discord with your client's token
client.login(config.DISCORD_TOKEN);
