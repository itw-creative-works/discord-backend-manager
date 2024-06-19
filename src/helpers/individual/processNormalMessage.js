const { EmbedBuilder, AuditLogOptionsType } = require('discord.js');

module.exports = async function (instance, member, message) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Libraries
  const powertools = Manager.require('node-powertools');

  // Get storage
  const storage = Manager.storage({name: 'messages'});

  // Set variables
  const channel = message.channel;

  // Reward for talking & handle levels, etc
  profile.reward(member, 'message', channel);

  // Determine activity
  if (assistant.isDevelopment()) {
    await processes['sync-roles'].execute(instance, {id: member.id})
  }

  // Get messages
  const messages = storage.get(member.id, {}).value();

  // Bump total messages and channel messages
  messages.total = (messages.total || 0) + 1;
  messages[channel.id] = (messages[channel.id] || 0) + 1;

  // Clear all messages
  storage.set(member.id, messages).write();

  // Only small chance of it happening
  if (powertools.random(0, 100) < 90 && assistant.isProduction()) {
    return;
  }
}
