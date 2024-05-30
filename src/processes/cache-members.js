module.exports = {
  data: {
    interval: false, // Disabled
    initialDelay: false, // Disabled
    runInitially: true,
    enabled: false,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Cache all members in the official server
    const members = await helpers.getOfficialServerMember();

    // Fetch all roles for each member
    members
    .forEach(member => {
      member.roles.fetch();
    });
  }
}
