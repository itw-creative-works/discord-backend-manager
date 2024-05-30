const { GuildMember, Role, Channel } = require('discord.js');

function Commands() {

}

Commands.resolve = function (instance, interaction, options, settings) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  return new Promise(async function(resolve, reject) {
    const response = {}
    let subcommand;

    if (!options) {
      return resolve({
        interaction: interaction,
        subcommand: subcommand,
        options: response,
      })
    }

    settings = settings || {};
    // settings.preferUID = typeof settings.preferUID === 'undefined' ? true : settings.preferUID;
    // settings.defaultToSelf = typeof settings.defaultToSelf === 'undefined' ? true : settings.defaultToSelf;

    const flags = {
      users: [],
      uids: [],
    }

    // Main
    try {
      subcommand = interaction.options.getSubcommand();
    } catch (e) {
      subcommand = '';
    }

    // Fix options
    function _default(val, def, type) {
      const unset = typeof val === 'undefined' || val == null;
      const resolved = unset ? def : val;

      if (settings.log) {
        assistant.log('Default', type, val, def);
      }

      if (resolved === '$self') {
        if (type === 'user') {
          return interaction.member
        } else if (type === 'channel') {
          return interaction.channel
        } else {
          return resolved;
        }
      } else {
        return resolved;
      }
    }

    // Other
    Object.keys(options)
    .forEach(name => {
      const type = options[name].type;
      const def = typeof options[name].default === 'undefined' ? null : options[name].default;
      const fer = options[name].for;

      if (type === 'user') {
        response[name] = _default(interaction.options.getMember(name), def, type)
        flags.users.push({name: name, value: response[name]})
      } else if (type === 'uid') {
        response[name] = _default(interaction.options.getString(name), def, type)
        flags.uids.push({name: name, value: response[name], for: fer})
      } else if (type === 'role') {
        response[name] = _default(interaction.options.getRole(name), def, type)
      } else if (type === 'channel') {
        response[name] = _default(interaction.options.getChannel(name), def, type)
      } else if (type === 'mentionable') {
        response[name] = _default(interaction.options.getMentionable(name), def, type)
      } else if (type === 'string') {
        response[name] = _default(interaction.options.getString(name), def, type)
      } else if (type === 'number') {
        response[name] = _default(interaction.options.getNumber(name), def, type)
      } else if (type === 'integer') {
        response[name] = _default(interaction.options.getInteger(name), def, type)
      } else if (type === 'boolean') {
        response[name] = _default(interaction.options.getBoolean(name), def, type)
      }
    });

    if (settings.log) {
      assistant.log('Response 1', response);
      assistant.log('Flags 1', flags);
    }

    // Fix flags
    for (var i = 0; i < flags.uids.length; i++) {
      const uid = flags.uids[i];
      if (uid.value && uid.for) {
        const found = await helpers.getFirebaseAccount(uid.value).catch(e => e)
        if (found instanceof Error) {
          return reject(found)
        } else {
          const id = found?.oauth2?.discord?.identity?.id;

          // Set to null if not found
          response[uid.for] = null;

          // Fetch member
          if (!id) {
            return;
          }

          // Fetch member
          await interaction.guild.members.fetch(id)
          .then(member => {
            response[uid.for] = member;
            flags.users = flags.users.filter(u => u.name !== uid.for);
          })
          .catch(e => {
            response[uid.for] = null;
          })
        }
      }
    }

    if (settings.log) {
      assistant.log('Response 2', response);
      assistant.log('Flags 2', flags);
    }

    return resolve({
      interaction: interaction,
      subcommand: subcommand,
      options: response,
    })

  });

}

module.exports = Commands;

