const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async function (instance, oldMember, newMember) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Load libraries

  // Variables
  const member = oldMember;
  // const member = newMember;
  const rolesUpdate = {};
  const rolesAdded = [];
  const rolesRemoved = [];
  const rolesAddedNames = [];
  const rolesRemovedNames = [];

  // If not the main server, return
  if (member.guild.id !== config.main.server) {
    return;
  }

  // https://discord-addons.js.org/guildMemberUpdate_memberRoleAdd.js.html
  newMember.roles.cache.forEach((role) => {
    if (!oldMember.roles.cache.has(role.id)) {
      rolesAdded.push(role);
      rolesAddedNames.push(role.name);
      _handleRole('$add', role.id)
    }
  });

  oldMember.roles.cache.forEach((role) => {
    if (!newMember.roles.cache.has(role.id)) {
      rolesRemoved.push(role);
      rolesRemovedNames.push(role.name);
      _handleRole('$remove', role.id)
    }
  });
  // assistant.log('------Roles updated', member.user.username, 'added=', rolesAddedNames, 'removed=', rolesRemovedNames);

  function _handleRole(mode, id) {
    const managerRole = helpers.getManagerRole(id);
    if (managerRole) {
      if (mode === '$add') {
        rolesUpdate[managerRole.id] = true
      } else if (mode === '$remove') {
        rolesUpdate[managerRole.id] = false
      }
    }
  }

  // Log
  assistant.log(`[guildMemberUpdate] ${member.user.username}: roles=${JSON.stringify(rolesUpdate)}`);

  // Update Firebase
  if (Object.keys(rolesUpdate).length !== 0) {
    helpers.getFirebaseAccount(member.id)
    .then(async (account) => {

      if (account.auth.uid) {
        assistant.log('Sending update', account.auth.uid, rolesUpdate);
        Manager.libraries.initializedAdmin.firestore().doc(`users/${account.auth.uid}`)
        .set({
          roles: rolesUpdate
        }, {merge: true})
      }
    })
  }

  // Send Boost notification
  if (rolesAdded.find((r) => r.id === config.roles.serverBooster) || rolesAdded.find((r) => r.id === config.roles.serverBoosterTest)) {
    const announcements = await helpers.getOfficialServerChannel('information.announcements');

    await announcements.send({
      content: ``
        + `${config.emojis.boost} Thank you so much for the server boost, **${helpers.displayMember(member, true)}**!!!\n`
        + `\n`
        + `:partying_face: Your support means the world to us and the whole community. It's people like you who make this community such a special and supportive place to be!\n`
        + `\n`
        + `@here`
    })
  }

}
