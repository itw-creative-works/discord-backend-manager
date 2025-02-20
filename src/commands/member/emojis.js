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

    // Split the emojis into chunks of 10 emojis and send them
    for (let i = 0; i < emojis.length; i += chunk) {
      const current = emojis.slice(i, i + chunk);
      const isFirst = i === 0;
      const item = `${isFirst ? '**Emojis**:\n' : ''}${current.join('\n')}`;

      // Send to current channel
      if (isFirst) {
        await interaction.editReply({
          content: item,
          embeds: [],
        });
      } else {
        await interaction.channel.send(item);
      }
    }
	},
};
