const { EmbedBuilder } = require('discord.js');

module.exports = async function (instance, invite) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  if (invite.guild.id === config.main.server) {
    assistant.log(`[inviteDelete] ${invite.inviter.username}: code=${invite.code}, uses=${invite.uses}`, );
    invites.get(invite.guild.id).delete(invite.code);
  }
}
