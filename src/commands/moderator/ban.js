const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a member')
      .addSubcommand(subcommand =>
        subcommand
          .setName('user')
          .setDescription('Ban by user mention')
          .addUserOption(option => option.setName('user').setDescription('The member to ban').setRequired(true))
          .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('id')
          .setDescription('Ban by user ID')
          .addStringOption(option => option.setName('id').setDescription('The member to ban').setRequired(true))
          .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
      ),
      // .setName('ban')
      // .setDescription('Select a member and ban them')
      // .addUserOption(option => option.setName('user').setDescription('The member to ban').setRequired(true))
      // .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
  ],
  options: {
		user: {type: 'user', default: undefined},
		id: {type: 'string', default: undefined},
		reason: {type: 'string', default: undefined},
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

		function _success() {
			return helpers.sendNormal(interaction, ``
				+ `**${helpers.displayMember(options.user || options.id, true)}** was banned from the **${Manager.config.brand.name}** server! :wave::rofl:`
				+ `\n\n`
				+ `Reason: ${options.reason}`,
				{embed: true}
			);
		}

		function _error(e) {
			return helpers.sendError(interaction, ``
				+ `Failed to ban **${helpers.displayMember(options.user || options.id, true)}**`
				+ `\n\n`
				+ `Reason: ${e}`,
				{embed: true}
			);
		}

		if (subcommand === 'id') {
			if (helpers.isSnowFlake(options.id)) {
				await interaction.guild.members.ban(options.id)
				.then(_success)
				.catch(_error)
			} else {
				_error(new Error(`{${options.id}} is not a valid member ID`))
			}
		} else {
			await options.user.send({
				content: '',
				embeds: [
					new EmbedBuilder()
						.setColor(config.colors.red)
						.setTitle('You have been banned')
						.setDescription(``
							+ `**${helpers.displayMember(options.user)}**, you have been banned from the **${Manager.config.brand.name}** server! :wave::rofl:`
							+ `\n\n`
							+ `Reason: ${options.reason}`
						)
				]
			})
			.catch(e => assistant.error(e))

			await options.user.ban({
				days: 7,
				reason: options.reason,
			})
			.then(_success)
			.catch(_error)
		}
	},
};
