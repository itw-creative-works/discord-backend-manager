module.exports = {
  data: {
    interval: false,
    runInitially: true,
    initialDelay: false,
    enabled: true,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Load libraries
    const schedule = require('node-schedule');
    const moment = Manager.require('moment');

    // Reset
    function reset(period, fireDate) {
      let threshold;
      if (period === 'week') {
        threshold = moment().subtract(7, 'days')
      } else if (period === 'month') {
        threshold = moment().subtract(30, 'days')
      } else {
        return;
      }

      assistant.log(`[stat-reset] fireDate=${fireDate}, threshold=${threshold.toISOString()}`);

      // Query the db for all records that match
      Manager.libraries.initializedAdmin.firestore().collection('discord')
        .where('activity.lastActivity.timestampUNIX', '>', threshold.unix())
        .get()
        .then(snap => {

          assistant.log(`[stat-reset] size=${snap.size}`);
          helpers.sendToLogChannel(`Resetting ${period}ly member stats for **${snap.size}** members (${fireDate})`)

          snap.forEach(doc => {
            const data = doc.data();

            if (!data || !data.stats) {
              return
            }

            // Iterate and reset the current period (week or month)
            Object.keys(data.stats)
            .forEach((key) => {
              data.stats[key][period] = 0;
            })

            // Save the data
            Manager.libraries.initializedAdmin.firestore().doc(`discord/${doc.ref.id}`)
              .set(data)
              .then()
              .catch(e => e)
          });
        })
    }

    // At 00:00 on Monday
    schedule.scheduleJob('0 0 * * 1', (fireDate) => {
      reset('week', fireDate);
    });

    // At 00:00 on day-of-month 1
    schedule.scheduleJob('0 0 1 * *', (fireDate) => {
      reset('month', fireDate);
    });

    if (assistant.isDevelopment()) {
      // reset('week')
      // reset('month')
    }
  }
}
