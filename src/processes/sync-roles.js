const { Role, EmbedBuilder, roleMention } = require('discord.js');

module.exports = {
  data: {
    interval: 3.6e+6 * 13, // 12 hours
    initialDelay: process.env.ENVIRONMENT === 'development'
      ? false // Disabled
      : 3.6e+6 * 1, // 1 hour
    runInitially: true,
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
    const moment = Manager.require('moment');
    const fetch = Manager.require('wonderful-fetch');

    // Set variables
    let errors = [];

    options = options || {};
    options.id = options.id;
    // options.id = '549076304830660619';

    async function _process(member) {
      let rolesToAdd = [];
      let rolesToRemove = [];
      // assistant.log('Processing', member.id);

      if (process.env.ENVIRONMENT === 'development') {
        assistant.log('Processing', member.id);
      }

      // Helpers
      async function _addRole(member, role) {
        const roleName = (member.guild.roles.cache.get(role) || {}).name;
        const hasRole = !!member.roles.cache.get(role);

        // assistant.log('_addRole', member.user.username, roleName, hasRole);
        if (!hasRole) {
          rolesToAdd = rolesToAdd.concat(role);
          rolesToRemove = rolesToRemove.filter(val => val !== role);
          // assistant.log('...adding');
          // assistant.log('_addRole', member.user.username, roleName, hasRole);
        }
      }

      async function _removeRole(member, role) {
        const roleName = (member.guild.roles.cache.get(role) || {}).name;
        const hasRole = !!member.roles.cache.get(role);

        // assistant.log('_removeRole', member.user.username, roleName, hasRole);
        if (hasRole) {
          rolesToRemove = rolesToRemove.concat(role);
          rolesToAdd = rolesToAdd.filter(val => val !== role);
          // assistant.log('...removing');
          // assistant.log('_removeRole', member.user.username, roleName, hasRole);
        }
      }

      async function _resolveRoles() {
        if (member.user.bot) {
          // Give every bot member the Bot role
          _removeRole(member, config.roles.member);
          _addRole(member, config.roles.bot);
        } else {
          const linkedAccount = await helpers.getFirebaseAccount(member.id).catch(e => e);
          const discordProfile = await profile.get(member.id);
          const betaTesterStatus = helpers.betaTesterStatus(member, discordProfile);

          // assistant.log('[sync-roles]', member.id, linkedAccount.auth.uid);

          if (linkedAccount instanceof Error) {
            return;
          }

          // Give linked
          if (linkedAccount.auth.uid) {
            _addRole(member, config.roles.linked);
          } else {
            _removeRole(member, config.roles.linked);
          }

          // Prepare Firebase roles
          if (linkedAccount.auth.uid && moment(linkedAccount.activity.created.timestamp).isBefore(moment(config.settings.ogCutoffDate))) {
            linkedAccount.roles.og = true;
          }

          // Fix other roles
          Manager.Roles().list()
          .forEach(role => {
            // const discordSnowflake = config.roles[role.id];
            const discordRoleId = Object.keys(config.roles).find(key => key.match(role.regex))
            const discordRoleSnowflake = config.roles[discordRoleId];
            const hasRole = !!linkedAccount.roles[role.id];

            if (discordRoleSnowflake) {
              if (hasRole) {
                _addRole(member, discordRoleSnowflake).catch(e => e)
              } else {
                _removeRole(member, discordRoleSnowflake).catch(e => e)
              }
            }
          });

          // Give every human member the Member role
          _addRole(member, config.roles.member);
          _removeRole(member, config.roles.bot);

          // Fix premium & betaTester roles
          if (linkedAccount.plan.id !== 'basic') {
            _addRole(member, config.roles.premium);
          } else {
            _removeRole(member, config.roles.premium);
          }

          // Grant/revoke @Active role if need to
          const totalMessages = _.get(discordProfile, 'stats.message.total', 0);
          const thisWeekMessages = _.get(discordProfile, 'stats.message.week', 0);
          const thisMonthMessages = _.get(discordProfile, 'stats.message.month', 0);
          const lastActiveDate = moment(_.get(discordProfile, 'activity.lastActivity.timestamp', 0));
          const lastActiveDays = moment().diff(lastActiveDate, 'days', true);
          const hasActiveRole = member.roles.cache.get(config.roles.active);
          const activeMessage = `**${helpers.displayMember(member, true)}** just had the **${helpers.getPrettyRole('active')}** role {status}! \n**Last Active:** ${lastActiveDate} (${lastActiveDays.toFixed(2)} days ago) \n**Total Chats:** ${totalMessages} \n**Weekly Chats:** ${thisWeekMessages} \n**Monthly Chats:** ${thisMonthMessages}`;

          if (
            // If they haven't been here for a week and their messages are lacking, remove active
            hasActiveRole
            && lastActiveDays > 14
            && (thisWeekMessages < 5 && thisMonthMessages < 10)
          ) {
            helpers.sendToLogChannel(activeMessage.replace(/{status}/ig, 'revoked'))
            _removeRole(member, config.roles.active);
          } else if (
            // If theyre active, they get the role
            !hasActiveRole
            && lastActiveDays < 7
            && (thisWeekMessages > 30 || thisMonthMessages > 60)
          ) {

            // Log the change
            helpers.sendToLogChannel(activeMessage.replace(/{status}/ig, 'granted'))

            // Only actually add the role if it's production
            if (process.env.ENVIRONMENT !== 'development') {
              _addRole(member, config.roles.active);

              const dest = await helpers.getOfficialServerChannel('chat.hangout')
              await helpers.sendNormal(dest, `**${helpers.displayMember(member, true)}** has been granted the **${config.emojis.active} ${helpers.getPrettyRole('active')}** role for being a superstar!`, {embed: true})

              // helpers.getOfficialServerChannel(process.env.ENVIRONMENT === 'development' ? 'admins.testLog' : 'chat.hangout')
              // .then(channel => {
              //   channel.send({
              //     embeds: [
              //       new EmbedBuilder()
              //         .setTitle(`Role unlocked!`)
              //         .setColor(config.colors.blue)
              //         .setDescription(`**${helpers.displayMember(member, true)}** has been granted the **${helpers.getPrettyRole('active')}** role for being a superstar!`)
              //     ]
              //   })
              // })
            }
          }

          // Approve beta application
          // assistant.log('---APP', member.id, linkedAccount.auth.uid, linkedAccount.roles.betaTester, betaTesterStatus.applicationAccepted);
          // ---APP 600971083520147466 null false true
          if (
            linkedAccount.auth.uid
            && !linkedAccount.roles.betaTester
            && betaTesterStatus.applicationAccepted
          ) {
            helpers.betaTesterAccept(member, linkedAccount.auth.uid)
          }

          // Test Discord OAauth2
          // fetch('https://discord.com/api/users/@me', {
          // 	method: 'get',
          // 	headers: {
          // 		'User-Agent': 'DiscordBot (https://somiibo.com, 1.2.3)',
          // 		'Authorization': `Bearer ${},
          // 	},
          // 	response: 'json',
          // })
          // .then((res) => assistant.log(`Successfully got user!`, res))
          // .catch((e) => assistant.error(`Failed to get user:`, e))
        }
      }

      // Resolve roles
      await _resolveRoles();

      // Actually add/remove the roles
      if (rolesToAdd.length > 0) {
        await member.roles.add(rolesToAdd).catch(e => errors = errors.concat([[`Failed to add roles`, member.user.username, member.id, rolesToAdd, e]]))
      }
      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove).catch(e => errors = errors.concat([[`Failed to remove roles`, member.user.username, member.id, rolesToRemove, e]]))
      }

    }

    await helpers.getOfficialServerMember(options.id)
      .then(async (result) => {
        // const memberRoleCount = await helpers.getOfficialServerRoleMembers(config.roles.member);
        // assistant.log('memberRoleCount', memberRoleCount.size, memberRoleCount.length);
        assistant.log('sync-roles size', result.size || 1);

        if (result.forEach) {
          for (var i = 0; i < result.size; i++) {
            const member = result.at(i);

            // if (member.id !== config.main.owner) { continue; }

            if (i % 10 === 0 && config.settings.intermissionDelay) {
              await powertools.wait(config.settings.intermissionDelay);
            }
            _process(member)
          }
        } else {
          return _process(result)
        }

      })

      assistant.error(`sync-roles errors ${errors.length}...`);
      errors.forEach(e => {
        assistant.error(...e);
      });
      assistant.log('Finished processing sync-roles');
  }
}
