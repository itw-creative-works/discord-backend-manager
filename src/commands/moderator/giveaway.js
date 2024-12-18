const { SlashCommandBuilder, EmbedBuilder, MessagePayload } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('giveaway')
      .setDescription('Manage giveaways')
      .addSubcommand(subcommand =>
        subcommand
          .setName('create')
          .setDescription('Create a new giveaway')
          .addNumberOption(option => option.setName('days').setDescription('Duration in days').setRequired(true))
          // .addStringOption(option => option.setName('prize').setDescription('Name of the prize').setRequired(true))
          .addStringOption(option =>
            option.setName('prize')
              .setDescription('The type of prize')
              .setRequired(true)
              .addChoices(
                { name: 'Premium Subscription', value: 'Premium Subscription' },
                { name: 'Discord Nitro', value: 'Discord Nitro' },
              ))
          .addRoleOption(option => option.setName('role').setDescription('Role required to win').setRequired(false))
          .addUserOption(option => option.setName('sponsor').setDescription('Giveaway sponsor').setRequired(false))
          .addStringOption(option => option.setName('sponsor-link').setDescription(`Giveaway sponsor's link`).setRequired(false))
          .addStringOption(option => option.setName('requirement').setDescription(`Requirement to enter`).setRequired(false))
          .addStringOption(option => option.setName('reason').setDescription(`Reason for the giveaway`).setRequired(false))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('cancel')
          .setDescription('Cancel an existing giveawy')
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('refresh')
          .setDescription('Refresh an existing giveawy')
      )
  ],
  options: {
		days: {type: 'number', default: undefined},
		prize: {type: 'string', default: undefined},
		role: {type: 'role', default: undefined},
		sponsor: {type: 'user', default: undefined},
		['sponsor-link']: {type: 'string', default: undefined},
		requirement: {type: 'string', default: undefined},
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

    // Libraries
		const moment = Manager.require('moment');
		const { get } = Manager.require('lodash');

		const activeGiveaway = await helpers.resolveActiveGiveaway();
		const giveaway = await helpers.getOfficialServerChannel('events.giveaway');

		// assistant.log('---activeGiveaway', activeGiveaway);
		// assistant.log('---options', options);

		if (interaction.guild.id !== config.main.server) {
      return helpers.sendError(interaction, `Cannot use this command outside of the official server.`, {embed: true})
		}

		// Handle creation
		if (subcommand === 'create') {
			if (activeGiveaway.daysUntilExpire > 0 && activeGiveaway.message.exists) {
				await helpers.updateActiveGiveaway();

				return helpers.sendError(interaction, `There is already an [active giveaway](${activeGiveaway.message.reference.url}). You can use \`/giveaway cancel\` to close it early.`, {embed: true})
			}

			// const newGiveawayMessage = await giveaway.send({embeds: [new EmbedBuilder().setDescription('.')]}).catch(e => e);
			const newGiveawayMessage = await giveaway.send({content: '.'}).catch(e => e);

			Manager.storage().set('giveaway', {
				id: newGiveawayMessage.id,
				prize: options.prize,
				rolesRequired: [get(options, 'role.id')],
				sponsor: {
					id: get(options, 'sponsor.id'),
					link: options['sponsor-link'],
				},
        requirement: options.requirement,
        reason: options.reason,
				endDate: {
					timestamp: moment().add(
						moment.duration(options.days, 'days').asMilliseconds(), 'ms'
					).toISOString(),
				},
				winner: {
					id: '-1',
					claimed: false,
					claimUntilDate: {
						timestamp: new Date(0).toISOString(),
					}
				},
			}).write();

			// Update the active giveaway
			const newGiveawayMessageContent = await helpers.updateActiveGiveaway()

			// Send success message
			return interaction.editReply({
				content: `Successfully Created Giveaway! \n\n**Created [the new giveaway](${newGiveawayMessage.url}) (${newGiveawayMessage.id}) with the following message...**`,
				embeds: [
					new EmbedBuilder()
						.setColor(config.colors.green)
						.setDescription(newGiveawayMessageContent)
						.setDescription(`${newGiveawayMessageContent}`)
				]
			});
		} else if (subcommand === 'cancel') {
			await activeGiveaway.message.reference.delete()
			.catch(e => e)

			Manager.storage().set('giveaway', {}).write();
			return helpers.sendNormal(interaction, `Giveaway canceled, original message deleted.`, {embed: true})
		} else if (subcommand === 'refresh') {
      helpers.updateActiveGiveaway()

			return helpers.sendNormal(interaction, `Giveaway refreshed.`, {embed: true})
    }

	},
};
