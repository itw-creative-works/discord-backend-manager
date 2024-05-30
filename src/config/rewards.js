module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      // Messaging rewards
      message: {
        currency: {
          chance: {
            types: ['number'],
            default: 0,
            required: false,
          },
          min: {
            types: ['number'],
            default: 0,
            required: false,
          },
          max: {
            types: ['number'],
            default: 0,
            required: false,
          },
        },
        xp: {
          chance: {
            types: ['number'],
            default: 33,
            required: false,
          },
          min: {
            types: ['number'],
            default: 0,
            required: false,
          },
          max: {
            types: ['number'],
            default: 100,
            required: false,
          },
        },
        cooldown: {
          types: ['number'],
          default: 1000 * 60,
          required: false,
        },
      },
    },
  };
}
