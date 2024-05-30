module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      /*
        Server-specific
      */
      // General
      mascot: {
        types: ['string'],
        default: '<:somiibo:748065274799980684>',
        required: true,
      },

      /*
        Global (ITW Creative Works)
      */
      // Economy
      currency: {
        types: ['string'],
        default: '<:currency:1245646241073860678>',
        required: false,
      },
      xp: {
        types: ['string'],
        default: '<a:xp:1245646239698128939>',
        required: false,
      },

      // General
      loading: {
        types: ['string'],
        default: '<a:loading:1245650912136138823>',
        required: false,
      },
      cheers: {
        types: ['string'],
        default: '<a:cheers:1245650888568340602>',
        required: false,
      },
      boost: {
        types: ['string'],
        default: '<a:boost:1245651405428228168>',
        required: false,
      },
      yeet: {
        types: ['string'],
        default: '<:yeet:1245651435442667582>',
        required: false,
      },
      celebrate: {
        types: ['string'],
        default: '<a:celebrate:1245651477708673144>',
        required: false,
      },

      // Roles
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
