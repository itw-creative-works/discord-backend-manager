module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      list: {
        types: ['array'],
        default: [
          // 'lofi girl livestream',
          'Spinnin records livestream',
          // 'shortest song in the world kenny prices',
        ],
        required: false,
      },
    },
  }
}
