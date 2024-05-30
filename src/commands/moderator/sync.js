const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sync')
		.setDescription('Sync Premium subscription with payment processors')
		.addUserOption(option => option.setName('user').setDescription('The member to sync').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
	options: {
		user: {type: 'user', default: undefined},
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
		const fetch = Manager.require('wonderful-fetch');

		// assistant.log('Command', subcommand, options);

		if (interaction.guild.id !== config.main.server) {
      return helpers.sendError(interaction, `Cannot use this command outside of the official server.`, {embed: true})
		}

		// Get user
		const issuer = await helpers.getFirebaseAccount(interaction.member.id).catch(e => e);
		const receiver = await helpers.getFirebaseAccount(options.user.id).catch(e => e);

    let message = `**${helpers.displayMember(options.user, true)}** was synched!\n\n`;
    let result
    const fetchOptions = {
      method: 'post',
      response: 'json',
      tries: 1,
      log: true,
      cacheBreaker: false,
      body: {
        uid: receiver.auth.uid,
      },
    }

		// Sync function
		function _sync(duration) {
			setTimeout(function () {
				// Sync roles for the user
				processes['sync-roles'].execute(instance, {id: options.user.id})
			}, duration);
		}

    // Sync roles initially even if account is not linked
		_sync(1000);

		// Check for errors
		if (!issuer.auth.uid) {
			return helpers.sendError(interaction, `Your account is not linked. Please use the ${helpers.displayCommand('link')} command.`, {embed: true});
		} else if (!receiver.auth.uid) {
			return helpers.sendError(interaction, `**${helpers.displayMember(options.user, true)}** has not linked their account. Please instruct them to ${helpers.displayCommand('link')} their account. However, ${helpers.displayCommand('sync-roles')} has still executed.`, {embed: true});
		} else if (!issuer.roles.moderator) {
			return helpers.sendError(interaction, 'This command can only be used by moderators.', {embed: true});
		} else if (!options.duration > 1) {
			return helpers.sendError(interaction, 'You can currently give premium for a maximum of 1 day.', {embed: true});
		}

		// Request the subscription server to update
		result = await fetch(`https://subscription-profile-sync.glitch.me/process`, fetchOptions)
    .catch(async (e) => {
      result = await fetch(`https://cors-proxy.itw-creative-works.repl.co/proxy?url=https://subscription-profile-sync.glitch.me/process`, fetchOptions)
        .catch(e => e);
    });

		if (result instanceof Error) {
      message += `:x: Failed to process \`subscription-profile-sync\`\n`
		} else {
      message += `:white_check_mark: Successfully processed \`subscription-profile-sync\`\n`
    }

		// Sync multiple times to ensure the server had time to fetch
		_sync(1000 * 60 * 1);
		_sync(1000 * 60 * 2);

		return helpers.sendNormal(interaction, message, {embed: true})
	},
};
