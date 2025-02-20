const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('delay')
      .setDescription('Replies with a delayed pong')
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

    // Delayed response
		setTimeout(function () {
			return helpers.sendNormal(interaction, 'Pong (delaaaaayed)', {embed: true})
		}, 3000);
	},
};
