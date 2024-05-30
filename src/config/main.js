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
    },
  };
}
