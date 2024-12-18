const { SlashCommandBuilder, EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
	data: [
     new SlashCommandBuilder()
      .setName('audit')
      .setDescription('Print an audit log')
      .addUserOption(option => option.setName('user').setDescription('The user to lookup'))
      .addStringOption(option => option.setName('type').setDescription('The event type to lookup'))
      .addIntegerOption(option => option.setName('limit').setDescription('The number of events to fetch'))
  ],
	options: {
		user: {type: 'user', default: '$self'},
		type: {type: 'string', default: undefined},
		limit: {type: 'integer', default: 3},
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

		options.type = AuditLogEvent[options.type];

		const fetchedLogs = await options.user.guild.fetchAuditLogs(options);

		const reply = new EmbedBuilder()
			.setColor(config.colors.blue)
			.setTitle(`${options.user.user.username}'s ${interaction.options.getString('type') || ''} Audit log`)
		let description = '';

    fetchedLogs.entries
    .forEach((entry, i) => {
			description += `**${AuditLogEvent[entry.action]}** (${new Date(entry.createdTimestamp).toLocaleString()}) \n \`\`\`${JSON.stringify(entry.changes[0], null, 2)}\`\`\`\n`
    });

		return interaction.editReply({
			embeds: [
				reply
					.setDescription(description += '\n*From most recent to oldest*')
			]
		});
	},
};
