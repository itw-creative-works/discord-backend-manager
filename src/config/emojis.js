module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      /*
        Server-specific
      */
      // General
      logo: {
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
      member: {
        types: ['string'],
        default: '<:member:1020012165987565579>',
        required: false,
      },
      bot: {
        types: ['string'],
        default: '<:bot:1020012163345154089>',
        required: false,
      },
      og: {
        types: ['string'],
        default: '<:og:1020012164653785131>',
        required: false,
      },
      vip: {
        types: ['string'],
        default: '<:vip:1020012161159925790>',
        required: false,
      },
      admin: {
        types: ['string'],
        default: '<:admin:1020012160014893186>',
        required: false,
      },
      serverBooster: {
        types: ['string'],
        default: '<:booster:1020012158458798272>',
        required: false,
      },
      moderator: {
        types: ['string'],
        default: '<:moderator:1020012168298639360>',
        required: false,
      },
      staff: {
        types: ['string'],
        default: '<:staff:1022703578630070303>',
        required: false,
      },
    },
  };
}
