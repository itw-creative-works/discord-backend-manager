module.exports = function (instance) {
  return {
    // DEFAULTS
    ['defaults']: {
      // Server-specific
      mascot: {
        types: ['string'],
        default: '<:somiibo:748065274799980684>',
        required: true,
      },

      // Economy
      currency: {
        types: ['string'],
        // default: '<:somiibucks:789981968732389416>',
        default: '<:currency:1245646241073860678>',
        required: false,
      },
      xp: {
        types: ['string'],
        // default: '<:xp:789981968342974475>',
        default: '<a:xp:1245646239698128939>',
        required: false,
      },

      // General
      cheers: {
        types: ['string'],
        default: '<a:cheers:754883495519584277>',
        required: false,
      },
      boost: {
        types: ['string'],
        default: '<a:boost:669323650293563426>',
        required: false,
      },
      yeet: {
        types: ['string'],
        default: '<:yeet:697270416317874206>',
        required: false,
      },
      celebrate: {
        types: ['string'],
        default: '<a:celebrate:1060358803545129143>',
        required: false,
      },

      // Global (ITW Creative Works)
      betaTester: {
        types: ['string'],
        default: '<:beta:1020012156739137536>',
        required: false,
      },
      premium: {
        types: ['string'],
        default: '<:premium:1020012169993146399>',
        required: false,
      },
      active: {
        types: ['string'],
        default: '<:active:1063569222116069456>',
        required: false,
      },
    },
  };
}
