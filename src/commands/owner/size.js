const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('size')
      .setDescription('Get the size of any file or directory')
      .addStringOption(option => option.setName('path').setDescription('The directory or file').setRequired(false))
  ],
  options: {
		path: {type: 'string', default: './'},
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

    // Libraries
    const sizeItUp = Manager.require('sizeitup');

    // Get size
    const size = sizeItUp.calculate(options.path, {log: true, showFiles: false});

    // Reply
    return helpers.sendNormal(interaction, `**Size for path: ${options.path}**\n\n${sizeItUp.formatBytes(size)}`, {embed: true})
	},
};
