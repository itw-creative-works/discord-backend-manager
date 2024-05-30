const { Role, EmbedBuilder, roleMention } = require('discord.js');

module.exports = {
  data: {
    interval: false,
    initialDelay: false,
    runInitially: true,
    // enabled: process.env.ENVIRONMENT === 'development',
    enabled: false,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Load libraries
    const fetch = Manager.require('wonderful-fetch');
    const powertools = Manager.require('node-powertools');
    const moment = Manager.require('moment');

    // Everything before this date is going to be processed
    const startDate = moment('2024-05-08T22:50:59.482Z');
    let totalAdded = 0;
    let count = -1;

    // Iterate
    Manager.Utilities().iterateCollection(function (batch, index, total) {
      return new Promise(async function(resolve, reject) {

        assistant.log(`Found ${batch.docs.length} docs in batch #${index}`,);

        // Process
        for (var i = 0; i < batch.docs.length; i++) {
          const doc = batch.docs[i];
          const data = doc.data();

          const serverId = '1237858925819461773'; // Replace 'xxx' with the actual server ID
          const memberId = data.oauth2.discord.identity.id;
          const accessToken = data.oauth2.discord.token.access_token;
          const refreshToken = data.oauth2.discord.token.refresh_token;

          const botClientId = '701375931918581810';
          const botClientSecret = 'EV9ThdU09Hfa7LCtCznwImcAiZ_5C1hK';

          const now = moment();

          // Log
          assistant.log(`Processing ${count++}/${total}`, data.auth.email, data.auth.uid, data.oauth2.discord.identity.username, memberId);

          // Check scope
          if (!data.oauth2.discord.token.scope.includes('guilds.join')) {
            assistant.log(`User ${memberId} does not have the required scope`);
            continue;
          }

          // Refresh token
          const tokens = await fetch('https://discord.com/api/v10/oauth2/token', {
            method: 'POST',
            response: 'json',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              client_id: botClientId,
              client_secret: botClientSecret,
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
            })
          })
          .then((r) => r)
          .catch((e) => {
            assistant.error(`Error refreshing token: ${e}`);
          });

          // Log tokens
          assistant.log('Tokens', tokens);

          // Skip if no tokens
          if (!tokens) {
            continue;
          }

          // Update in database
          await doc.ref.update({
            'oauth2.discord.token': tokens,
            'oauth2.discord.updated': {
              timestamp: now.toISOString(),
              timestampUNIX: now.unix(),
            },
            'oauth2.updated': {
              timestamp: now.toISOString(),
              timestampUNIX: now.unix(),
            }
          });

          // Add user to server
          await fetch(`https://discord.com/api/v10/guilds/${serverId}/members/${memberId}`, {
            method: 'PUT',
            response: 'text',
            headers: {
              'Authorization': `Bot ${process.env.DISCORD_TOKEN}` // Make sure your bot token is stored securely
            },
            body: {
              access_token: tokens.access_token,
            },
          })
          .then((r) => {
            assistant.log(`User added to guild ${serverId}`, r);
            assistant.log('Total added:', ++totalAdded);
          })
          .catch((e) => {
            assistant.error(`Error adding user to guild: ${e}`);
          })

          // Wait
          // const wait = 60000 * (powertools.random(3, 20))
          const wait = 60000 + (powertools.random(3000, 10000))
          assistant.log('Waiting', wait / 1000);
          await powertools.wait(wait);
        }
        return resolve();
      });
    }, {
      collection: 'users',
      where: [
        // ian
        // { field: 'oauth2.discord.updated.timestampUNIX', operator: '==', value: 1666848820 },
        // ian.spam
        // { field: 'oauth2.discord.updated.timestampUNIX', operator: '==', value: 1715208535 },
        // all (1715208659 = )
        { field: 'oauth2.discord.updated.timestampUNIX', operator: '<=', value: startDate.unix() },
      ],
      batchSize: 200,
      log: true,
    })

  }
}
