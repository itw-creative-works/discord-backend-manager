module.exports = {
  data: {
    interval: 3.6e+6 * 1, // 1 hour
    initialDelay: false, // 1 hour
    runInitially: true,
    enabled: true,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Load libraries
    const fetch = Manager.require('wonderful-fetch');

    // Set variables
    const members = await helpers.getOfficialServerMember();
    const membersChannel = await helpers.getOfficialServerChannel('stats.members').catch((e) => null);
    const botsChannel = await helpers.getOfficialServerChannel('stats.bots').catch((e) => null);
    const accountsChannel = await helpers.getOfficialServerChannel('stats.accounts').catch((e) => null);
    const onlineChannel = await helpers.getOfficialServerChannel('stats.online').catch((e) => null);

    const countHumans = members.filter(member => !member.user.bot).size
    const countBots = members.filter(member => member.user.bot).size

    // Update members
    if (config.settings.stats.members && membersChannel) {
      membersChannel.setName(`Members: ${addCommas(countHumans)}`)
    }

    // Update bots
    if (config.settings.stats.bots && botsChannel) {
      botsChannel.setName(`Bots: ${addCommas(countBots)}`)
    }

    // Fetch stats
    fetch(`${instance.app.server}/bm_api`, {
      method: 'post',
      response: 'json',
      body: {
        backendManagerKey: process.env.BACKEND_MANAGER_KEY,
        command: 'admin:get-stats',
        payload: {
          update: false,
        },
      },
    })
    .then(async (response) => {

      // Log
      assistant.log('Stats', {
        humans: countHumans,
        bots: countBots,
        accounts: response.users.total,
        online: response.users.online,
      });

      // Update accounts
      if (config.settings.stats.accounts && accountsChannel) {
        accountsChannel.setName(`Accounts: ${addCommas(response.users.total)}`)
      }

      // Update online
      if (config.settings.stats.online && onlineChannel) {
        onlineChannel.setName(`Online: ${addCommas(response.users.online)}`)
      }
    })
  }
}

function addCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
