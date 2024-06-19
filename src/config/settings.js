module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      glitchURL: {
        types: ['string'],
        default: '',
        value: 'https://universal-discord-bot-2024-05.glitch.me',
        required: false,
      },
      commandDisable: {
        types: ['boolean'],
        default: '',
        value: true,
        required: false,
      },
      commandDisableTime: {
        types: ['number'],
        default: '',
        value: 1000 * 60 * 1,
        required: false,
      },
      ogCutoffDate: {
        types: ['string'],
        default: '2019-01-01T00:00:00.000Z',
        required: false,
      },

      // // Promotion
      promotion: {
        enabled: {
          types: ['boolean'],
          default: true,
          required: false,
        },
      },

      // Chatsy
      chatsy: {
        accountId: {
          types: ['string'],
          default: '',
          required: true,
        },
        chatId: {
          types: ['string'],
          default: '',
          required: true,
        },
        includeSupportInstructions: {
          types: ['boolean'],
          default: true,
          required: false,
        },
      },

      // Stats
      stats: {
        members: {
          types: ['boolean'],
          default: true,
          required: false,
        },
        bots: {
          types: ['boolean'],
          default: false,
          required: false,
        },
        accounts: {
          types: ['boolean'],
          default: true,
          required: false,
        },
        online: {
          types: ['boolean'],
          default: true,
          required: false,
        },
      },

      // Beta
      betaApplicationAcceptanceDays: {
        premium: {
          types: ['number'],
          default: 0.3,
          required: false,
        },
        active: {
          types: ['number'],
          default: 6,
          required: false,
        },
      },

      // Role sync
      intermissionDelay: {
        types: ['number'],
        default: 100,
        required: false,
      },
    },
  };
}
