const { SlashCommandBuilder, EmbedBuilder, MessagePayload } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Delete a channel\'s messages')
      .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete').setRequired(false))
      .addUserOption(option => option.setName('user').setDescription('Specific @member messages').setRequired(false))
  ],
  options: {
		amount: {type: 'integer', default: 1},
		user: {type: 'user', default: undefined},
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

		const amount = Math.min(options.amount + 1, 100)

		// Handle Clearing
		await interaction.channel.messages.fetch({
			limit: 100,
		})
		.then(async (messages) => {

			let clear = [];
			let byUser = '';

			if (options.user) {
				messages.filter(m => m.author.id === options.user.id).forEach(msg => clear.push(msg))
				clear = clear.slice(0, amount)
				byUser = `of **${helpers.displayMember(options.user)}**`
			}

			await interaction.channel.bulkDelete(clear ? clear : amount);

			// return interaction.channel.send({
			// 	ephemeral: true,
			// 	embeds: [
			// 		new EmbedBuilder()
			// 			.setColor(config.colors.blue)
			// 			.setDescription(`Cleared ${options.amount} ${byUser} messsage(s).`)
			// 	]
			// });

		})
	},
};
