const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a member')
      .addUserOption(option => option.setName('user').setDescription('The member to ban').setRequired(true))
      .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
  ],
  options: {
		user: {type: 'user', default: undefined},
		reason: {type: 'string', default: undefined},
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

    // Respond
		return helpers.sendError(interaction, 'There was an error while executing this command!', {embed: true});
	},
};
