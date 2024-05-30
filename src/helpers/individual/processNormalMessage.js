const { EmbedBuilder, AuditLogOptionsType } = require('discord.js');

module.exports = async function (instance, member, message) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Libraries
  const powertools = Manager.require('node-powertools');

  // Set variables
  const channel = message.channel;

  // Reward for talking & handle levels, etc
  profile.reward(member, 'message', channel);

  // Determine activity
  if (process.env.ENVIRONMENT === 'development') {
    await processes['sync-roles'].execute(instance, {id: member.id})
  }

  // Only small chance of it happening
  if (powertools.random(0, 100) < 90 && Manager.assistant.meta.environment === 'production') {
    return;
  }
}
