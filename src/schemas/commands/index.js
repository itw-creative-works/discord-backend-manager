module.exports = function (assistant) {
  return {
    // DEFAULTS
    ['defaults']: {
      // Common
      app: {
        types: ['string'],
        default: '',
        value: undefined,
        required: true,
      },
      status: {
        types: ['string'],
        default: 'enabled',
        value: undefined,
        required: false,
      },
      duration: {
        types: ['number'],
        default: 30000,
        value: undefined,
        required: false,
      },
    },
  };
}
