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

    // Libraries
    const package = require('../../../package.json');

		// assistant.log('Command', subcommand, options);
    const user = os.userInfo();
    const startTime = assistant.meta.startTime.timestamp;
    const uptime = calculateUpTime(startTime);

    // Response
    const string = `**Environment:**\n`
      + `**Env**: \`${process.env.ENVIRONMENT}\`\n`
      + `**Discord BEM Version**: \`${package.version}\`\n`
      + `**OS Type**: \`${os.type()}\`\n`
      + `**OS User**: \`${user.username}\`\n`
      + `**CWD**: \`${process.cwd()}\`\n`
      + `**Start Time**: \`${startTime} (${uptime})\`\n`

    // Send response
		return helpers.sendNormal(interaction, string, {embed: true})
	},
};

function calculateUpTime(startTime) {
  const now = new Date();
  const diff = now - new Date(startTime);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60) % 24);
  const minutes = Math.floor(diff / (1000 * 60) % 60);
  const seconds = Math.floor(diff / 1000 % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
