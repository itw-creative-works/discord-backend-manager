const { EmbedBuilder } = require('discord.js');

module.exports = async function (instance, member) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // If not the main server, return
  if (member.guild.id !== config.main.server) {
    return;
  }

  // Log
  assistant.log(`[guildMemberRemove] ${member.user.username}:`, );
}

