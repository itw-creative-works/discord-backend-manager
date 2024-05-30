module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      // Stats
      stats: {
        members: {
          types: ['string'],
          default: '',
          required: true,
        },
        bots: {
          types: ['string'],
          default: '',
          required: true,
        },
        accounts: {
          types: ['string'],
          default: '',
          required: true,
        },
        online: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Staff
      staff: {
        staff: {
          types: ['string'],
          default: '',
          required: true,
        },
        commands: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Admins
      admins: {
        admin: {
          types: ['string'],
          default: '',
          required: true,
        },
        commands: {
          types: ['string'],
          default: '',
          required: true,
        },
        testLog: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Moderators
      moderators: {
        moderators: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Marketing
      marketing: {

      },

      // Logs
      logs: {
        botMainLogs: {
          types: ['string'],
          default: '',
          required: true,
        },
        botSupportLogs: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Information
      information: {
        guidelines: {
          types: ['string'],
          default: '',
          required: true,
        },
        faqs: {
          types: ['string'],
          default: '',
          required: true,
        },
        welcome: {
          types: ['string'],
          default: '',
          required: true,
        },
        download: {
          types: ['string'],
          default: '',
          required: true,
        },
        announcements: {
          types: ['string'],
          default: '',
          required: true,
        },
        status: {
          types: ['string'],
          default: '',
          required: true,
        },
        resources: {
          types: ['string'],
          default: '',
          required: true,
        },
        roles: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Events
      events: {
        giveaway: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Chat
      chat: {
        support: {
          types: ['string'],
          default: '',
          required: true,
        },
        hangout: {
          types: ['string'],
          default: '',
          required: true,
        },
        commands: {
          types: ['string'],
          default: '',
          required: true,
        },
        suggestions: {
          types: ['string'],
          default: '',
          required: true,
        },
        development: {
          types: ['string'],
          default: '',
          required: true,
        },
        premium: {
          types: ['string'],
          default: '',
          required: true,
        },
        beta: {
          types: ['string'],
          default: '',
          required: true,
        },
        influencer: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Voice
      voice: {
        general: {
          types: ['string'],
          default: '',
          required: true,
        },
        music: {
          types: ['string'],
          default: '',
          required: true,
        },
        streaming: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Fun
      fun: {
        counting: {
          types: ['string'],
          default: '',
          required: true,
        },
        share: {
          types: ['string'],
          default: '',
          required: true,
        },
        art: {
          types: ['string'],
          default: '',
          required: true,
        },
        memes: {
          types: ['string'],
          default: '',
          required: true,
        },
        food: {
          types: ['string'],
          default: '',
          required: true,
        },
        gaming: {
          types: ['string'],
          default: '',
          required: true,
        },
        nsfw: {
          types: ['string'],
          default: '',
          required: true,
        },
        music: {
          types: ['string'],
          default: '',
          required: true,
        },
      },

      // Defaults
      // TODO: MOVE TO MAIN CONFIG
      defaults: {
        music: {
          types: ['string'],
          default: 'voice.music',
          required: false,
        },
        support: {
          types: ['string'],
          // default: process.env.ENVIRONMENT === 'production' ? 'chat.support' : 'staff.commands',
          default: 'chat.support',
          required: false,
        },
      },
    },
  };
}
