const { SlashCommandBuilder, EmbedBuilder, roleMention, channelMention } = require('discord.js');

/*
	/test one user:@ianwieds#0001 uid:exzY8mmSnGVcrQvA4OvqMJas3d72 role:@Moderator channel:#📃guidelines mentionable:@Administrator string:test number:1.2 integer:1 boolean:False
*/

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('test')
      .setDescription('Test commands')
      .addSubcommand(subcommand =>
        subcommand
          .setName('one')
          .setDescription('one')
          .addUserOption(option => option.setName('user').setDescription('user'))
          .addStringOption(option => option.setName('uid').setDescription('uid'))
          .addRoleOption(option => option.setName('role').setDescription('role'))
          .addChannelOption(option => option.setName('channel').setDescription('channel'))
          .addMentionableOption(option => option.setName('mentionable').setDescription('mentionable'))
          .addStringOption(option => option.setName('string').setDescription('string'))
          .addNumberOption(option => option.setName('number').setDescription('number'))
          .addIntegerOption(option => option.setName('integer').setDescription('integer'))
          .addBooleanOption(option => option.setName('boolean').setDescription('boolean'))
		),
  ],
  options: {
		user: {type: 'user', default: undefined},
		uid: {type: 'uid', default: undefined, for: 'user'},
		role: {type: 'role', default: undefined},
		channel: {type: 'channel', default: undefined},
		mentionable: {type: 'mentionable', default: undefined},
		string: {type: 'string', default: undefined},
		number: {type: 'number', default: undefined},
		integer: {type: 'integer', default: undefined},
		boolean: {type: 'boolean', default: undefined},
	},
	// options: {
	// 	user: {type: 'user', default: '$self'},
	// 	uid: {type: 'uid', default: undefined, for: 'user'},
	// 	role: {type: 'role', default: undefined},
	// 	channel: {type: 'channel', default: '$self'},
	// 	mentionable: {type: 'mentionable', default: undefined},
	// 	string: {type: 'string', default: 'Test string'},
	// 	number: {type: 'number', default: 1},
	// 	integer: {type: 'integer', default: 1.5},
	// 	boolean: {type: 'boolean', default: false},
	// },
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

		// Test things
		// interaction.member.fetch()
		// .then(r => {
		// 	assistant.log('---- 1', r);
		// })

		// interaction.member.roles.fetch(config.roles.active)
		// .then(r => {
		// 	assistant.log('---- 2', r);
		// })

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Result')
					.setColor(config.colors.blue)
					.setDescription(''
						+ `**Subcommand**: ${subcommand}\n`
						+ `**User**: ${options.user ? helpers.displayMember(options.user, true) : options.user}\n`
						+ `**Uid**: ${options.uid}\n`
						+ `**Role**: ${options.role}\n`
						+ `**Channel**: ${options.channel}\n`
						+ `**Mentionable**: ${options.mentionable}\n`
						+ `**String**: ${options.mentionable}\n`
						+ `**Number**: ${options.number}\n`
						+ `**Integer**: ${options.integer}\n`
						+ `**Boolean**: ${options.boolean}\n`
					)
			]
		});

	},
};
