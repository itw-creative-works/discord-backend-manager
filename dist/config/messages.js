function fix(s) {
  // return s.replace(/\n/igm, '').replace(/\$N/igm, '\n')
  return s;
}

module.exports = function (instance) {
  return {
    schemafy: false,

    // DEFAULTS
    ['defaults']: {
      welcome: {
        public: {
          types: ['function'],
          default: async (member) => {
            const Manager = instance.Manager;
            const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;

            const guidelines = await helpers.getOfficialServerChannel('information.guidelines')
            const mascot = await helpers.getOfficialServerEmoji('mascot')

            return fix(``
              + `Hey, **${helpers.displayMember(member, true)}**, we're so happy that you could join us!\n`
              + `\n`
              + `Please familiarize yourself with our ${guidelines} so you understand our rules and learn what this server is about.\n`
              + `\n`
              + `Thank you and enjoy your stay! ${mascot}\n`
            )
          }
        },
        private: {
          types: ['function'],
          default: async (member) => {
            const Manager = instance.Manager;
            const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;

            const guidelines = await helpers.getOfficialServerChannel('information.guidelines');
            const hangout = await helpers.getOfficialServerChannel('chat.hangout');
            const mascot = await helpers.getOfficialServerEmoji('mascot')

            return fix(``
              + `Hi, **${member}**, welcome to the official ${mascot} **${Manager.config.brand.name} Discord server**! ${mascot}\n`
              + `\n`
              + `**${Manager.config.brand.name}** is not just *another* Discord server. We have:\n`
              + `  :chart_with_upwards_trend: **Free app** that [grows your social media](${instance.app.url}/download?aff=discord-dm) on auto-pilot \n`
              + `  :money_with_wings: **Free tools** to help you start an online business \n`
              + `  :heart_eyes: **Friendly** community\n`
              + `\n`
              + `**Get started**\n`
              + `  **1.** Download our app: [${Manager.config.brand.name}](${instance.app.url}/download?aff=discord-dm)\n`
              + `  **2.** Read our Server rules: ${guidelines} \n`
              + `  **3.** Introduce yourself in our hangout channel: ${hangout}.\n`
              + `\n`
              + `We sincerely hope you enjoy your stay and get some kick-ass social media growth!\n`
              + `\n`
              // + `**:partying_face: Special Offer :partying_face:**\n`
              // + `Stay in the **${Manager.config.brand.name} Discord server** for **7 days** and you'll automatically get free **${Manager.config.brand.name} Premium** (1 week)!\n`
            )
          }
        },
      },
      general: {
        comeToServer: {
          types: ['function'],
          default: async (member) => {
            const Manager = instance.Manager;
            const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;

            const hangout = await helpers.getOfficialServerChannel('chat.hangout');
            const support = await helpers.getOfficialServerChannel('chat.support');
            const mascot = await helpers.getOfficialServerEmoji('mascot')

            return fix(``
              + `Hi, **${member}**. I am unable to assist you over DM—please join our ${mascot} **${Manager.config.brand.name} Discord Server**! ${mascot} \n`
              + `\n`
              + `**Do you need help?**\n`
              + `Post your question in our support channel: ${support} \n`
              + `\n`
              + `**Do you want to chat with our community?**\n`
              + `Come hang out in our public discussion channel: ${hangout} \n`
              + `\n`
              + `We sincerely hope you enjoy your stay and get some kick-ass social media growth!\n`
              + `\n`
            )
          }
        },
      },
      // support: [
      //   {
      //     regex: /(beta)/ig,
      //     title: 'Apply to be a Somiibo Beta Tester',
      //     blacklistedChannels: function () {
      //       const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

      //       return []
      //     },
      //     reply: async function () {
      //       const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

      //       const channel = await helpers.getOfficialServerChannel('chat.commands');

      //       return `Are you interested in applying for beta? Type ${helpers.displayCommand('beta')} in the ${channel} channel.`
      //     },
      //   },
      //   {
      //     regex: /(refund|money back)/ig,
      //     title: 'Refund request',
      //     blacklistedChannels: function () {
      //       const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

      //       return []
      //     },
      //     reply: async function () {
      //       const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

      //       const channel = await helpers.getOfficialServerChannel('chat.commands');

      //       return `It seems you need to speak to a billing specialist. Please [submit a billing support ticket](https://somiibo.com/contact).`
      //     },
      //   },
      //   {
      //     regex: /(help|error|not working|support)/ig,
      //     title: 'Get Somiibo Support',
      //     blacklistedChannels: function () {
      //       const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

      //       return [config.channels.chat.support]
      //     },
      //     reply: async function () {
      //       const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = global.Manager.discord;

      //       const channel = await helpers.getOfficialServerChannel('chat.support');

      //       return `Do you need help? Please ask in the ${channel} channel.`
      //     },
      //   },
      // ],
    },
  }
}
