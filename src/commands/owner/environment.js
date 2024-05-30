const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('environment')
		.setDescription('Log the current environment')
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

		return helpers.sendNormal(interaction, `**Environment:** \`${process.env.ENVIRONMENT}\``, {embed: true})
	},
};
