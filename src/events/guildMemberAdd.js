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
  const hangout = await helpers.getOfficialServerChannel('chat.hangout');
  const guidelines = await helpers.getOfficialServerChannel('information.guidelines')

  // Public message
  const publicMessage = new EmbedBuilder()
    .setColor(config.colors.blue)
    .setTitle(`Welcome to ${Manager.config.brand.name}!`)
    .setDescription(``
      + `Hey, **${helpers.displayMember(member, true)}**, we're so happy that you could join us!\n`
      + `\n`
      + `Please familiarize yourself with our ${guidelines} so you understand our rules and learn what this server is about.\n`
      + `\n`
      + `Thank you and enjoy your stay! ${config.emojis.mascot}\n`
    )
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
        .setDescription(``
          + `Hi, **${member}**, welcome to the official ${config.emojis.mascot} **${Manager.config.brand.name} Discord server**! ${config.emojis.mascot}\n`
          + `\n`
          + `**${Manager.config.brand.name}** is not just *another* Discord server. We have:\n`
          + `  ${config.messages.welcome.private.bullets.join(' \n  ')}\n`
          + `\n`
          + `**Get started**\n`
          + `  **1.** Get our app: [${Manager.config.brand.name}](${config.messages.welcome.private.getAppUrl}?aff=discord-dm)\n`
          + `  **2.** Read our Server rules: ${guidelines} \n`
          + `  **3.** Introduce yourself in our hangout channel: ${hangout}.\n`
          + `\n`
          + `We sincerely hope you enjoy your stay in our community!\n`
          + `\n`
          // + `**:partying_face: Special Offer :partying_face:**\n`
          // + `Stay in the **${Manager.config.brand.name} Discord server** for **7 days** and you'll automatically get free **${Manager.config.brand.name} Premium** (1 week)!\n`
        )
        .setTimestamp()
    ]
  });

  // Add roles
  if (!member.user.bot) {
    member.roles.add(config.roles.member)
  }
}

