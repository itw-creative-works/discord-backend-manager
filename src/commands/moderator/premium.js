const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('premium')
      .setDescription('Give a user a Premium subscription')
      .addUserOption(option => option.setName('user').setDescription('The member to give the Premium subscription to').setRequired(true))
      .addIntegerOption(option => option.setName('days').setDescription('The amount of days to give').setRequired(true))
  ],
  options: {
		user: {type: 'user', default: undefined},
		days: {type: 'integer', default: undefined},
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
		const fetch = Manager.require('wonderful-fetch');

		// assistant.log('Command', subcommand, options);

		if (interaction.guild.id !== config.main.server) {
      return helpers.sendError(interaction, `Cannot use this command outside of the official server.`, {embed: true})
		}

		// Get user
		const issuer = await helpers.getFirebaseAccount(interaction.member.id).catch(e => e);
		const receiver = await helpers.getFirebaseAccount(options.user.id).catch(e => e);
		const message = `${config.emojis.premium} **${helpers.displayMember(options.user, true)}** was given **${Manager.config.brand.name} Premium** by **${helpers.displayMember(interaction.member, true)}**\n`;

		// Check for errors
		if (!issuer.auth.uid) {
			return helpers.sendError(interaction, `Your account is not linked. Please use the ${helpers.displayCommand('link')} command.`, {embed: true});
		} else if (!receiver.auth.uid) {
			return helpers.sendError(interaction, `**${helpers.displayMember(options.user, true)}** has not linked their account. Please instruct them to use the ${helpers.displayCommand('link')} command.`, {embed: true});
		} else if (!issuer.roles.moderator) {
			return helpers.sendError(interaction, 'This command can only be used by moderators.', {embed: true});
		} else if (!options.duration > 1) {
			return helpers.sendError(interaction, 'You can currently give premium for a maximum of 1 day.', {embed: true});
		}

		// Calculate time
		const eventId = 'discord-premium-command'
		const expires = moment().add(options.duration, 'days');
		const expiresObject = {
			timestamp: expires.toISOString(),
			timestampUNIX: expires.unix(),
		}
		const timeObject = {
			timestamp: moment().toISOString(),
			timestampUNIX: moment().unix(),
		}

		// Give them premium
		await Manager.libraries.initializedAdmin.firestore().doc(`users/${receiver.auth.uid}`)
		.set({
			plan: {
				id: 'premium',
				expires: expiresObject,
        status: 'active',
				payment: {
					ignoreUntil: expiresObject,
					updatedBy: {
						date: timeObject,
						event: {
							id: eventId,
							name: eventId,
						},
					}
				}
			}
		}, {merge: true})
		.then(() => {
			helpers.sendToLogChannel(message)
		})

		// Sync roles for the user
		await processes['sync-roles'].execute(instance, {id: options.user.id})

		// Request the subscription server to update
		await fetch(`https://subscription-profile-sync.glitch.me/process`, {
			method: 'post',
			response: 'json',
			body: {
				uid: receiver.auth.uid,
			},
		})

		return helpers.sendNormal(interaction, message, {embed: true})
	},
};
