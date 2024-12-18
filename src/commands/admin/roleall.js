const { SlashCommandBuilder, EmbedBuilder, Role } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('roleall')
      .setDescription('Give a role to all members in the server')
      .addRoleOption(option => option.setName('role').setDescription('Role to give to everyone').setRequired(true))
  ],
  options: {
		role: {type: 'role', default: undefined},
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

    // Loop through all members in the server
    const members = await client.guilds.cache.get(interaction.guild.id).members.fetch().catch(e => e);

		if (members instanceof Error) {
      return helpers.sendError(interaction, `Failed to fetch members: ${members}`, {embed: true})
		}

    // Loop through all members
    const membersArray = [...members.values()]
      .filter(member => !member.user.bot && !member.roles.cache.has(options.role.id));

    // Loop through members using for loop
    setTimeout(function () {
      for (let i = 0; i < membersArray.length; i++) {
        const member = membersArray[i];

        // Add the role to the member
        member.roles.add(options.role.id)
        .then((r) => {
          assistant.log('Role added to member', member.id);
        })
        .catch((e) => {
          assistant.error('Failed to add role to member', member.id, e);
        });
      }
    }, 1);

    // Calculate time (in minutes) if each request takes 0.3 seconds
    const estimatedTime = ((membersArray.length * 0.3) / 60).toFixed(2);

    // Send a reply to the interaction
    return interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.green)
          .setDescription(
            `:partying_face: **@everyone** (${membersArray.length} members) is being given the ${options.role} role! This should take about **${estimatedTime} minutes**.`
          )
      ]
    });

	},
};
