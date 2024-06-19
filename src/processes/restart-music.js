module.exports = {
  data: {
    // every 10 mintues
    interval: 1000 * 60 * 10,
    runInitially: true,
    initialDelay: process.env.ENVIRONMENT === 'development'
      ? 1000 * 30 // 30 seconds
      : 1000 * 60 * 1, // 1 Minute
    enabled: true,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Check if distube is enabled
    if (!client.distube) {
      return assistant.error('Distube is not enabled');
    }

    // get official server
    const officialServer = await helpers.getOfficialServer();
    const queue = client.distube.getQueue(officialServer);

    if (queue?.songs?.length > 0) {
      assistant.log('Skipping music restart because the queue is not empty');
      return;
    }

    assistant.log('Restarting music');

    // Play song if not playing
    helpers.playSongInVoiceChannel();
  }
}
