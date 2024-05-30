const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('data')
		.setDescription('Read or write data')
		.addSubcommand(subcommand =>
			subcommand
				.setName('get')
				.setDescription('Get data from the local storage')
				.addStringOption(option => option.setName('path').setDescription(`Data path`).setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Get data from the local storage')
				.addStringOption(option => option.setName('path').setDescription(`Data path`).setRequired(true))
				.addStringOption(option => option.setName('value').setDescription(`Data to save`).setRequired(true))
        .addStringOption(option =>
          option.setName('type')
            .setDescription('The type of data')
            .setRequired(false)
            .addChoices(
              { name: 'String', value: 'string' },
              { name: 'Number', value: 'number' },
              { name: 'Boolean', value: 'boolean' },
              { name: 'Object', value: 'object' },
            ))
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	options: {
		path: {type: 'string', default: undefined},
		value: {type: 'string', default: undefined},
		type: {type: 'string', default: undefined},
	},
	execute: async (instance, event) => {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Set shortcuts
		const interaction = event.interaction;
		const subcommand = event.subcommand;
		const options = event.options;

		assistant.log('Command', subcommand, options);

    let message = '';

    // Get data
    if (subcommand === 'get') {
      // Done later
    }

    // Set data
    if (subcommand === 'set') {
      try {
        if (options.type === 'string') {
          options.value = String(options.value);
        } else if (options.type === 'number') {
          options.value = Number(options.value);
        } else if (options.type === 'boolean') {
          options.value = options.value === 'true';
        } else if (options.type === 'object') {
          options.value = JSON.parse(options.value);
        }
      } catch (e) {
		    return helpers.sendError(interaction, e, {embed: true})
      }

			Manager.storage().set(options.path, options.value).write();
    }

    // Get data
    message = Manager.storage().get(options.path).value();

    // Format object
    try {
      message = JSON.stringify(message, null, 2);
    } catch (e) {
      assistant.log('Value is not an object', e);
    }

		return helpers.sendNormal(interaction, `\`${options.path}\`: \n\n\`\`\`${message}\`\`\``, {embed: true})
	},
};
