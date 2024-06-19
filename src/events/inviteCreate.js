const { EmbedBuilder } = require('discord.js');

module.exports = async function (instance, invite) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  if (invite.guild.id === config.main.server) {
    assistant.log(`[inviteCreate] ${invite?.inviter?.username}: code=${invite.code}, uses=${invite.uses}`, );

    // Get existing invites
    const existing = invites.get(invite.guild.id);

    // If invite doesn't exist, quit here
    if (!existing) {
      return;
    }

    // Set invite in existing
    existing.set(invite.code, invite.uses);
  }
}
