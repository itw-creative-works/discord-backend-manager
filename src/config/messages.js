module.exports = function (instance) {

  return {
    // DEFAULTS
    ['defaults']: {
      welcome: {
        public: {
          bullets: {
            types: ['array'],
            default: [
            ],
            required: false,
          },
        },
        private: {
          bullets: {
            types: ['array'],
            default: [
              `:rocket: **Free app** that [grows your business](${instance.app.url}/download?aff=discord-dm) on auto-pilot`,
              `:money_with_wings: **Free tools** to help you start an online business`,
              `:heart_eyes: **Friendly** community`,
            ],
            required: false,
          },
          getAppUrl: {
            types: ['string'],
            default: '',
            required: false,
          },
        },
      },
      general: {
        comeToServer: {
          bullets: {
            types: ['array'],
            default: [
            ],
            required: false,
          },
        },
      },
    },
  }
}
