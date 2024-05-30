const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Collection } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('subscription')
		.setDescription('Display subscription details')
		.addStringOption(option => option.setName('id').setDescription('Subscription ID or user ID').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
	options: {
		id: {type: 'string', default: undefined},
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

		// Check for errors
		if (!issuer.auth.uid) {
			return helpers.sendError(interaction, `Your account is not linked. Please use the ${helpers.displayCommand('link')} command.`, {embed: true});
		} else if (!issuer.roles.moderator) {
			return helpers.sendError(interaction, 'This command can only be used by moderators.', {embed: true});
		}

		const billingProfileQueries = [
			{field: 'details.uid', operator: '==', value: options.id},
			{field: 'id', operator: '==', value: options.id},
			{field: 'resolved.resource.id', operator: '==', value: options.id},
		];
		const appProfileQueries = [
			{field: 'auth.uid', operator: '==', value: options.id},
			{field: 'plan.payment.orderId', operator: '==', value: options.id},
			{field: 'plan.payment.resourceId', operator: '==', value: options.id},
		];

		let message = '';

		// let billingProfile;
		// let appProfile;

		// function _query(url, collection, query) {
		// 	return new Promise(function(resolve, reject) {
		// 		fetch(url, {
		// 			method: 'post',
		// 			response: 'json',
		// 			body: {
		// 				backendManagerKey: process.env.BACKEND_MANAGER_KEY,
		// 				command: 'admin:firestore-query',
		// 				payload: {
		// 					collection: collection,
		// 					queries: {
		// 						where: [query],
		// 					},
		// 				}
		// 			},
		// 		})
		// 		.then(json => {
		// 			assistant.log('---query', query);
		// 			assistant.log('---json', json);
		// 			assistant.log('---json[0]', json[0]);
		// 			return resolve(json[0] || null)
		// 		})
		// 	});
		// }

		// Get subscription profile
		// for (var i = 0; i < billingProfileQueries.length; i++) {
		// 	if (!billingProfile) {
		// 		billingProfile = await _query(`https://us-central1-itw-creative-works.cloudfunctions.net/bm_api`, 'subscription-profiles', billingProfileQueries[i])
		// 	}
		// }
		// for (var i = 0; i < appProfileQueries.length; i++) {
		// 	if (!appProfile) {
		// 		appProfile = await _query(`${instance.app.server}/bm_api`, 'users', appProfileQueries[i])
		// 	}
		// }

		const billingProfile = await fetch(`https://us-central1-itw-creative-works.cloudfunctions.net/bm_api`, {
			method: 'post',
			response: 'json',
			body: {
				backendManagerKey: process.env.BACKEND_MANAGER_KEY,
				command: 'admin:firestore-query',
				payload: {
					queries: [
						{
							collection: 'subscription-profiles',
							where: [
								{field: 'details.uid', operator: '==', value: options.id},
							],
						},
						{
							collection: 'subscription-profiles',
							where: [
								{field: 'id', operator: '==', value: options.id},
							],
						},
						{
							collection: 'subscription-profiles',
							where: [
								{field: 'resolved.resource.id', operator: '==', value: options.id},
							],
						},
					],
				}
			},
		})

		const appProfile = await fetch(`${instance.app.server}/bm_api`, {
			method: 'post',
			response: 'json',
			body: {
				backendManagerKey: process.env.BACKEND_MANAGER_KEY,
				command: 'admin:firestore-query',
				payload: {
					queries: [
						{
							collection: 'users',
							where: [
								{field: 'auth.uid', operator: '==', value: options.id},
							],
						},
						{
							collection: 'users',
							where: [
								{field: 'plan.payment.orderId', operator: '==', value: options.id},
							],
						},
						{
							collection: 'users',
							where: [
								{field: 'plan.payment.resourceId', operator: '==', value: options.id},
							],
						},
					],
				}
			},
		})

		// Attach ID
		message += `Records that match \`${options.id}\`...\n\n`

		// Attach billing profiles
		message += '**Billing Profiles**\n'
		if (billingProfile[0]) {
			billingProfile
			.forEach((profile, index) => {
				message += `**${index + 1}:** id=${profile.data.resolved.resource.id}, processor=${profile.data.processor}, expires=${profile.data.resolved.expires.timestamp}, paid=${profile.data.resolved.payment.completed}, status=${profile.data.resolved.status}\n`
			});
		} else {
			message += '*none*'
		}

		// Attach account plan data
		message += `\n\n**Profile Attached to ${Manager.config.brand.name}**\n`
		if (appProfile[0]) {
			message += `id=${appProfile[0].data.plan.payment.resourceId}, processor=${appProfile[0].data.plan.payment.processor}, expires=${appProfile[0].data.plan.expires.timestamp}\n`
		} else {
			message += '*none*'
		}

		return helpers.sendNormal(interaction, message, {embed: true})
	},
};
