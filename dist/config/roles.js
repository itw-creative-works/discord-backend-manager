module.exports = function (instance) {
  return {
    // DEFAULTS
    ['defaults']: {
      // Staff
      staff: {
        types: ['string'],
        default: '',
        required: true,
      },
      admin: {
        types: ['string'],
        default: '',
        required: true,
      },
      moderator: {
        types: ['string'],
        default: '',
        required: true,
      },
      moderatorJr: {
        types: ['string'],
        default: '',
        required: true,
      },
      blogger: {
        types: ['string'],
        default: '',
        required: true,
      },
      developer: {
        types: ['string'],
        default: '',
        required: true,
      },

      // Features
      serverBooster: {
        types: ['string'],
        default: '',
        required: true,
      },
      betaTester: {
        types: ['string'],
        default: '',
        required: true,
      },
      premium: {
        types: ['string'],
        default: '',
        required: true,
      },
      active: {
        types: ['string'],
        default: '',
        required: true,
      },
      vip: {
        types: ['string'],
        default: '',
        required: true,
      },
      og: {
        types: ['string'],
        default: '',
        required: true,
      },
      linked: {
        types: ['string'],
        default: '',
        required: true,
      },

      // General
      member: {
        types: ['string'],
        default: '',
        required: true,
      },
      bot: {
        types: ['string'],
        default: '',
        required: true,
      },

      // Test
      serverBoosterTest: {
        types: ['string'],
        default: '',
        required: true,
      },
    },
  };
}
