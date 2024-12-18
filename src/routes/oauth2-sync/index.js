
const { EmbedBuilder } = require('discord.js');

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
  const { get } = Manager.require('lodash')

  // Send analytics event
  analytics.event({
    name: 'discord/admin/oauth2-sync',
    params: {},
  });

  // Check for user authentication
  // if (!user.roles.admin) {
  //   return assistant.respond(`Admin required`, {code: 401});;
  // }

  // Get UID
  const authUid = settings?.payload?.user?.auth?.uid;
  if (!authUid) {
    return assistant.respond({status: 'success'});
  }

  // Retrieve Firebase account
  const account = await helpers.getFirebaseAccount(authUid);
  const discordId = account?.oauth2?.discord?.identity?.id;

  // Sync roles
  await processes['sync-roles'].execute(instance, {id: discordId})
  .catch(e => {
    assistant.error('Error', e);
  })

  if (discordId) {
    const channel = await helpers.getOfficialServerChannel('chat.commands');
    const member = await helpers.getOfficialServerMember(discordId)
    await member.send({
      embeds:
        [
          new EmbedBuilder()
            .setColor(config.colors.green)
            .setTitle(`${Manager.config.brand.name} account linked`)
            .setDescription(`${config.emojis.logo} **Hey, ${helpers.displayMember(member)}**, you have successfully linked your **${Manager.config.brand.name}** account to Discord.`)
        ]
    })
  }

  // Return success
  return assistant.respond({status: 'success'});
};

module.exports = Route;


// module.exports = {
//   data: {
//     // method: ['GET', 'POST'],
//     // path: 'restart',
//   },
//   execute: async function (request, reply) {
//     const Manager = global.Manager;
//     const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

//     const { get } = Manager.require('lodash')

//     // if (request.body.backendManagerKey !== process.env.BACKEND_MANAGER_KEY) {
//     //   return reply
//     //     .code(401)
//     //     .send('Unauthenticated')
//     // }

//     // console.log('RECEIVED LINK REQUEST!', request.body);

//     const authUid = get(request.body, 'payload.user.auth.uid');
//     if (!authUid) {
//       return reply
//         .code(200)
//         .header('Content-Type', 'application/json; charset=utf-8')
//         .send({ status: 'success' })
//     }
// 		const account = await helpers.getFirebaseAccount(authUid);
//     const discordId = get(account, 'oauth2.discord.identity.id');

//     await processes['sync-roles'].execute(instance, {id: discordId})
//     .catch(e => {
//       console.error('Error', e);
//     })

//     if (discordId) {
//       const channel = await helpers.getOfficialServerChannel('chat.commands');
//       const member = await global.Manager.discord.helpers.getOfficialServerMember(discordId)
//       await member.send({
//         embeds:
//           [
//             new EmbedBuilder()
//               .setColor(config.colors.green)
//               .setTitle(`${Manager.config.brand.name} account linked`)
//               .setDescription(``
//                 + `${config.emojis.logo} **Hey, ${helpers.displayMember(member)}**, you have successfully linked your **${Manager.config.brand.name}** account to Discord.\n`
//                 // + `\n`
//                 // + `You can earn **${config.main.currency}** in the server and use them to purchae free *${Manager.config.brand.name} Premium**! Use ${helpers.displayCommand('account')} in the ${channel} channel.\n`
//               )
//           ]
//       })
//     }

//     return reply
//       .code(200)
//       .header('Content-Type', 'application/json; charset=utf-8')
//       .send({ status: 'success' })
//   }
// }
