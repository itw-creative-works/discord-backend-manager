const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('activity')
		.setDescription('Check a member\'s activity')
		.addUserOption(option => option.setName('user').setDescription('Member to check').setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
	options: {
		user: {type: 'user', default: '$self'},
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

		if (interaction.guild.id !== config.main.server) {
      return helpers.sendError(interaction, `Cannot use this command outside of the official server.`, {embed: true})
		}

		const discordProfile = await profile.get(options.user.id);

		const activity = {
			lastactivity: discordProfile.activity.lastActivity,
			stats: {
				messages: discordProfile.stats.message,
			}
		}

		return helpers.sendNormal(interaction, `**${helpers.displayMember(options.user)}**'s activity: \n\n\`\`\`json\n${JSON.stringify(activity, null, 2)}\`\`\``, {embed: true})
	},
};
