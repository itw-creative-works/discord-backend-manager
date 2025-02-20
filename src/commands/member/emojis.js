const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('emojis')
      .setDescription('List the emojis in the server')
  ],
  options: {
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

    // Get all emojis in the server
    // const emojis = interaction.guild.emojis.cache.map(emoji => `${emoji}${emoji.name} - \`${emoji}\``);
    const emojis = interaction.guild.emojis.cache.map(emoji => `${emoji} \`${emoji}\``);
    const chunk = 20;

    // Log emojis
    // assistant.log('Emojis in the server:\n', emojis);

    // Split the emojis into chunks of 10 emojis and send them
    for (let i = 0; i < emojis.length; i += chunk) {
      const current = emojis.slice(i, i + chunk);
      const string = `${i === 0 ? '**Emojis**:\n' : ''}${current.join('\n')}`;
      // Send to current channel
      await interaction.channel.send(string);
    }

    // Return
    return;
	},
};
