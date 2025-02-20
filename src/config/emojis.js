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
        default: '<:logo:1318830250544594995>',
        required: true,
      },

      /*
        Global (ITW Creative Works)
      */
      // Economy
      currency: {
        types: ['string'],
        default: '<:currency:1318808784432398426>',
        required: false,
      },
      xp: {
        types: ['string'],
        default: '<a:xp:1318809360821915712>',
        required: false,
      },

      // General
      loading: {
        types: ['string'],
        default: '<a:loading:1318808894360916018>',
        required: false,
      },
      cheers: {
        types: ['string'],
        default: '<a:cheers:1318808989273686056>',
        required: false,
      },
      boost: {
        types: ['string'],
        default: '<a:boost:1318808909196034093>',
        required: false,
      },
      yeet: {
        types: ['string'],
        default: '<:yeet:1318808803432595478>',
        required: false,
      },
      celebrate: {
        types: ['string'],
        default: '<a:celebrate:1318808880024653824>',
        required: false,
      },

      // Roles
      betaTester: {
        types: ['string'],
        default: '<:beta:1318806966503608371>',
        required: false,
      },
      premium: {
        types: ['string'],
        default: '<:premium:1342001431053602826>',
        required: false,
      },
      active: {
        types: ['string'],
        default: '<:active:1318806963496419408>',
        required: false,
      },
      member: {
        types: ['string'],
        default: '<:member:1318807952886595685>',
        required: false,
      },
      bot: {
        types: ['string'],
        default: '<:bot:1318806971398356992>',
        required: false,
      },
      og: {
        types: ['string'],
        default: '<:og:1318806985554133032>',
        required: false,
      },
      vip: {
        types: ['string'],
        default: '<:vip:1318806992638181427>',
        required: false,
      },
      admin: {
        types: ['string'],
        default: '<:admin:1318806964922220646>',
        required: false,
      },
      serverBooster: {
        types: ['string'],
        default: '<:booster:1318806969611583569>',
        required: false,
      },
      moderator: {
        types: ['string'],
        default: '<:moderator:1318806981200449556>',
        required: false,
      },
      staff: {
        types: ['string'],
        default: '<:staff:1318808667054805064>',
        required: false,
      },
    },
  };
}
