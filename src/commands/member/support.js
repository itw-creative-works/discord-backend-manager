const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('support')
      .setDescription('Get help with any of our custom Discord bot commands')
      // .addStringOption((option) =>
      // 	option.setName('catgory')
      // 		.setDescription('The category of commands to list')
      // 		.addChoices(
      // 			{
      // 				name: 'Member',
      // 				value: 'member'
      // 			},
      // 			{
      // 				name: 'Admin',
      // 				value: 'admin'
      // 			},
      // 			{
      // 				name: 'Moderator',
      // 				value: 'moderator'
      // 			},
      // 			{
      // 				name: 'Owner',
      // 				value: 'owner'
      // 			}
      // 		)
      // 	)
  ],
  options: {
		category: {type: 'string', default: undefined}
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

		const response = new EmbedBuilder()
			.setColor(config.colors.green)
		let description = `**${config.emojis.mascot} ${Manager.config.brand.name} Commands ${config.emojis.mascot}**\n\n`;

		// assistant.log('---commands', commands);
		Object.keys(commands)
		.forEach(name => {
			const command = commands[name];
			description += ``
				+ `${helpers.displayCommand(command.data.name)}: ${command.data.description}\n`
		})

		// const glob = require('glob');
		// const path = require('path');

		// glob(path.join(process.cwd(), 'dist/commands/**/*.js'), {}, (rr, files) => {
		// 	files.forEach(file => {
		// 		const name = path.basename(file, path.extname(file))
		// 		result.push({name: name, path: file})
		// 	});

		// 	return resolve(result);
		// })

			response
				.setDescription(description)

			return interaction.editReply({ content: '', embeds: [response] });

	},
};
