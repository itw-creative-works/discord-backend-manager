module.exports = {
  data: {
    interval: 3.6e+6 * 1, // 1 hour
    runInitially: true,
    initialDelay: 0, // 1 hour
    // enabled: process.env.ENVIRONMENT === 'development',
    enabled: false,
  },
  execute: async function (instance, options) {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;

    const { get, set, merge } = Manager.require('lodash')

    // GLOBAL PROCESS VARIABLES FOR ALL WORK THINGS
    let errors;
    let thingsToProcess1;
    let thingsToProcess2;

    // helpers.getOfficialServerMember()
    // .then(members => {
    //   // members = Array.isArray(members) ? members : [members];

    //   members.forEach(async member => {
    //     const roles = {
    //       og: !!member.roles.cache.find(r => r.name.match(/og/ig)),
    //       vip: !!member.roles.cache.find(r => r.name.match(/vip/ig)),
    //       staff: !!member.roles.cache.find(r => r.name.match(/staff/ig)),
    //       moderator: !!member.roles.cache.find(r => r.name.match(/moderator/ig)),
    //     }
    //     if (roles.og || roles.vip || roles.staff || roles.moderator) {
    //       assistant.log(`Member`, member.id, member.user.username, (await helpers.getFirebaseAccount(member.id)).auth.uid, JSON.stringify(roles));

    //     }
    //   });
    // })

    // List all users connected to discord
    // Manager.libraries.initializedAdmin.firestore().collection('users')
    // // .where('oauth2.discord.token.refresh_token', '<=', 1546300800)
    // .where('oauth2.discord.updated.timestampUNIX', '<=', 1666822279)
    // .get()
    // .then(snap => {

    //   snap
    //   .forEach(doc => {
    //     const data = doc.data();
    //     const discord = data.oauth2.discord;

    //     assistant.log('----USER', data.auth.uid, discord.identity.username, discord.updated.timestamp, discord.token.access_token, discord.token.refresh_token);
    //   })
    // })

    // Manager.libraries.initializedAdmin.firestore().collection('users')
    // // .where('oauth2.discord.token.token_type', '==', 'Bearer')
    // .where('activity.created.timestampUNIX', '<=', 1546300800)
    // .get()
    // .then(snap => {
    //   const {get} = Manager.require('lodash')
    //   const linkedAccounts = snap.docs.map(doc => Manager.assistant.resolveAccount(doc.data()));

    //   linkedAccounts
    //   .forEach(linkedAccount => {
    //     if (get(linkedAccount, 'oauth2.discord.token.token_type') === 'Bearer') {
    //       assistant.log('---ACC', linkedAccount.auth.uid, linkedAccount.activity.created.timestamp, linkedAccount.oauth2.discord.identity.id, linkedAccount.oauth2.discord.identity.username);

    //       Manager.libraries.initializedAdmin.firestore().doc(`users/${linkedAccount.auth.uid}`)
    //       .set({roles: {og: true}}, {merge: true})

    //       helpers.getOfficialServerMember(linkedAccount.oauth2.discord.identity.id)
    //       .then(member => {
    //         member.roles.add('757069544056684626')
    //       })
    //       .catch(e => assistant.error())

    //     }
    //   })

    // RESET ALL DISCORD STATS
    // assistant.log('---START');
    // await Manager.libraries.initializedAdmin.firestore().collection('users')
    // .where('discord.stats.vote.total', '>=', 0)
    // .get()
    // .then(snap => {
    //   const linkedAccounts = snap.docs.map(doc => Manager.assistant.resolveAccount(doc.data()));

    //   // assistant.log('---snap.zie', snap.size, linkedAccounts);

    //   linkedAccounts
    //   .forEach(linkedAccount => {
    //     assistant.log('--FIXING', linkedAccount);
    //     Manager.libraries.initializedAdmin.firestore().doc(`users/${linkedAccount.auth.uid}`)
    //       .update({
    //           ['discord.profile']: Manager.libraries.initializedAdmin.firestore.FieldValue.delete(),
    //           ['discord.stats']: Manager.libraries.initializedAdmin.firestore.FieldValue.delete(),
    //       })
    //       .then(r => {
    //         assistant.log('---FIXED', linkedAccount.auth.uid);
    //       })
    //   })
    // })
    // assistant.log('---COMPLETE');

    // MOVE TO NEW SYSTEM
    // await Manager.libraries.initializedAdmin.firestore().collection('users')
    // .where('discord.betaTester.applicationDate.timestampUNIX', '>=', 0)
    // .get()
    // .then(snap => {
    //   const linkedAccounts = snap.docs.map(doc => Manager.assistant.resolveAccount(doc.data()));

    //   assistant.log('---snap.zie', snap.size);

    //   linkedAccounts
    //   .forEach((linkedAccount, i) => {
    //     const discordId = get(linkedAccount, 'oauth2.discord.identity.id')
    //     const betaApplication = get(linkedAccount, 'discord.betaTester.applicationDate')


    //     assistant.log('--FIXING', i, linkedAccount.auth.uid, discordId, );
    //     if (linkedAccount.auth.uid && discordId) {
    //       Manager.libraries.initializedAdmin.firestore().doc(`discord/${discordId}`)
    //         .set({
    //           betaTesterApplication: betaApplication,
    //         })
    //         .then(r => {
    //           assistant.log('---FIXED', linkedAccount.auth.uid);
    //         })

    //         Manager.libraries.initializedAdmin.firestore().doc(`users/${linkedAccount.auth.uid}`)
    //           .update({
    //               ['discord.betaTester.applicationDate.timestampUNIX']: Manager.libraries.initializedAdmin.firestore.FieldValue.delete(),
    //               ['discord.stats']: Manager.libraries.initializedAdmin.firestore.FieldValue.delete(),
    //           })
    //           .then(r => {
    //             assistant.log('---FIXED', linkedAccount.auth.uid);
    //           })
    //     }


    //   })
    // })

    // await Manager.libraries.initializedAdmin.firestore().collection('users')
    // .where('oauth2.discord.token.token_type', '==', 'Bearer')
    // .get()
    // .then(snap => {
    //   snap
    //   .forEach(async (doc, i) => {
    //     const data = doc.data();

    //     assistant.log('--FIXING', i, data.auth.uid, data.discord);

    //     // await Manager.libraries.initializedAdmin.firestore().doc(`users/${data.auth.uid}`)
    //     //   .update({
    //     //     ['discord']: Manager.libraries.initializedAdmin.firestore.FieldValue.delete(),
    //     //   })
    //     //   .then(r => {
    //     //     assistant.log('---FIXED', data.auth.uid);
    //     //   })

    //   })
    // })

    // BLANK DISCORD ***
    // Manager.libraries.initializedAdmin.firestore().collection('discord')
    //   .get()
    //   .then(snap => {
    //     snap
    //     .forEach((doc, i) => {
    //       const data = doc.data()
    //       const now = new Date();
    //         Manager.libraries.initializedAdmin.firestore().doc(`${doc.ref.path}`)
    //           .set({
    //             betaTesterApplication: {
    //               applicationDate: {
    //                 timestamp: now.toISOString(),
    //                 timestampUNIX: Math.round(now.getTime() / 1000),
    //               }
    //             },
    //           })
    //           .then(r => {
    //             assistant.log('---FIXED', doc.ref.path);
    //           })

    //     })
    //   })


    // // REMOVE ALL USERS WHO LEFT THE DISCORD
    // thingsToProcess1 = 0;
    // thingsToProcess2 = 0;
    // errors = [];
    // await Manager.libraries.initializedAdmin.firestore().collection('users')
    // .where('oauth2.discord.token.token_type', '==', 'Bearer')
    // .get()
    // .then(async(snap) => {
    //   const linkedAccounts = snap.docs.map(doc => Manager.assistant.resolveAccount(doc.data()));

    //    assistant.log('READY', {total: linkedAccounts.length});

    //   for (var i = 0; i < linkedAccounts.length; i++) {
    //     const linkedAccount = linkedAccounts[i]
    //     const memberId = linkedAccount.oauth2.discord.identity.id;
    //     const memberUsername = linkedAccount.oauth2.discord.identity.username;

    //     assistant.log('Fixing', i, linkedAccount.auth.uid, linkedAccount.auth.email, memberId, memberUsername);
    //     thingsToProcess1++;

    //     await helpers.getOfficialServerMember(memberId)
    //     .then(member => {
    //       assistant.log('Found member', i, linkedAccount.auth.uid, linkedAccount.auth.email, member.id, member.user.username);
    //     })
    //     .catch(async (e) => {
    //       if (e.message.match(/Unknown Member/)) {
    //         thingsToProcess2++;
    //         assistant.log('Unknown member!', i, linkedAccount.auth.uid, linkedAccount.auth.email, memberId, memberUsername);
    //         await Manager.libraries.initializedAdmin.firestore().doc(`users/${linkedAccount.auth.uid}`)
    //           .set({oauth2: {discord: {}}}, {merge: true})
    //           .then(r => {
    //             assistant.log('Deleted member', i, linkedAccount.auth.uid, linkedAccount.auth.email, memberId, memberUsername);
    //           })
    //           .catch(e => {
    //             errors.push([['Failed to delete member', i, linkedAccount.auth.uid, linkedAccount.auth.email, memberId, memberUsername, e]])
    //           })
    //       } else {
    //         assistant.log('---Error fetching memebr', i, linkedAccount.auth.uid, linkedAccount.auth.email, memberId, memberUsername);
    //       }
    //     })
    //   }

    // })
    // assistant.log('COMPLETE', {thingsToProcess1: thingsToProcess1, thingsToProcess2: thingsToProcess2, errors: errors});


    // REMOVE ALL OG ROLES
    // thingsToProcess1 = 0;
    // thingsToProcess2 = 0;
    // errors = [];
    // await Manager.libraries.initializedAdmin.firestore().collection('users')
    // .where('roles.og', '==', true)
    // .get()
    // .then(async(snap) => {
    //   const linkedAccounts = snap.docs.map(doc => Manager.assistant.resolveAccount(doc.data()));

    //    assistant.log('READY', {total: linkedAccounts.length});

    //   for (var i = 0; i < linkedAccounts.length; i++) {
    //     const linkedAccount = linkedAccounts[i]

    //     assistant.log('Fixing', i, linkedAccount.auth.uid, linkedAccount.auth.email, linkedAccount.activity.created.timestamp);
    //     thingsToProcess1++;

    //     // await Manager.libraries.initializedAdmin.firestore().doc(`users/${linkedAccount.auth.uid}`)
    //     //   .set({roles: {og: false}}, {merge: true})
    //     //   .then(r => {
    //     //     assistant.log('Deleted member', i, linkedAccount.auth.uid, linkedAccount.auth.email);
    //     //   })
    //     //   .catch(e => {
    //     //     errors.push([['Failed to delete member', i, linkedAccount.auth.uid, linkedAccount.auth.email, e]])
    //     //   })
    //   }

    // })
    // assistant.log('COMPLETE', {thingsToProcess1: thingsToProcess1, thingsToProcess2: thingsToProcess2, errors: errors});



    //   // members
    //   // .forEach(member => {
    // })

    // await Manager.libraries.initializedAdmin.firestore().collection('users')
    // .where('oauth2.discord.updated.timestampUNIX', '>=', 0)
    // .get()
    // .then(snap => {
  }
}
