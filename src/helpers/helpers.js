const { EmbedBuilder, BaseChannel, SnowflakeUtil, Role, GuildMember, DiscordAPIError, ActionRowBuilder, ButtonBuilder, ButtonStyle, userMention, roleMention } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
let _;
let powertools;
let moment;
let jetpack;
let get;

function Helpers(instance) {
  const self = this;

  // Set instance
  self.instance = instance;
  self.Manager = instance.Manager;

  // Load libraries
  _ = self.Manager.require('lodash');
  powertools = self.Manager.require('node-powertools');
  moment = self.Manager.require('moment');
  jetpack = self.Manager.require('fs-jetpack');
  get = self.Manager.require('lodash').get;

  // Return
  return self;
}

Helpers.prototype.getOfficialServer = async function () {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return await client.guilds.fetch(config.main.server);
}

Helpers.prototype.getOfficialServerChannel = async function (path) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return await client.guilds.fetch(config.main.server)
  .then(async (server) => {
    const channel = get(config.channels, path);
    return await server.channels.fetch(channel);
  })
}

Helpers.prototype.getOfficialServerRoleMembers = async function (role) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return await client.guilds.fetch(config.main.server)
  .then(async (server) => {
    // return server.roles.cache._.get(role).members;
    return (await server.roles.fetch(role)).members;
  })
}

Helpers.prototype.getOfficialServerMember = async function (id) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return await client.guilds.fetch(config.main.server)
  .then(async (server) => {
    return await server.members.fetch(id);
  })
}

Helpers.prototype.getOfficialServerEmoji = async function (name) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return await client.guilds.fetch(config.main.server)
  .then(async (server) => {
    return server.emojis.cache.find(e => e.name === name) || name;
  })
}

Helpers.prototype.displayMember = function (member, tag) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  if (member instanceof GuildMember) {
    const username = `${member.user.username}`
    return tag
      ? `${member} (${username})`
      : `${username}`
  } else if (self.isSnowFlake(member)) {
    return userMention(member.id);
  } else if (typeof member === 'string') {
    return `<Invalid Member: ${member}>`
  }
}

Helpers.prototype.displayCommand = function (name) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  const command = Manager.discord.publishedCommands.find(c => c.name === name);

  return `</${command.name}:${command.id}>`
}

Helpers.prototype.getPrettyRole = function (id) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  // Fix beta
  if (id === 'beta') {
    id = 'betaTester';
  }

  // Return
  return `${config.emojis[id]} ${roleMention(config.roles[id])}`
}

Helpers.prototype.getMemberInvite = async function (member) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  try {

    // To compare, we need to load the current invite list.
    const newInvites = await member.guild.invites.fetch();
    // This is the *existing* invites for the guild.
    const oldInvites = invites.get(member.guild.id);
    // Look through the invites, find the one for which the uses went up.
    const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
    // This is just to simplify the message being sent below (inviter doesn't have a tag property)
    // const inviter = await client.users.fetch(invite.inviter.id);
    const inviter = await member.guild.members.fetch(invite.inviter.id);

    // Get the log channel (change to your liking)
    // const logChannel = member.guild.channels.cache.find(channel => channel.name === 'join-logs');
    let total = 0
    newInvites
      .forEach(invite => {
        if (invite?.inviter?.id === inviter.id) {
          total += invite['uses']
        }
      });


    return {
      total: total,
      invite: invite,
      inviter: inviter,
    }
  } catch (e) {
    console.error('Failed to calculate invites', e);
    return {
      total: 0,
      invite: {
        uses: 0,
      },
      inviter: null,
    }
  }
}

Helpers.prototype.isSnowFlake = function (id) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  try {
    return SnowflakeUtil.deconstruct(id)
  } catch (e) {
    return false
  }
};

Helpers.prototype.getFirebaseAccount = function (id) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return new Promise(function(resolve, reject) {
    let query = Manager.libraries.initializedAdmin.firestore().collection('users')

    // Check if its a snowflake
    if (self.isSnowFlake(id)) {
      query = query.where('oauth2.discord.identity.id', '==', id)
    } else {
      query = query.where('auth.uid', '==', id)
    }

    // Get the account
    query
    .get()
    .then(snap => {
      let account = {};

      snap.forEach(doc => {
        account = doc.data();
      });

      return resolve(assistant.resolveAccount(account));
    })
  });
}

Helpers.prototype.privatize = function (email) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  let result = '';
  for (var i = 0, l = email.length; i < l; i++) {
    const token = email[i];
    result += (i === 0 || i === l - 1 || token === '@' || token === '.') ? token : '\\*';
  }
  return result;
}

Helpers.prototype.isPrivelagedMember = function (member) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  if (!member) {
    return false
  }

  const filter = member.roles.cache.filter(r => {
    return r.id === config.roles.admin
      || r.id === config.roles.staff
      || r.id === config.roles.moderator
      || r.id === config.roles.moderatorJr
  })

  return filter.size > 0
}

// Helpers.prototype.getSnowflakeRoleFromManager = function (id) {
// const self = this;
//   const Manager = self.Manager;
//   const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
//   const assistant = self.instance.assistant;

//   const managerRegex = Manager.Roles().list().find(r => r.id === id);
//   const discordId = Object.keys(config.roles).find(key => key.match(managerRegex))

//   return config.roles[discordId]
// }

Helpers.prototype.getManagerRole = function (id) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  const discordRoleId = Object.keys(config.roles).find(key => config.roles[key] === id) || '';
  const managerRole = Manager.Roles().list().find(r => discordRoleId.match(r.regex));

  return managerRole
}

// Helpers.prototype.setRoleAndSync = function (member, role, status) {
// const self = this;
//   const Manager = self.Manager;
//   const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
//   const assistant = self.instance.assistant;

//   const managerRole = self.getManagerRole(role);

//   return new Promise(function(resolve, reject) {

//     // Add role
//     console.log('---setRoleAndSync', member.id, managerRole.id, role);
//     Manager.discord.memberRoleUpdateIgnore.push({role: role, member: member.id})
//     member.roles[status](role)
//       .then(r => {

//         // If its a Manager role, add to Firestore
//         if (managerRole) {

//           // Check if their account is linked
//           self.getFirebaseAccount(member.id)
//             .then(async (account) => {

//               // console.log('---account', account);
//               // If their account is linked, add the role
//               if (account.auth.uid) {

//                 // Set payload because Node.js doesnt like when you do this directly in Firestore
//                 const payload = {
//                   roles: {
//                     [managerRole.id]: status === 'add',
//                   }
//                 }

//                 // Add to Firestore
//                 function _syncAttempt(attempt) {
//                   attempt = (attempt || 0) + 1;
//                   console.log('Sync attempt', attempt);

//                   // if (attempt > 3) {return}
//                   if (attempt > 1) {return}

//                   Manager.libraries.initializedAdmin.firestore().doc(`users/${account.auth.uid}`)
//                   .set(payload, {merge: true})
//                   .then(r => {
//                     console.log('Added role to Firebase and Discord', member.id, managerRole.id);

//                       Manager.libraries.initializedAdmin.firestore().doc(`users/${account.auth.uid}`)
//                       .get()
//                       .then(doc => {
//                         const data = doc.data();
//                         console.log('---FIREBASE', data.roles);
//                         console.log('---PAYLOAD', payload.roles);
//                         // if (data.roles[managerRole.id] !== payload.roles[managerRole.id]) {
//                           setTimeout(function () {
//                             _syncAttempt(attempt)
//                           }, attempt * 3000);
//                         // }
//                       })
//                       .catch(e => {})

//                     return resolve()
//                   })
//                   .catch(e => {
//                     return reject(e)
//                   })
//                 }

//                 _syncAttempt();

//               } else {
//                 console.log('Added role to Discord', member.id, managerRole.id);
//                 return resolve()
//               }

//             })
//         } else {
//           return resolve()
//         }
//       })
//       .catch(e => {
//         return reject(e);
//       })
//   });

// }

Helpers.prototype.betaTesterStatus = function (member, account) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  const roles = {
    active: member.roles.cache.has(config.roles.active),
    premium: member.roles.cache.has(config.roles.premium),
  }

  const timestamp = account?.betaTesterApplication?.applicationDate?.timestamp || new Date();
  const daysAppliedAgo = moment().diff(moment(timestamp), 'days', true);
  // const daysUntilAnswer = Math.max(1, config.settings.betaApplicationAcceptanceDays - daysAppliedAgo);

  return {
    daysAppliedAgo: Math.floor(daysAppliedAgo),
    // daysUntilAnswer: daysUntilAnswer,
    applicationDate: new Date(timestamp).toISOString(),
    applicationAccepted: (
      (roles.premium && daysAppliedAgo >= config.settings.betaApplicationAcceptanceDays.premium)
      || (roles.active && daysAppliedAgo >= config.settings.betaApplicationAcceptanceDays.active)
    ),
    applicationIsDayOld: daysAppliedAgo >= 1,
  }
};

Helpers.prototype.betaTesterAccept = async function (member, uid) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  // Manager.libraries.initializedAdmin.firestore().doc(`users/${uid}`)
  // .set({
  //   discord: {
  //     betaTester: {
  //       applicationApproved: true,
  //     }
  //   }
  // }, {merge: true})
  // .then(r => {
    // self.setRoleAndSync(member, config.roles.betaTester, 'add')
  // })


  console.log('[betaTesterAccept]', member.id, uid);

  await member.roles.add(config.roles.betaTester)

  await member.send({
    embeds: [
      new EmbedBuilder()
        .setColor(config.colors.purple)
        .setTitle(`${Manager.config.brand.name} Beta Tester Acceptance`)
        .setDescription(``
          + `${config.emojis.betaTester} Congrats, ${member}! You have been accepted into the **${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} Program**!\n`
          + `\n`
          + `${config.emojis.premium} Remember, you need to be active in our Discord server and have **${Manager.config.brand.name} Premium** to be able to use the ${Manager.config.brand.name} ${helpers.getPrettyRole('beta')} modules.\n`
          + `\n`
          + `:fire: [Purchase ${Manager.config.brand.name} Premium](${instance.app.url}/pricing)\n`
        )
    ]
  })
};

Helpers.prototype.formatNumber = function (num) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return parseFloat(num).toLocaleString('en-US');
}

Helpers.prototype.sendError = function (interface, content, options) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  options = options || {};
  options.embed = typeof options.embed === 'undefined' ? false : options.embed;

  let verb;
  if (interface instanceof BaseChannel || interface instanceof GuildMember) {
    verb = 'send';
  } else {
    verb = 'editReply';
  }

  console.error('sendError()', content);

  if (options.embed) {
    return interface[verb]({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.red)
          .setDescription(`:x: ${content}`)
      ],
    })
  } else {
    return interface[verb]({
      content: `:x: ${content}`,
      embeds: [],
    })
  }
}

Helpers.prototype.sendNormal = function (interface, content, options) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  options = options || {};
  options.embed = typeof options.embed === 'undefined' ? false : options.embed;

  let verb;
  if (interface instanceof BaseChannel || interface instanceof GuildMember) {
    verb = 'send';
  } else {
    verb = 'editReply';
  }

  console.log('sendNormal()', content);

  if (content instanceof EmbedBuilder) {
    return interface[verb]({
      content: '',
      embeds: [content],
    })
  } if (options.embed) {
    embed = new EmbedBuilder()
      .setColor(options.color || config.colors.blue)
      .setDescription(content)

    if (options.title) {
      embed.setTitle(options.title)
    }

    if (options.thumbnail) {
      embed.setThumbnail(options.thumbnail)
    }

    if (options.footer) {
      embed.setFooter(options.footer)
    }

    return interface[verb]({
      content: '',
      embeds: [embed],
    })
  } else {
    return interface[verb]({
      content: content,
      embeds: [],
    })
  }
}

Helpers.prototype.sendToOfficialServerChannel = function (channel, message) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  self.getOfficialServerChannel(channel)
  .then(channel => {
    return channel.send(message)
  })
}

Helpers.prototype.sendToLogChannel = function (msg) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  const isError = msg instanceof Error;

  if (isError) {
    console.error(msg);
  } else {
    console.log(msg);
  }

  self.getOfficialServerChannel('logs.botMainLogs')
  .then(channel => {
    return channel.send({
      // content: `${isError ? ':x:' : ''} ${msg}`,
      embeds: [
        new EmbedBuilder()
          .setColor(isError ? config.colors.red : config.colors.blue)
          .setDescription(msg)
      ]
    })
  })
}

Helpers.prototype.restart = function () {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  // Remove node_modules
  jetpack.remove('node_modules');

  // Restart the bot
  setTimeout(function () {
    require('child_process').exec('refresh', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return process.exit(1);
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return process.exit(1);
      }
    });
  }, 3000);
};

Helpers.prototype.joinVoiceChannel = function (channelId) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return new Promise(async function(resolve, reject) {
    const officialServer = await self.getOfficialServer()

    const channel = channelId || Manager.storage().get(
      'lastActiveVoiceChannel',
      Manager.discord.config[Manager.discord.config.channels.defaults.voice]
    ).value();

    if (channel) {
      console.log(`Joining last active voice channel: ${channel}`);
      joinVoiceChannel({
        guildId: officialServer.id,
        channelId: channel,
        adapterCreator: officialServer.voiceAdapterCreator,
      });

      Manager.storage().set(
        'lastActiveVoiceChannel',
        channel,
      ).write();
    }

    return resolve(
      officialServer.channels.cache.get(channel)
    );
  })
}

Helpers.prototype.playSongInVoiceChannel = function (query, member) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return new Promise(async function(resolve, reject) {
		const powertools = Manager.require('node-powertools');

    const lastActiveVC = Manager.storage().get('lastActiveVoiceChannel').value();
    const randomSong = powertools.random(Manager.discord.config.songs);
		const guild = await client.guilds.fetch(config.main.server);
		const botMember = await guild.members.fetch(client.user.id);

    const channelIdsToUse = [
      lastActiveVC,
      member?.voice?.channel?.id,
      botMember?.voice?.channel?.id,
      // config.channels.defaults.music,
    ];

    let channel;

    // Cycle through the channels to find the first one that is a voice channel
    for (var i = 0; i < channelIdsToUse.length; i++) {
      const channelId = channelIdsToUse[i];

      console.log('playSongInVoiceChannel(): trying channel...', channelId);

      channel = await guild.channels.cache.get(channelId);

      if (channel) {
        break;
      }
    }

    // If we didn't find a voice channel, reject
    if (!channel) {
      return reject(`No channel found for: ${channelIdsToUse}`);
    }

    // Attempt to join the voice channel and play music
    client.distube.play(channel, query || randomSong, {
      member: member || botMember,
      textChannel: channel,
    })
    .then((r) => {
      return resolve(r);
    })
    .catch((e) => {
      console.error('Failed to queued song', e);
      return reject(e);
    })

    // for (var i = 0; i < 5; i++) {
    //   console.log('Attempting to connect and play song...', botMember?.voice?.channel?.id, randomSong);

		//   await powertools.wait(3000 * i)

    //   client.distube.play(channel, randomSong, {
    //     member: botMember,
    //     // textChannel: message.channel,
    //     // message: '',
    //   })
    //   .then((r) => {
    //     console.log('Successfully queued song');
    //   })
    //   .catch((e) => {
    //     console.error('Failed to queued song', e);
    //   })
    // }
  });
}

Helpers.prototype.command = function (name) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return process.env.ENVIRONMENT !== 'development'
    ? name
    : `_${name}`
}

Helpers.prototype.format = function (s) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return s.replace(/\n/igm, '').trim().replace(/\$N/igm, '\n').replace(/\$S/igm, '  ')
}

Helpers.prototype.resolveActiveGiveaway = function () {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return new Promise(async function(resolve, reject) {
    // Pull from storage
		const activeGiveaway = _.merge(
      {
        id: '-1',
        prize: '',
        rolesRequired: [],
        sponsor: {
          id: '-1',
          link: '',
        },
        requirement: '',
        reason: '',
        endDate: {
          timestamp: new Date(0).toISOString(),
        },
        winner: {
          id: '-1',
          claimed: false,
          claimUntilDate: {
            timestamp: new Date(0).toISOString(),
          }
        },
      },
      Manager.storage().get('giveaway', {}).value(),
    )

    // Set default resolved portion
    activeGiveaway.message = {
      reference: null,
      exists: false,
    }
    activeGiveaway.exists = false;
    activeGiveaway.daysUntilExpire = 0;

    if (activeGiveaway.id === '-1') {
      return resolve(activeGiveaway);
    }

		const giveaway = await self.getOfficialServerChannel('events.giveaway');

    // Update resolved portion
    activeGiveaway.message.reference = await giveaway.messages.fetch(activeGiveaway.id).catch(e => e);
    activeGiveaway.message.exists = !(activeGiveaway.message.reference instanceof Error) && !(activeGiveaway.message.reference instanceof DiscordAPIError)

    activeGiveaway.exists = activeGiveaway.message.exists;
    activeGiveaway.daysUntilExpire = moment(activeGiveaway.endDate.timestamp).diff(moment(), 'days', true);

    return resolve(activeGiveaway);
  });
}

Helpers.prototype.updateActiveGiveaway = function () {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = self.instance.assistant;

  return new Promise(async function(resolve, reject) {
		const activeGiveaway = await self.resolveActiveGiveaway();

		const sponsor = await self.getOfficialServerMember(activeGiveaway.sponsor.id !== '-1' ? activeGiveaway.sponsor.id : client.user.id).catch(e => null);
    let prizeEmoji;
    const timestampUNIX = moment(activeGiveaway.endDate.timestamp).unix();

    if (activeGiveaway.prize.match(/premium/ig)) {
      prizeEmoji = config.emojis.premium;
    } else if (activeGiveaway.prize.match(/nitro/ig)) {
      prizeEmoji = config.emojis.boost;
    } else if (activeGiveaway.prize.match(/merch/ig)) {
      prizeEmoji = ':shirt:';
    } else {
      prizeEmoji = ':gift_heart:';
    }

    const winnerMember = await self.getOfficialServerMember(activeGiveaway.winner.id).catch(e => null);

    let description = ``
      + `${config.emojis.celebrate} It's **Giveaway** Time! ${config.emojis.celebrate}\n`
      + `\n`
      + `${prizeEmoji} Today we have a very special **${activeGiveaway.prize}** giveaway to celebrate ${
        activeGiveaway.reason
          ? `${activeGiveaway.reason}!`
          : `our amazing community!`
      }\n`
      + `\n`
      + `:heart_decoration: ${
        activeGiveaway.rolesRequired[0]
          ? `This giveaway is **exclusively** for all our ${roleMention(activeGiveaway.rolesRequired[0])} members!`
          : `This giveaway is to show our appreciation for all our ${roleMention(config.roles.member)}s!`
      }\n`
      + `\n`
      + `**Sponsored by ${self.displayMember(sponsor, true)}!**\n`
      + `${
        activeGiveaway.sponsor.link
          ? `Be sure to show them some love: ${activeGiveaway.sponsor.link}`
          : `Be sure to show some love to the team :heart:`
      }\n`
      + `\n`
      + `**How to enter**\n`
      + `${
        activeGiveaway.requirement
          ? `:small_blue_diamond: ${activeGiveaway.requirement}`
          : ``
      }\n`
      + `:small_blue_diamond: Select the green :tada: button on this message\n`
      + `\n`
      + `Winner announced **<t:${timestampUNIX}:f>** (<t:${timestampUNIX}:R>)\n`
      + `:small_blue_diamond:**Active members** have 8 hours to claim\n`
      + `:small_blue_diamond:**Non-active** members have 15 min to claim\n`
      + `\n`
      + `:crown: Good luck @everyone! :crown:\n`
      + `\n`
      + `:star: Winner: ${
        activeGiveaway.winner.claimed && activeGiveaway.winner.id !== '-1'
          ? `**${self.displayMember(winnerMember, true)}**`
          : `**TBA**`
      }\n`
      + `${
        process.env.ENVIRONMENT === 'development'
          ? `\n:warning::warning::warning: This contest was started in DEVELOPMENT! It is not active.`
          : ``
      }\n`
      // `\n`
      // `:star: Winner: **TBA**`
      + ``

    // console.log('----activeGiveaway.winner', activeGiveaway.winner, activeGiveaway.winner.claimed && activeGiveaway.winner.id !== '-1');

    if (!activeGiveaway.message.exists || !activeGiveaway.exists) {
      return resolve();
    }

    // Perform update
    await activeGiveaway.message.reference.edit({
      // embeds: [
      //   new EmbedBuilder()
      //     // .setTitle(`It's Giveaway Time!`)
      //     .setColor(config.colors.blue)
      //     .setDescription(description)
      // ],
      content: description,
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`giveaway|${activeGiveaway.id}`)
              .setEmoji('🎉')
              .setLabel('Enter Giveaway!')
              .setDisabled(activeGiveaway.daysUntilExpire <= 0)
              .setStyle(ButtonStyle.Success),
          )
      ],
    })

    return resolve(description);
  });
}

module.exports = Helpers

