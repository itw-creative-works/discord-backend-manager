const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Test an event')
		.addStringOption(option => option.setName('event').setDescription('The event name').setRequired(true))
		.addStringOption(option => option.setName('path').setDescription('The path to the object').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	options: {
		event: {type: 'string', default: undefined},
		path: {type: 'string', default: undefined},
	},
	execute: async (instance, event) => {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Set shortcuts
		const interaction = event.interaction;
		const subcommand = event.subcommand;
		const options = event.options;

    // Libraries
    const { get } = Manager.require('lodash');

		// assistant.log('Command', subcommand, options);

		const eventFunction = events[options.event];
		const object = get(interaction, options.path)

		if (!eventFunction) {
			throw new Error(`Cannot find event: ${options.event}`)
		} else if (!object) {
			throw new Error(`No path: ${options.path}`)
		}

		eventFunction(object)
			.then((r) => {
				return helpers.sendNormal(interaction, `Ran event ${options.event} with object at path ${options.path}`, {embed: true});
			})
			.catch((e) => {
				throw new Error(`Failed to run ${options.event}: ${e}`)
			})

	},
};
