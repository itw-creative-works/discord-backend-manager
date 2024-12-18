const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, roleMention, channelMention } = require('discord.js');

/*
	From: https://github.com/3chospirits/discord-music-bot/blob/a260d1eb43a974ea232c603c93b0e1f40647ae68/slash/play.js
*/

module.exports = {
	data: [
    new SlashCommandBuilder()
      .setName('join')
      .setDescription('Make the bot join a voice channel')
      .addChannelOption(option => option.setName('channel').setDescription('The channel to join').setRequired(true))
  ],
  options: {
		channel: {type: 'channel', default: undefined},
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

    // Libraries
    const { get } = Manager.require('lodash');

		// assistant.log('Command', subcommand, options);

		Manager.storage().set('lastActiveVoiceChannel', options.channel.id).write();

		const channel = await helpers.getOfficialServerChannel(options.channel.id);

		await helpers.joinVoiceChannel(options.channel.id);

		// const botMember = await helpers.getOfficialServerMember(client.user.id);

		// Remove deafen and mute
		// botMember.voice.setSelfDeaf(false);
		// botMember.voice.setSelfMute(false);

		return helpers.sendNormal(interaction, `Successfully joined ${channelMention(options.channel.id)}.`, {embed: true});

	},
};
