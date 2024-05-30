const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('execute')
		.setDescription('Execute code')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option => option.setName('code').setDescription('The code to execute').setRequired(true)),
	options: {
		code: {type: 'string', default: undefined},
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
		const JSON5 = Manager.require('json5')

		// assistant.log('Command', subcommand, options);

    // Execute code
		try {
			let result = eval(options.code);
			result = '```js\n' + (result && typeof result === 'object' ? JSON5.stringify(result) : result) + '```';
			assistant.log('Result', result);

			return helpers.sendNormal(interaction, result, {embed: true})
		} catch (e) {
			return helpers.sendError(interaction, `Failed to execute code: \n\n${e}`, {embed: true})
		}
	},
};
