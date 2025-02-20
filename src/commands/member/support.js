const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

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

    // Get user and permissions
    const member = interaction.member;
    const permissions = member.permissions;
    const isAdmin = permissions.has(PermissionsBitField.Flags.Administrator);
    const isModerator = permissions.has(PermissionsBitField.Flags.KickMembers);
    const isOwner = member.id === process.env.OWNER_ID;

    // Log
		// assistant.log('Command', subcommand, options);

    // Response
		const response = new EmbedBuilder()
			.setColor(config.colors.green)
    const list = {};
		let description = `**${config.emojis.logo} ${Manager.config.brand.name} Commands ${config.emojis.logo}**\n`;

    // Loop through commands
		Object.keys(commands)
		.forEach(name => {
      // Get command
			const command = commands[name];
      const permission = command.permission;
      // const permission = command.data.default_member_permissions;

      // Log permission
      // assistant.log('Command', command);

      // CHECK PERMISSION HERE
      // if (permission && !permissions.has(BigInt(permission))) {
      //   // Skip this command if the user doesn't have the required permissions
      //   return;
      // }

      // Check permission
      if (permission === 'admin' && !isAdmin) {
        return;
      } else if (permission === 'moderator' && !isModerator) {
        return;
      } else if (permission === 'owner' && !isOwner) {
        return;
      };

      // Update list
      if (!list[permission]) {
        list[permission] = [`\n**${toTitleCase(permission)}**`];
      }

      // Update description
      list[permission].push(`${helpers.displayCommand(command.data.name)} - ${command.data.description}`);
			// description += ``
			// 	+ `${helpers.displayCommand(command.data.name)}: ${command.data.description}\n`
		})

    // Loop through list
    Object.keys(list)
    .forEach(category => {
      // Get commands
      const commands = list[category];

      // Update description
      description += `${commands.join('\n')}\n`;
    });

    // Set
    response
      .setDescription(description)

    // Respond
    return interaction.editReply({ content: '', embeds: [response] });
	},
};


function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}
