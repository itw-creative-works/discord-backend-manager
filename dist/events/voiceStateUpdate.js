const { EmbedBuilder, BaseInteraction } = require('discord.js');

module.exports = async function (instance, oldVoiceState, newVoiceState) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Get the old and new voice channel IDs
  const oldUserChannel = oldVoiceState?.channel?.id;
  const newUserChannel = newVoiceState?.channel?.id;

  // Log the event
  assistant.log('voiceStateUpdate event:', oldUserChannel, newUserChannel);

  function _playSong() {
    setTimeout(function () {
      helpers.playSongInVoiceChannel();
    }, Manager.assistant.meta.environment === 'development' ? 1000 : 30000);
  }

  // If the bot is the one who changed voice state
  if (newVoiceState.id === client.user.id) {
    // If bot is in a channel, save it as the last active channel
    if (newUserChannel) {
      Manager.storage().set(
        'lastActiveVoiceChannel',
        newUserChannel
      ).write();

			// Play a random song
      // _playSong();
    }

    // If bot is not in a channel, join the last active channel
    // if (oldUserChannel && !newUserChannel) {
    //   setTimeout(async function () {
    //     const botMember = await helpers.getOfficialServerMember(client.user.id)

    //     // If still not in a channel, join the default channel
    //     if (!botMember?.channel?.id) {
    //       await helpers.joinVoiceChannel(oldUserChannel);
    //     }

		// 	// Join the last active voice channel
		// 	// const currentVoiceChannel = await Manager.discord.helpers.joinVoiceChannel();
		// 	// assistant.log('Joined voice channel:', currentVoiceChannel.id);

		// 	// Play a random song
    //   // _playSong();

    //   }, 500);
    // }
  }
}
