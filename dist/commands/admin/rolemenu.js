const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, roleMention } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rolemenu')
		.setDescription('Setup role menu')
		.addSubcommand(subcommand =>
			subcommand
				.setName('sync')
				.setDescription('Sync the role menu with the channel')
		)
		// .addSubcommand(subcommand =>
		// 	subcommand
		// 		.setName('cancel')
		// 		.setDescription('Cancel an existing giveawy')
		// 		// .addStrinOption(option => option.setName('id').setDescription('The role to give').setRequired(true))
		// )
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	options: {
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
    const { get } = Manager.require('lodash');

		// assistant.log('Command', subcommand, options);

		const eventFunction = events[options.event];
		const object = get(interaction, options.path)

		const roles = await helpers.getOfficialServerChannel(config.roleMenu.channel || 'information.roles');

		// Delete all bot messages to clear room for new ones
		await roles.messages.fetch()
		.then(async (messages) => {

			messages
			.forEach(async (message) => {
				if (!message.author.bot) {
					return
				}
				assistant.log('Deleting', message.id);
				await message.delete()
			});
		})

		// Setup new menus
		for (var i = 0; i < config.roleMenu.menus.length; i++) {
			const menu = config.roleMenu.menus[i];

			let description = `${menu.heading} \n`;
			const components = [];
			const selectComponents = [];
			let row = -1;

			menu.choices
			.forEach((choice, index) => {
				const identifier = `role-menu|${menu.id}|${choice.role}`;
				description += `\n\n${choice.emoji} ${roleMention(choice.role)}`;

				// Setup buttons
				if (menu.type !== 'buttons') {
					selectComponents.push(
						{
							emoji: choice.emoji,
							label: choice.label,
							value: identifier,
						},
					)
					return
				}

				if (index % 5 === 0) {
					row++;
					components[row] = new ActionRowBuilder();
				}

				components[row]
					.addComponents(
						new ButtonBuilder()
							.setCustomId(identifier)
							.setEmoji(choice.emoji)
							.setLabel(choice.label)
							.setStyle(ButtonStyle.Secondary),
					)
			});

			// Setup select
			if (menu.type === 'select') {
				components[0] = new ActionRowBuilder();

				components[0]
					.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId(menu.id)
							.setPlaceholder('Choose a role')
							.addOptions(
								selectComponents
							),
					)
			}

			await roles.send({
				embeds: [
					new EmbedBuilder()
					.setColor(config.colors.blue)
					.setDescription(description)
				],
				components: components,
			});

		}

		return helpers.sendNormal(interaction, `Successfully set up all role menus.`, {embed: true});

	},
};
