const { SlashCommandBuilder, EmbedBuilder, GuildMember } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('account')
      .setDescription('View your App and Discord account details')
      .addUserOption(option => option.setName('user').setDescription('The user to lookup'))
      .addStringOption(option => option.setName('uid').setDescription('The uid to lookup'))
  ],
  options: {
		user: {type: 'user', default: '$self'},
		uid: {type: 'string', default: undefined, for: 'user'},
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
		const moment = Manager.require('moment');

		// assistant.log('Command', subcommand, options);

		if (interaction.guild.id !== config.main.server) {
      return helpers.sendError(interaction, `Cannot use this command outside of the official server.`, {embed: true})
		}

		// assistant.log('---options.user', options.user ? options.user.user.username : options.user);

		function determineActivity(lastActivity) {
			const lastActivityDays = moment().diff(moment(lastActivity), 'days');

			if (lastActivityDays === 0) {
				return 'today';
			} else if (lastActivityDays === 1) {
				return 'yesterday';
			} else {
				return `${lastActivityDays} days ago`
			}
		}

		return helpers.getFirebaseAccount(options.user.id)
		.then(async (account) => {
			const commands = await helpers.getOfficialServerChannel('chat.commands');
			const discordProfile = await profile.get(options.user.id);

			const xpRate = Math.floor(100 * (discordProfile.profile.xp / profile.getRequiredXP(discordProfile.profile.level)))

			let description = `**${Manager.config.brand.name} Details**\n`;

			let premiumStatus;
			let betaStatus;
			const betaApplicationStatus = helpers.betaTesterStatus(interaction.member, discordProfile);

			// assistant.log('---discordProfile', discordProfile);
			// assistant.log('---betaApplicationStatus', betaApplicationStatus);

			// Handle premium status
			if (account.plan.id && account.plan.id !== 'basic') {
				const timestamp = account.plan.expires.timestamp;
				const premiumExpireDays = moment(timestamp).diff(moment(), 'days');
				premiumStatus = `Active ${premiumExpireDays < 365 ? `(Expires ${new Date(timestamp).toLocaleDateString()}` : ''}`
			} else {
				premiumStatus = `Inactive`
			}

			// Handle beta status
			if (account.roles.betaTester) {
				betaStatus = `Active`
			} else {
				const timestamp = betaApplicationStatus.applicationDate;
				betaStatus = `Inactive ${betaApplicationStatus.daysAppliedAgo >= 1 ? `(Applied ${new Date(timestamp).toLocaleDateString()})` : ''}`
			}

			// Build account text
			if (account.auth.uid) {
				description += ``
					+ `:bust_in_silhouette: **UID**: ${account.auth.uid}\n`
					+ `:e_mail: **Email**: ${helpers.privatize(account.auth.email)}\n`
					+ `${helpers.getPrettyRole('premium')}: ${premiumStatus}\n`
					+ `${helpers.getPrettyRole('beta')}: ${betaStatus}\n`
					+ `:hatching_chick: **Created**: ${new Date(account.activity.created.timestamp).toLocaleDateString()}\n`
					+ `\n`
			} else {
				description += ``
					+ `*:warning: You need to use the ${helpers.displayCommand('link')} command in the ${commands} channel first*\n`
					+ `\n`
			}

			const lastActivity = new Date(discordProfile.activity.lastActivity.timestamp);

			// Server
			description += `**Discord Details**\n`
				+ `:identification_card: **Name**: ${helpers.displayMember(options.user, true)}\n`
				+ `:hatching_chick: **Joined**: ${new Date(options.user.joinedTimestamp).toLocaleDateString()}\n`
				+ `:test_tube: **Level**: ${discordProfile.profile.level}\n`
				+ `${config.emojis.xp} **XP**: ${discordProfile.profile.xp}/${profile.getRequiredXP(discordProfile.profile.level)} (${xpRate}%)\n`
				+ `${config.emojis.currency} **${config.main.currency}**: ${helpers.formatNumber(discordProfile.profile.currency)}\n`
				+ `:alarm_clock: **Active**: ${lastActivity.toLocaleDateString()} (${determineActivity(lastActivity)})\n`
				+ `:school_satchel: **Inventory**: *Nothing*\n`
				+ `\n`
        + `Items can be obtained by using the ${helpers.displayCommand('shop')} command in the ${commands} channel!`
				+ `\n`

			if (account.auth.uid) {
				processes['sync-roles'].execute(instance, {id: options.user.id})
				.catch(e => {
					assistant.error('Error', e);
				})
			}

			return interaction.editReply({
				content: '',
				embeds: [
					new EmbedBuilder()
						.setTitle(`${options.user.user.username}'s Account`)
						.setColor(config.colors.blue)
						.setDescription(description)
				]
			});
		})

	},
};
