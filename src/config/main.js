module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      // Server-wide settings
      server: {
        types: ['string'],
        default: '',
        required: true,
      },
      owner: {
        types: ['string'],
        default: '',
        required: true,
      },

      // Economy
      currency: {
        types: ['string'],
        default: 'Currency',
        required: false,
      },

      // Support
      support: {
        // Maximum daily messages for users who are not an "exempt" role
        maxDailyMessages: {
          types: ['number'],
          default: 2,
          required: false,
        },
        // Roles that are exempt from the daily message limit
        exemptRoles: {
          types: ['array'],
          default: ['serverBooster', 'premium'],
          required: false,
        },
      },
    },
  };
}
