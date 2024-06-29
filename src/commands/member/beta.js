const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, roleMention, channelMention } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beta')
		.setDescription('Apply to be a Beta Tester')
		.addUserOption(option => option.setName('user').setDescription('The user to lookup')),
	options: {
		user: {type: 'user', default: '$self'},
	},
	execute: async (instance, event) => {
		const Manager = instance.Manager;
		const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

		// Set shortcuts
		const interaction = event.interaction;
		const options = event.options;

		// Get the Firebase account
		const account = await helpers.getFirebaseAccount(options.user.id);
		const response = new EmbedBuilder();

		// Check if account is linked
		if (!account.auth.uid) {
			response.setColor(config.colors.red)
				.setTitle('Account Link Required')
				.setDescription(`${config.emojis.mascot} Hey, **${helpers.displayMember(options.user)}**. You need to link your **${Manager.config.brand.name}** and Discord accounts to apply for the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Team**.\n\nUse the ${helpers.displayCommand('link')} command in the ${channelMention(config.channels.chat.commands)} channel.`);
			return interaction.editReply({ content: '', embeds: [response] });
		}

		// Check if user already has beta tester role
		if (account.roles.betaTester && options.user.roles.cache.has(config.roles.betaTester)) {
			response.setColor(config.colors.green)
				.setTitle('You are already a Beta Tester')
				.setDescription(`${config.emojis.betaTester} Hey, **${helpers.displayMember(options.user)}**, you are a member of the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Team**! Congrats!\n\n:partying_face: You have the *exclusive* ${helpers.getPrettyRole('beta')} role and access to the *secret* ${channelMention(config.channels.chat.beta)} channel!\n\n${account.plan.id !== 'basic' ? '' : `:warning: You must be subscribed to [${Manager.config.brand.name} Premium](${instance.app.url}/pricing) to access the ${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} features in the ${Manager.config.brand.name} app.`}`);
			return interaction.editReply({ content: '', embeds: [response] });
		}

    // Get the Discord profile
		const discordProfile = await profile.get(options.user.id);

    // Check if user has introduced themselves
    if (discordProfile.stats.message.total < 1) {
      response.setColor(config.colors.red)
        .setTitle('Beta Tester application failed')
        .setDescription(`${config.emojis.mascot} **${helpers.displayMember(options.user)}**, you are too new! Please introduce yourself in the ${channelMention(config.channels.chat.hangout)} channel.`);
      return interaction.editReply({ content: '', embeds: [response] });
    }

		const betaTesterStatus = helpers.betaTesterStatus(interaction.member, discordProfile);

		// Function to send DM
		const sendDM = async () => {
			const now = new Date();
			if (!betaTesterStatus.applicationIsDayOld) {
				await profile.set(options.user.id, {
					betaTesterApplication: {
						applicationDate: {
							timestamp: now.toISOString(),
							timestampUNIX: Math.floor(now.getTime() / 1000),
						}
					}
				}, { merge: true });
			}
			await options.user.send({
				embeds: [
					new EmbedBuilder()
						.setColor(config.colors.purple)
						.setTitle(`${Manager.config.brand.name} Beta Tester application`)
						.setDescription(`${config.emojis.betaTester} Welcome, **${helpers.displayMember(options.user)}**! Thank you for your interest in applying to be a **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')}**!\n\n:partying_face: **Please fill out the application:** [Application](https://docs.google.com/forms/d/e/1FAIpQLSdeNuCJeqIFYYmXyIQPhHHVs0MIS3hwDHqFo-DckhMAfduvDg/viewform?usp=sf_link)\n\n:fire: Remember, we are looking for **friendly** and **helpful** members for the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')}**. If you are **active in the Discord server** and put effort into your application then you will be accepted as part of the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Team**!\n`)
				]
			});
		};

		// Handle different beta tester application statuses
		if (betaTesterStatus.applicationAccepted) {
			response.setColor(config.colors.green)
				.setTitle('Beta Tester acceptance')
				.setDescription(`${config.emojis.betaTester} Congrats, **${helpers.displayMember(options.user)}**! You have been accepted into the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Team**!\n\n:partying_face: You now have the *exclusive* ${helpers.getPrettyRole('beta')} role and access to the *secret* ${channelMention(config.channels.chat.beta)} channel!\n\n${account.plan.id !== 'basic' ? '' : `:warning: You must be subscribed to [${Manager.config.brand.name} Premium](${instance.app.url}/pricing) to access the ${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} features in the ${Manager.config.brand.name} app.`}\n`);
			await helpers.betaTesterAccept(options.user, account.auth.uid);
		} else if (betaTesterStatus.applicationIsDayOld) {
			response.setColor(config.colors.blue)
				.setTitle('Beta Tester application under review')
				.setDescription(`${config.emojis.betaTester} Hey, **${helpers.displayMember(options.user)}**, your **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')}** application is currently under review!\n\n:Application Status:\npencil: **Applied**: ${new Date(betaTesterStatus.applicationDate).toLocaleDateString()} (${betaTesterStatus.daysAppliedAgo} days ago)\n${helpers.getPrettyRole('active')}: ${options.user.roles.cache.has(config.roles.active) ? 'Yes!' : 'No'}\n${helpers.getPrettyRole('premium')}: ${options.user.roles.cache.has(config.roles.premium) ? 'Yes!' : 'No'}\n\n*Note: your application will **only** be accepted if you are ${helpers.getPrettyRole('active')} or ${helpers.getPrettyRole('premium')}.`);
		} else {
			if (options.user.id === interaction.member.id) {
				try {
					await sendDM();
					response.setColor(config.colors.blue)
						.setTitle('Beta Tester application sent')
						.setDescription(`${config.emojis.betaTester} Hey, **${helpers.displayMember(options.user)}**! I have DM'd you the **${helpers.getPrettyRole('beta')} Team Application**. Please **fill out the application** so we can review it and accept you ASAP.\n\nIf you have already filled out this application, please be patient while we review it.\n\n${helpers.getPrettyRole('premium')}: Accepted in less than **1 day**\n${helpers.getPrettyRole('active')}: Accepted in about **1 week**`);
				} catch {
					response.setColor(config.colors.red)
						.setTitle('Beta application failed')
						.setDescription(`${config.emojis.mascot} **${helpers.displayMember(options.user)}**, please enable DMs so I can send you the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Application**.`);
				}
			} else {
				response.setColor(config.colors.blue)
					.setTitle('Beta Application Incomplete')
					.setDescription(`${config.emojis.betaTester} **${helpers.displayMember(options.user)}** has not yet applied to the **${helpers.getPrettyRole('beta')} Program**.\n\nThey need to manually apply by using the ${helpers.displayCommand('beta')} command.`);
			}
		}

		return interaction.editReply({ content: '', embeds: [response] });
	},
};
