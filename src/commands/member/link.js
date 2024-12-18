const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: [
    new SlashCommandBuilder()
      .setName('link')
      .setDescription('Link your account to Discord')
  ],
  options: {
  },
  settings: {
  },
  execute: async (instance, event) => {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Set shortcuts
    const interaction = event.interaction;

    // Retrieve Firebase account
    const account = await helpers.getFirebaseAccount(interaction.member.id);

    const embeds = new EmbedBuilder()
      .setColor(config.colors.blue)
      .setTitle(`Link your ${Manager.config.brand.name} account`)
      .setDescription(
        `${config.emojis.mascot} **Hey, ${helpers.displayMember(interaction.member)}**, linking your account is easy! Click the button below to start the process.\n\n`
      )
    const components = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Link your Account')
          .setStyle(ButtonStyle.Link)
          .setURL(`${instance.app.url}/account/#connectedAccounts`)
      )

    // Check if account is already linked
    if (account.auth.uid) {
      // Reply with the response embed
      return interaction.editReply({
        content: '',
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.green)
            .setTitle(`Your ${Manager.config.brand.name} account is already linked`)
            .setDescription(
              `${config.emojis.mascot} Hey, **${helpers.displayMember(interaction.member)}**, you have already linked your ${Manager.config.brand.name} account with Discord.\n\n`
              + `Type the ${helpers.displayCommand('account')} command for details.\n`
            )
        ],
      });
    }

    // Try to send a DM for account linking
    try {
      // Send the message
      await interaction.member.send({
        embeds: [embeds],
        components: [components],
      });

      // Edit reply
      return interaction.editReply({
        content: '',
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.blue)
            .setTitle(`Link your ${Manager.config.brand.name} account`)
            .setDescription(`${config.emojis.mascot} Thanks, **${helpers.displayMember(interaction.member)}**, I have sent you a DM with instructions on how to link your ${Manager.config.brand.name} account to Discord!`)
        ],
      });
    } catch (e) {
      assistant.error('Failed to send account linking DM:', e);

      // Set response embed
      // response
      //   .setColor(config.colors.blue)
      //   .setTitle('Linking failed')
      //   .setDescription(`${config.emojis.mascot} Hey, **${helpers.displayMember(interaction.member)}**, please enable DMs so I can send you the ${Manager.config.brand.name} account linking guide.`);

      // Reply with the response embed
      return interaction.editReply({
        content: '',
        embeds: [embeds],
        components: [components],
      });
    }
  },
};
