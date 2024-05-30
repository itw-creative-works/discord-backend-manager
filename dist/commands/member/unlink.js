const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlink')
		.setDescription('Unlink your account from Discord'),
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

		// assistant.log('Command', subcommand, options);

		return helpers.getFirebaseAccount(interaction.member.id)
		.then(async (account) => {
			const response = new EmbedBuilder()

			if (account.auth.uid) {
				await Manager.libraries.initializedAdmin.firestore().doc(`users/${account.auth.uid}`)
				.set({
					oauth2: {discord: {}}
				}, {merge: true})

				response
					.setColor(config.colors.green)
					.setTitle(`Unlinked ${Manager.config.brand.name} account`)
					.setDescription(`Hey, **${helpers.displayMember(interaction.member)}**, you have successfully unlinked your **${Manager.config.brand.name}** account with Discord.`)
			} else {
				response
					.setColor(config.colors.red)
					.setTitle(`No ${Manager.config.brand.name} account linked`)
					.setDescription(`Hey, **${helpers.displayMember(interaction.member)}**, you don't have a **${Manager.config.brand.name}** account linked to this Discord account`)
			}

			return interaction.editReply({ content: '', embeds: [response] });
		})

	},
};
