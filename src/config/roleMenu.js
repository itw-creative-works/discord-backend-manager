module.exports = function (instance) {
  return {
    // DEFAULTS
    ['defaults']: {
      channel: {
        types: ['string'],
        value: 'information.roles',
        required: false,
      },
      menus: {
        types: ['array'],
        default: [],
        required: false,
      },
    },
  };
}
