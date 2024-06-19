module.exports = {
  data: {
    interval: 3.6e+6 * 24, // 24 hours
    runInitially: true,
    initialDelay: 1, // 1 hour
    enabled: false,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Log
    assistant.log(`🚀 Clearing local messages...`);

    const storage = Manager.storage({name: 'messages'});

    // Clear all messages
    storage.setState({}).write();
  }
}
