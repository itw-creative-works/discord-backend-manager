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
  assistant.log(`[guildMemberAdd] ${member.user.username}:`, );

  // Get the welcome channel
  const welcome = await helpers.getOfficialServerChannel('information.welcome')
  // const commands = await helpers.getOfficialServerChannel('admins.commands')

  // Public message
  const publicMessage = new EmbedBuilder()
    .setColor(config.colors.blue)
    .setTitle(`Welcome to ${Manager.config.brand.name}!`)
    .setDescription(await config.messages.welcome.public(member))
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()

  // Get invites
  helpers.getMemberInvite(member)
  .then((invite) => {
    if (invite.inviter) {
      publicMessage.setFooter({
        text: `Invited by @${helpers.displayMember(invite.inviter, false)} • ${invite.total} invites`,
        iconURL: invite.inviter.user.displayAvatarURL(),
      });
    }

    welcome.send({ embeds: [publicMessage] });
  })

  // DM
  member.send({
    embeds: [
      new EmbedBuilder()
        .setColor(config.colors.blue)
        .setTitle(`Welcome to ${Manager.config.brand.name}!`)
        .setDescription(await config.messages.welcome.private(member))
        .setTimestamp()
    ]
  });

  // Add roles
  if (!member.user.bot) {
    member.roles.add(config.roles.member)
  }
}

