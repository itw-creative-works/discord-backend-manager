module.exports = {
  data: {
    interval: 3.6e+6 * 2, // 1 hours
    runInitially: true,
    initialDelay: 3.6e+6 * 1, // 1 hour
    enabled: true,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Load libraries
    const _ = Manager.require('lodash');
    const powertools = Manager.require('node-powertools');

    // Set prize drop
    const doDrop = powertools.random(0, 100) > 50;
    const dropTime = powertools.random(0, 3.6e+6 * 2);

    // Log
    assistant.log(`Prize drop: doDrop=${doDrop}, dropTime=${dropTime / 60000} minutes`);

    // Drop prize
    setTimeout(function () {
      assistant.log('🎁 DROPPIN PRIZZESSSS!!!');
    }, dropTime);

  }
}
