const { EmbedBuilder, roleMention } = require('discord.js');

module.exports = {
  data: {
    interval: 60000,
    initialDelay: false,
    runInitially: true,
    enabled: true,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Load libraries
    const _ = Manager.require('lodash');
    const powertools = Manager.require('node-powertools');
    const moment = Manager.require('moment');

    // Get active giveaway
    const activeGiveaway = await helpers.resolveActiveGiveaway();
		const giveaway = await helpers.getOfficialServerChannel('events.giveaway');
    const active = activeGiveaway.daysUntilExpire > 0;

    // Log
    assistant.log(`[giveaway-check] ${activeGiveaway.id} - ${active ? 'active' : 'inactive'}: days=${activeGiveaway.daysUntilExpire}, claimed=${activeGiveaway.winner.claimed}`);

    // Manager.libraries.initializedAdmin.firestore().collection('discord')
    //   .where('contest.giveaway.id', '==', '-1')
    //   .get()
    //   .then(snap => {
    //     assistant.log('CHECK', snap.docs.map(x => x.ref.id))
    //   })

    function _finish() {
      return helpers.updateActiveGiveaway();
    }

    function _end() {
			Manager.storage().set('giveaway.id', '-1').write();

      _finish()
    }

    // Pick winner
    const testedWinners = [];
    let ineligibleAnnouncements = 0;
    const MAX_INELIGIBILE_ANNOUNCEMENTS = 3;

    function _chooseWinner(potentialWinners) {
      return new Promise(async function(resolve, reject) {
        const filteredWinners = shuffle(potentialWinners.filter(u => !testedWinners.includes(u.ref.id)) || []);

        // assistant.log('---filteredWinners', filteredWinners);
        // assistant.log('---testedWinners', testedWinners);
        // assistant.log('---potentialWinners', potentialWinners);

        if (testedWinners.length === potentialWinners.length) {
          return resolve();
        } else if (filteredWinners.length === 0) {
          return resolve();
        }

        for (var i = 0; i < filteredWinners.length; i++) {
          const filteredWinner = filteredWinners[i];
          const member = await helpers.getOfficialServerMember(filteredWinner.ref.id).catch(e => null);
          const roleRequired = activeGiveaway.rolesRequired[0];
          const hasRole = !roleRequired || member.roles.cache.has(roleRequired);
          const result = {member: member, record: filteredWinner.data()}

          assistant.log(`[giveaway-check]: ${member.id} has been chosen. roleRequired=${roleRequired}, hasRole=${hasRole}`);

          if (activeGiveaway.rolesRequired.length === 0) {
            testedWinners.push(member.id)
            return resolve(result);
          }

          if (hasRole) {
            testedWinners.push(member.id)
            return resolve(result);
          } else {
            testedWinners.push(member.id)
            ineligibleAnnouncements++;
            if (ineligibleAnnouncements >= MAX_INELIGIBILE_ANNOUNCEMENTS) {
              continue
            }
            await helpers.sendNormal(giveaway, `:x: **${helpers.displayMember(member)}** was chosen as the winner but is ineligible because they do not have the ${roleMention(roleRequired)} role. Let's pick a new winner...`, {embed: true})
            // await giveaway.send({
            //   embeds: [
            //     new EmbedBuilder()
            //       // .setTitle(`Ineligible winner`)
            //       .setColor(config.colors.red)
            //       .setDescription(`:x: **${helpers.displayMember(member)}** was chosen as the winner but is ineligible because they do not have the ${roleMention(roleRequired)} role. Let's pick a new winner...`)
            //   ]
            // })
            // .catch(e => assistant.error)
          }
        }

        return resolve();
      });
    }

    // Giveaway is still going, we don't need to do anything
    if (active || activeGiveaway.id === '-1') {
      return _finish();
    }

    // Giveaway is done, pick a winner
    if (false
      // There is no winner yet
      || (
        activeGiveaway.winner.id === '-1'
      )
      // It's unclaimed and the time has passed
      || (
        !activeGiveaway.winner.claimed
        && new Date() > new Date(activeGiveaway.winner.claimUntilDate.timestamp)
      )
    ) {
      // Query all users from Firestore who entered this giveaway
      const potentialWinners = await Manager.libraries.initializedAdmin.firestore().collection('discord')
        .where('contest.giveaway.id', '==', activeGiveaway.id)
        .get()
        .then(snap => {
          return snap.docs.map(x => x);
        })
      assistant.log(`[giveaway-check]: There are ${potentialWinners.length} entries in this giveaway`);
      const chosenWinner = await _chooseWinner(potentialWinners);
      // assistant.log('---chosenWinner', chosenWinner);

      if (!chosenWinner) {
        await helpers.sendError(giveaway, `Unfortunately, there were **not enough entries** to this giveaway to reasonably determine a winner. \n\nAnother giveaway will begin soon...`, {embed: true})
        // await giveaway.send({
        //   embeds: [
        //     new EmbedBuilder()
        //       // .setTitle(`No winner`)
        //       .setColor(config.colors.red)
        //       .setDescription(`:x: Unfortunately, there were **not enough entries** to this giveaway to reasonably determine a winner. \n\nAnother giveaway will begin soon...`)
        //   ]
        // })
        // .catch(e => assistant.error)
        return _end();
      }

      // Check their activity and determine how long they have to check and set that as the claimUntilDate
      const hasActiveRole = chosenWinner.member.roles.cache.has(config.roles.active);
      const lastActivity = chosenWinner.record.activity.lastActivity.timestamp;
      const lastActivityHoursAgo = moment().diff(lastActivity, 'hours', true);
      const isActive = lastActivityHoursAgo < 24 || hasActiveRole;
      const hoursToClaim = isActive ? 8 : 0.25;
      const claimUntilDate = moment().add(process.env.ENVIRONMENT === 'development' ? 1 : hoursToClaim * 60, 'minutes')

      // Set the claimUntilDate
      Manager.storage().set('giveaway.winner', {
        id: chosenWinner.member.id,
        claimed: false,
        claimUntilDate: {
          timestamp: claimUntilDate.toISOString(),
        }
      }).write();

      // Anounce it in the server in the giveaways channel and tag them
		  const botMember = await helpers.getOfficialServerMember(client.user.id).catch(e => null);
      await helpers.sendNormal(giveaway, `${config.emojis.celebrate} Congratulations, **${helpers.displayMember(chosenWinner.member, true)}** you have been chosen as a winner! \n\nYou have **${isActive ? hoursToClaim + ' hours' : (hoursToClaim * 60) + ' minutes'}** to send the word "\`claim\`" to **${helpers.displayMember(botMember, true)}** to secure your prize! \n\nA new winner will be automatically rolled if the prize is not claimed by **<t:${claimUntilDate.unix()}:f>** (<t:${claimUntilDate.unix()}:R>)`, {embed: false})
      // await giveaway.send({
      //   embeds: [
      //   new EmbedBuilder()
      //     // .setTitle(`No winner`)
      //     .setColor(config.colors.green)
      //     .setDescription(`${config.emojis.celebrate} Congratulations, **${helpers.displayMember(chosenWinner.member, true)}** you have been chosen as a winner! \n\nYou have **${isActive ? hoursToClaim + ' hours' : (hoursToClaim * 60) + ' minutes'}** to send the word "\`claim\`" to **${helpers.displayMember(botMember, true)}** to secure your prize! \n\nA new winner will be automatically rolled if the prize is not claimed by **<t:${claimUntilDate.unix()}:f>** (<t:${claimUntilDate.unix()}:R>)`)
      //   ]
      // })
      // .catch(e => assistant.error)

      // Finish
      return _finish();
    }

    // Update giveaway
    // return _finish();
  }
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
