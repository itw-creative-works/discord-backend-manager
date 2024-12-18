const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('environment')
      .setDescription('Log the current environment')
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
    const user = os.userInfo();

    const string = `**Environment:**\n`
      + `**env**: \`${process.env.ENVIRONMENT}\`\n`
      + `**OS Type**: \`${os.type()}\`\n`
      + `**OS User**: \`${user.username}\`\n`
      + `**CWD**: \`${process.cwd()}\`\n`

		return helpers.sendNormal(interaction, string, {embed: true})
	},
};
