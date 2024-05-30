module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      blue: {
        types: ['string'],
        default: '#1fb7f3',
        required: false,
      },
      green: {
        types: ['string'],
        default: '#00b894',
        required: false,
      },
      purple: {
        types: ['string'],
        default: '#6b5ee8',
        required: false,
      },
      orange: {
        types: ['string'],
        default: '#fdcb6e',
        required: false,
      },
      red: {
        types: ['string'],
        default: '#d33131',
        required: false,
      },
      pink: {
        types: ['string'],
        default: '#e07ef5',
        required: false,
      },
    },
  };
}
