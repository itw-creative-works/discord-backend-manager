const { Role, EmbedBuilder, roleMention, channelMention } = require('discord.js');

module.exports = {
  data: {
    interval: 3.6e+6 * 13, // 12 hours
    runInitially: true,
    initialDelay: process.env.ENVIRONMENT === 'development'
      ? false // Disabled
      : 3.6e+6 * 1, // 1 hour
    // enabled: false,
    // enabled: true,
    enabled: process.env.ENVIRONMENT !== 'development',
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Load libraries
    const _ = Manager.require('lodash');
    const powertools = Manager.require('node-powertools');

    function _process(doc, index) {
      return new Promise(async function(resolve, reject) {
        const data = doc.data();
        const discordId = _.get(data, 'oauth2.discord.identity.id');
        const discordMember = await helpers.getOfficialServerMember(discordId || '-1').catch(e => e)
        const discordMemberIsValid = discordMember && !(discordMember instanceof Error)
        const discordMemberIsActive = discordMemberIsValid && discordMember.roles.cache.has(config.roles.active);
        const discordMemberIsPremium = discordMemberIsValid && discordMember.roles.cache.has(config.roles.premium);
        const discordMemberIsBooster = discordMemberIsValid && discordMember.roles.cache.has(config.roles.serverBooster);

        if (assistant.isDevelopment()) {
          assistant.log(`remove-inactive-beta ${index}: uid=${data.auth.uid}, discord=${discordId}, valid=${discordMemberIsValid}, active=${discordMemberIsActive}, premium=${discordMemberIsPremium}, booster=${discordMemberIsBooster}`);
        }

        // Check activity
        if (
          discordMemberIsValid
          && (discordMemberIsActive || discordMemberIsPremium || discordMemberIsBooster)
        ) {
          return resolve();
        }

        // Remove beta role and application
        await Manager.libraries.initializedAdmin.firestore().doc(`users/${data.auth.uid}`)
        .set({
          // betaTesterApplication: {},
          roles: {
            betaTester: false,
          }
        }, {merge: true});

        // If not in Discord, ignore this part
        if (!discordMemberIsValid) {
          return resolve();
        }

        // Remove from Discord Beta Role
        await discordMember.roles.remove(config.roles.betaTester).catch(e => e);

        await helpers.sendError(discordMember,
          `${config.emojis.betaTester} Hi, ${discordMember}. Unfortunately, you have been removed from the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Program**\n`
          + `\n`
          + `As per the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Program** activity requirements, you need to be active in our Discord server and provide feedback on the ${helpers.getPrettyRole('beta')} modules in order to maintain your membership to the program.\n`
          + `\n`
          + `If you believe this is an error, you can use ${channelMention(config.channels.chat.support)} to appeal this decision.\n`,
          {embed: true}
        )
        .catch(e => e);

				helpers.sendToLogChannel(`**${helpers.displayMember(discordMember, true)}** is no longer a ${helpers.getPrettyRole('beta')} due to prolonged inactivity.`);

        return resolve();
      });
    }

    // Process all users who have betaTester role
    await Manager.Utilities().iterateCollection(function (batch, index) {
      return new Promise(async function(resolve, reject) {

        for (var i = 0; i < batch.docs.length; i++) {
          if (i % config.waitTrigger === 0) {
            await powertools.wait(config.waitAmount);
          }
          await _process(batch.docs[i], index + i);
        }

        return resolve();
      });

    }, {
      collection: 'users',
      batchSize: 100,
      log: true,
      where: [
        {field: 'roles.betaTester', operator: '==', value: true}
      ],
    })

    assistant.log('Finished processing remove-inactive-beta');
  }
}
