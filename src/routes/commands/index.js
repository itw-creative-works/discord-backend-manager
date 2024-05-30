function Route() {
  const self = this;

  return self;
}

Route.prototype.main = async function (assistant) {
  const self = this;

  // Set shortcuts
  const Manager = assistant.Manager;
  const usage = assistant.usage;
  const user = assistant.usage.user;
  const analytics = assistant.analytics;
  const settings = assistant.settings;
  const DiscordManager = Manager.DiscordManager;
  const instance = DiscordManager.instances[settings.app];

  // Load Discord Libraries
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;

  // Load preloaded libraries
  // ..

  // Send analytics event
  analytics.event({
    name: 'discord/admin/commands',
    params: {},
  });

  // Check for user authentication
  if (!user.roles.admin && assistant.isProduction()) {
    return assistant.respond(`Admin required`, {code: 401});;
  }

  // Log
  if (settings.status == 'disabled') {
    setTimeout(function () {
      instance.discord.options.enableCommands = true;
    }, settings.duration + 5000);

    instance.discord.options.enableCommands = false;
  } else {
    instance.discord.options.enableCommands = true;
  }

  // Log
  assistant.log(`Command status: ${instance.discord.options.enableCommands}`);

  // Return success
  assistant.respond({
    status: instance.discord.options.enableCommands ? 'enabled' : 'disabled',
  });
};

module.exports = Route;


// module.exports = {
//   data: {
//     // method: ['GET', 'POST'],
//     // path: 'commands',
//   },
//   execute: function (request, reply) {
//     const Manager = global.Manager;
//     const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

//     // Set options
//     request.body.status = request.body.status || 'enabled';
//     request.body.duration = request.body.duration || config.settings.commandDisableTime;

//     if (request.body.backendManagerKey !== process.env.BACKEND_MANAGER_KEY) {
//       return reply
//         .code(401)
//         .send('Unauthenticated')
//     }

//     if (request.body.status == 'disabled') {
//       setTimeout(function () {
//         Manager.discord.options.enableCommands = true;
// 				// helpers.sendToLogChannel('Server commands enabled.')
//       }, request.body.duration + 5000);

//       Manager.discord.options.enableCommands = false;
//       // helpers.sendToLogChannel('Server commands disabled.')
//     } else {
//       Manager.discord.options.enableCommands = true;
//       // helpers.sendToLogChannel('Server commands enabled.')
//     }

//     assistant.log(`Command status: ${Manager.discord.options.enableCommands}`);

//     return reply
//       .code(200)
//       .header('Content-Type', 'application/json; charset=utf-8')
//       .send({ status: Manager.discord.options.enableCommands ? 'enabled' : 'disabled' })
//   }
// }
