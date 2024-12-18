const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('music')
      .setDescription('Listen to music from YouTube')
      .addSubcommand(subcommand =>
        subcommand
          .setName('play')
          .setDescription('Listen to music from YouTube')
          .addStringOption(option => option.setName('song').setDescription('The YouTube link to play or search for').setRequired(true))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('queue')
          .setDescription('Display the song queue')
      )
  ],
  options: {
		song: {type: 'string', default: undefined},
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

		let message = '';

    // Check if music feature is enabled
    if (!client.distube) {
      return helpers.sendError(interaction, `The music feature is temporarily disabled.`, {embed: true});
    }

		// https://distube.js.org/#/docs/DisTube/stable/class/DisTube

		if (subcommand === 'play') {
      // get current queue
      let queue = client.distube.getQueue(interaction.guild);
			let currentSong = queue?.songs[0];

			await helpers.playSongInVoiceChannel(options.song, interaction.member);

			// Play song if not playing
			if (!currentSong) {
				// await helpers.playSongInVoiceChannel(options.song);
			} else {
			}

      // get updated queue
      queue = client.distube.getQueue(interaction.guild);
			currentSong = queue?.songs[0];

			// const song = result.tracks[0];

			// if (!song) {
			// 	return helpers.sendError(interaction, `No results for: ${options.song}`, {embed: true});
			// }

			// // Add song to queue
			// await queue.addTrack(song)

			// // Play if not playing
			// if (!queue.playing) {
			// 	await queue.play()
			// 	message = `**[${song.title}](${song.url})** is now playing!`;
			// } else {
			// 	message = `**[${song.title}](${song.url})** has been added to the Queue!`;
			// }

			// // Send response
			return helpers.sendNormal(interaction, message, {
				embed: true,
				thumbnail: currentSong.thumbnail,
				footer: {text: `Duration: ${currentSong.duration}`}
			});
		} else if (subcommand === 'queue') {
      // Get queue
      const queue = client.distube.getQueue(interaction.guild);
			const currentSong = queue?.songs[0];

			// List songs in the queue
			const embed = new EmbedBuilder()
				.setColor(config.colors.blue)
				.setDescription(``
					+ `**${queue?.songs?.length || 0}** songs in the queue\n`
					+ `\n`
					+ `**Now Playing:**\n`
					+ `${currentSong
						? `**[${currentSong.name}](${currentSong.url})**`
						: `Nothing is playing!`
					}\n`
					+ `\n`
					+ `**Up Next:**\n`
					+ `${
						queue?.songs?.length > 0
							? `${queue.songs.slice(1, 10).map((track, i) => `**${i + 1}**. **[${track.title}](${track.url})**`).join('\n')}`
							: `Nothing is queued!`
					}\n`
				)
				.setTimestamp()

			if (currentSong) {
				embed
					.setThumbnail(currentSong.thumbnail)
					.setFooter({text: `Duration: ${currentSong.duration ? currentSong.duration : 'Live'}`})
			}

			// Send response
			return helpers.sendNormal(interaction, embed);
		}
	},
};
