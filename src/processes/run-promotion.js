const ITW_SERVER = '639607263098699779';

module.exports = {
  data: {
    interval: 3.6e+6 * 8, // 1 hours
    runInitially: true,
    initialDelay: false, // 1 hour
    enabled: true,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Load libraries
    const _ = Manager.require('lodash');
    const powertools = Manager.require('node-powertools');

    // If promotion is disabled, quit here
    if (!config.settings.promotion.enabled) {
      assistant.log('Promotion is disabled');
      return;
    }

    // Log
    assistant.log(`🎉 Running promotion`);

    // Set variables
    const allGuilds = [];
    let totalReach = 0;

    // Loop through all guilds
    client.guilds.cache
      .forEach((guild) => {
        // Log member count
        // assistant.log(`🏰 ${guild.name} (${guild.id})`, guild.memberCount);

        // Get invites for each server
        // guild.invites.fetch()
        // .then((invites) => {
        //   // Invites is a map, eget the first one
        //   assistant.log('📣 Invite', invites.first().id);
        // })

        // If guild is the official server, quit here
        if (
          guild.id === config.main.server
          || guild.id === ITW_SERVER
        ) {
          return;
        }

        // Add to total reach
        totalReach += guild.memberCount;

        // Add to all guilds
        allGuilds.push(guild);
      });

    // If no guilds found, quit here
    if (allGuilds.length === 0) {
      assistant.log('No guilds found');
      return;
    }

    // Get a random guild
    const chosenGuild = powertools.random(allGuilds);

    // Log total reach
    assistant.log(`Total reach: ${totalReach}`);

    // Log chosen guild
    assistant.log(`Chosen guild: ${chosenGuild.name} (${chosenGuild.id}) with reach ${chosenGuild.memberCount}`);

    // Get members for chosen guild
    const chosenGuildMembers = [];

    // Fetch members
    await chosenGuild.members.fetch()
    .then((members) => {
      members.forEach((member) => {
        const isHighMemberCount = chosenGuild.memberCount > 10;
        const username = member.user.username;

        // Skip bots
        if (member.user.bot) {
          // assistant.log('--- Skipping bot', username);
          return;
        }

        // Skip moderators and above
        // Skip roles ONLY if member count is high
        if (isHighMemberCount) {
          if (member.permissions.has('MANAGE_GUILD')) {
            // assistant.log('--- Skipping moderator', username);
            return;
          }

          // Skip Admin
          if (member.permissions.has('ADMINISTRATOR')) {
            // assistant.log('--- Skipping admin', username);
            return;
          }
        }

        // Push member
        chosenGuildMembers.push(member);
      });
    });

    // Log chosen guild members
    assistant.log(`Viable members: ${chosenGuildMembers.length}`);

    // Hangout channel
    const guidelinesChannel = await helpers.getOfficialServerChannel(config.channels?.information?.guidelines);

    // Invite
    const invite = await guidelinesChannel.createInvite({
      temporary: false,
      maxAge: 0,
      maxUses: 0,
      unique: false,
    })

    // Loop through members
    for (let i = 0; i < chosenGuildMembers.length; i++) {
      const member = chosenGuildMembers[i];
      const inviteUrl = `https://discord.com/invite/${invite.code}`;

      // Log member
      assistant.log(`📣 Promoting to ${member.user.username} (${member.user.id}) with url ${inviteUrl}`);

      // Send message
      member.send({
        content: ``
          + `Hi, **${member}**, we want to invite you to to the ${config.emojis.mascot} **${Manager.config.brand.name} Discord server**! ${config.emojis.mascot}\n`
          + `\n`
          + `**${Manager.config.brand.name}** is not just *another* Discord server. We have:\n`
          + `  ${config.messages.welcome.private.bullets.join(' \n  ')}\n`
          + `\n`
          + `Come see what all the hype is about!\n`
          + `\n`
          + `${inviteUrl}`
      });
    }
  }
}
