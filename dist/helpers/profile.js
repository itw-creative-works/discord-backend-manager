const { EmbedBuilder, BaseChannel, SnowflakeUtil, Role } = require('discord.js');

let _;
let powertools;
let moment;

const cooldowns = {};

function Profile(instance) {
  const self = this;

  // Set instance
  self.instance = instance;
  self.Manager = instance.Manager;

  // Load libraries
  _ = self.Manager.require('lodash');
  powertools = self.Manager.require('node-powertools');
  moment = self.Manager.require('moment');

  // Return
  return self;
}

Profile.prototype.get = function (id) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  return new Promise(function(resolve, reject) {
    Manager.libraries.initializedAdmin.firestore().doc(`discord/${id}`)
    .get()
    .then(doc => {
      const now = moment();
      return resolve(_.merge(
        {
          profile: {
            level: 1,
            currency: 0,
            xp: 0,
          },
          stats: {
            message: { total: 0, week: 0, month: 0 },
            vote: { total: 0, week: 0, month: 0 },
            bump: { total: 0, week: 0, month: 0 },
            dj: { total: 0, week: 0, month: 0 },
            counting: { total: 0, week: 0, month: 0 },
          },
          activity: {
            lastActivity: {
              timestamp: now.toISOString(),
              timestampUNIX: now.unix(),
            }
          },
          contest: {
            giveaway: {
              id: '-1',
            }
          }
        },
        doc.data(),
      ))
    })
    .catch(e => reject(e))
  });
};

Profile.prototype.set = function (id, data) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;

  const now = new Date();
  const newData = _.merge({}, data, {
    activity: {
      lastActivity: {
        timestamp: now.toISOString(),
        timestampUNIX: Math.floor(now.getTime() / 1000),
      }
    }
  })

  return new Promise(function(resolve, reject) {
    Manager.libraries.initializedAdmin.firestore().doc(`discord/${id}`)
    .set(newData, {merge: true})
    .then((doc) => {
      return resolve()
    })
    .catch(e => reject(e))
  });
};

Profile.prototype.reward = async function (member, type, channel) {
  const self = this;
  const Manager = self.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;

  const reward = config.rewards[type];
  if (reward.enabled === false) {
    return
  }
  const result = {
    profile: {
      currency: powertools.random(0, 100) > (100 - reward.currency.chance)
        ? powertools.random(reward.currency.min, reward.currency.max)
        : 0,
      xp: powertools.random(0, 100) > (100 - reward.xp.chance)
        ? powertools.random(reward.xp.min, reward.xp.max)
        : 0,
    },
    [type]: {
      count: 1,
    }
  }

  cooldowns[member.id] = cooldowns[member.id] || {};
  cooldowns[member.id][type] = cooldowns[member.id][type] || moment(0);
  const diff = moment().diff(cooldowns[member.id][type]);

  // If cooling down, back out
  if (diff < reward.cooldown) {
    return;
  }

  // If they gained a reward, activate cooldown
  if (result. profile.xp + result.profile.currency > 0) {
    cooldowns[member.id][type] = moment()
  }

  assistant.log('result', diff, result);

  channel = channel || await helpers.getOfficialServerChannel('chat.hangout');

  // assistant.log(`reward:`, result);

  profile.get(member.id)
  .then(account => {
    const requiredXP = profile.getRequiredXP(account.profile.level);

    account.profile.xp += result.profile.xp;

    if (account.profile.xp >= requiredXP) {
      const currencyReward = (1000 * Math.min(10, account.profile.level));
      account.profile.currency += currencyReward;
      account.profile.level++;
      account.profile.xp = 0;

      channel.send({embeds: [
        new EmbedBuilder()
          .setColor(config.colors.blue)
          .setTitle(`:tada: You are now level ${account.profile.level} :tada:`)
          .setDescription(``
            + `${member} just leveled up!\n`
            + `\n`
            + `**${config.emojis.currency} ${helpers.formatNumber(currencyReward)} ${config.main.currency}** earned from this level up.\n`
            // + `\n`
            + `**${config.emojis.xp} ${profile.getRequiredXP(account.profile.level)} XP** until the next level.\n`
            + `\n`
            + `Use ${helpers.displayCommand('account')} to see more progress.\n`
          )
          .setThumbnail(member.user.displayAvatarURL())
      ]})
    }

    account.stats[type].total = (account.stats[type].total || 0) + 1;
    account.stats[type].month = (account.stats[type].month || 0) + 1;
    account.stats[type].week = (account.stats[type].week || 0) + 1;

    profile.set(member.id, account)
  })
}

Profile.prototype.getRequiredXP = function (level) {
 return Math.ceil(5 * Math.pow(level, 2.5) + 50 * level + 100)
}

module.exports = Profile;
