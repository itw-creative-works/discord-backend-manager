const { SlashCommandBuilder, EmbedBuilder, GuildMember } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('shop')
      .setDescription('View the shop and purchase items')
      .addStringOption(option => option.setName('item').setDescription('The item to purchase'))
  ],
  options: {
		item: {type: 'string', default: undefined},
	},
	settings: {
		// log: true,
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

		// assistant.log('Command', subcommand, options);

    return helpers.sendNormal(interaction, `The shop is closed right now, please check again later!`, {embed: true})
	},
};
