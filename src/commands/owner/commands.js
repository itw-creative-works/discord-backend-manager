const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('commands')
      .setDescription('Enable or disable server commands')
      .addStringOption((option) =>
        option.setName('status')
          .setDescription('The status of commands')
          .setRequired(true)
          .addChoices(
            {
              name: 'Enabled',
              value: 'enabled'
            },
            {
              name: 'Disabled',
              value: 'disabled'
            }
          )
      )
  ],
  options: {
		status: {type: 'string', default: undefined},
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

    // Quit if not in development
		if (Manager.assistant.isDevelopment()) {
      return
		}

    // Enable or disable commands
    if (options.status === 'disabled') {
      setTimeout(function () {
        Manager.discord.options.enableCommands = true;
        // return helpers.sendNormal(interaction.channel, 'Server commands enabled.')
      }, config.settings.commandDisableTime);
      Manager.discord.options.enableCommands = false;
      // return helpers.sendNormal(interaction, 'Server commands disabled.')
    } else {
      Manager.discord.options.enableCommands = true;
      // return helpers.sendNormal(interaction, 'Server commands enabled.')
    }
	},
};
