const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription('Restart the bot')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	options: {

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

    // Restart the bot
		helpers.restart();

    // Reply
		return helpers.sendNormal(interaction, 'Bot is restarting...', {embed: true})
	},
};
