const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: [
    new ContextMenuCommandBuilder()
      .setName('Delete all messages')
      .setType(ApplicationCommandType.User)
  ],
  options: {
  },
	settings: {
		// command: 'delete-all-messages',
	},
	execute: async (instance, event) => {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Set shortcuts
		const interaction = event.interaction;
		const subcommand = event.subcommand;
		const options = event.options;

    // Log
		assistant.log('context-menu/user/delete-all-messages', options);

    // Setup
    const userId = interaction.targetId;
    const user = await client.users.fetch(userId);
    const guild = interaction.guild
    const now = Date.now()
    const maxAge = now - 60 * 24 * 60 * 60 * 1000; // 60 days

    let deletedCount = 0
    let scannedChannels = 0

    assistant.log('delete-all-messages', `Starting message deletion for user ${userId} in guild ${guild.id}`)

		// Handle Clearing by fetching al messages from the user across all channels
    for (const channel of guild.channels.cache.values()) {
      const id = channel.id;
      const name = channel.name;
      const combo = `${name} (${id})`;

      // Quit if not a text channel
      if (channel.type !== ChannelType.GuildText) {
        assistant.log('delete-all-messages', `Skipping channel ${combo} as it is not a text channel`);
        continue;
      }

      // Quit if user to delete doesn't have access to view the channel
      if (!channel.permissionsFor(user).has(PermissionsBitField.Flags.ViewChannel)) {
        assistant.log('delete-all-messages', `Skipping channel ${combo} as user ${userId} does not have access`);
        continue;
      }

      // Log channel
      assistant.log('delete-all-messages', `Scanning channel ${combo} for user ${userId}`);

      // Increment scanned channels
      scannedChannels += 1;

      try {
        // Fetch messages
        const messages = await channel.messages.fetch({ limit: 100 });

        // Filter messages from the user and within the last 30 days
        const clear = messages.filter(m => m.author.id === userId && m.createdTimestamp >= maxAge);

        // Clear messages
        await channel.bulkDelete(clear);
        deletedCount += clear.size;
      } catch (error) {
        assistant.log('delete-all-messages', `Error processing channel ${combo}: ${error.message}`);
      }
    }

    // Return
    return interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.green)
          .setDescription(`:recycle: **${helpers.displayMember(user, true)}** had ${deletedCount} messages deleted across ${scannedChannels} channels.`)
      ]
    });
	},
};
