const { SlashCommandBuilder, EmbedBuilder, Role } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('role')
      .setDescription('Change the role of a user')
      .addSubcommand(subcommand =>
        subcommand
          .setName('add')
          .setDescription('Give a role to a member')
          .addUserOption(option => option.setName('user').setDescription('The member to give the role to').setRequired(true))
          .addRoleOption(option => option.setName('role').setDescription('The role to give').setRequired(true))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('remove')
          .setDescription('Remove a role from a member')
          .addUserOption(option => option.setName('user').setDescription('The member to remove the role from').setRequired(true))
          .addRoleOption(option => option.setName('role').setDescription('The role to remove').setRequired(true))
      )
  ],
  options: {
		user: {type: 'user', default: undefined},
		role: {type: 'role', default: undefined},
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

		let roleChange;

		if (subcommand === 'add') {
			roleChange = await options.user.roles.add(options.role.id).catch(e => e)
		} else {
			roleChange = await options.user.roles.remove(options.role.id).catch(e => e)
		}

		if (roleChange instanceof Error) {
      return helpers.sendError(interaction, `Failed to add role: ${roleChange}`, {embed: true})
		} else {
			return interaction.editReply({
				content: '',
				embeds: [
					new EmbedBuilder()
						.setColor(config.colors.green)
						.setDescription(subcommand === 'add'
							? `:partying_face: **${helpers.displayMember(options.user, true)}** was given the ${options.role} role!`
							: `:face_with_symbols_over_mouth: **${helpers.displayMember(options.user, true)}** was stripped of the ${options.role} role`
						)
				]
			});
		}

	},
};
