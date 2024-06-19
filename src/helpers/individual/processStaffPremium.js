const { EmbedBuilder, AuditLogOptionsType } = require('discord.js');

module.exports = async function (instance, member) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Load libraries
  const powertools = Manager.require('node-powertools');
  const moment = Manager.require('moment');

  // Only process if staff
  if (!member.roles.cache.get(config.roles.staff)) {
    return;
  }

  // Only small chance of it happening
  // if (powertools.random(0, 100) > 90 && assistant.isProduction()) {
  if (powertools.random(0, 100) < 90) {
    return;
  }

  const eventId = 'discord-auto-premium'
  const expires = moment().add(3, 'days');
  const expiresObject = {
    timestamp: expires.toISOString(),
    timestampUNIX: expires.unix(),
  }
  const timeObject = {
    timestamp: moment().toISOString(),
    timestampUNIX: moment().unix(),
  }
  const account = await helpers.getFirebaseAccount(member.id);

  // Give them premium
  await Manager.libraries.initializedAdmin.firestore().doc(`users/${account.auth.uid}`)
  .set({
    plan: {
      id: 'premium',
      expires: expiresObject,
      status: 'active',
      payment: {
        ignoreUntil: expiresObject,
        updatedBy: {
          date: timeObject,
          event: {
            id: eventId,
            name: eventId,
          },
        }
      }
    }
  }, {merge: true})
  .then(() => {
    helpers.sendToLogChannel(`${config.emojis.premium} **${helpers.displayMember(member, false)}** was given **${Manager.config.brand.name} Premium** for being active\n`)
  })

  // Sync roles for the user
  await processes['sync-roles'].execute(instance, {id: member.id})
}
