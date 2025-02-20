const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags, roleMention, channelMention } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('edit')
      .setDescription('Edit the bot\'s message')
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
		const subcommand = event.subcommand;
		const options = event.options;

		// assistant.log('Command', subcommand, options);

    // Check if the command is 'Edit' and the target message is from the bot
    if (interaction.targetMessage.author.id !== client.user.id) {
      return helpers.sendError(interaction, 'You can only edit messages from the bot.', {embed: true});
    }

    // Wait for the user's reply
    const messageFilter = (message) => message.author.id === interaction.user.id;
    const messageCollector = interaction.channel.createMessageCollector({ messageFilter, max: 1, time: 60000 });

    messageCollector.on('collect', async (message) => {
      try {
        // Edit the original message with the new content
        await interaction.targetMessage.edit(message.content);

        // Delete the user's reply
        await message.delete();

        // Delete the command's reply
        await interaction.deleteReply();

        // Inform the user that the message has been edited
        await interaction.followUp({
          content: 'The message has been successfully edited.',
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        assistant.error('Error editing the message:', error);
        await interaction.followUp({
          content: 'There was an error editing the message. Please try again.',
          flags: MessageFlags.Ephemeral,
        });
      }
    });

    messageCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await interaction.followUp({
          content: 'Time limit reached. The message edit process has been canceled.',
          flags: MessageFlags.Ephemeral,
        });
      }
    });

    interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.blue)
          .setDescription(`Please reply to this message with the new content you want to replace the original message with.`)
      ]
    });
	},
};
