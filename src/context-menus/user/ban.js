const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Ban')
		.setType(ApplicationCommandType.User),
	settings: {
		command: 'ban',
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
		assistant.log('----context-menu/user/ban', options);
	},
};
