const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('wonderful-fetch');

module.exports = {
  data: [
    new SlashCommandBuilder()
      .setName('trigger-error')
      .setDescription('Trigger various error types to test error handling')
      .addStringOption(option =>
        option
          .setName('type')
          .setDescription('The type of error to trigger')
          .setRequired(true)
          .addChoices(
            { name: 'DNS Error (ENOTFOUND)', value: 'dns' },
            { name: 'Unhandled Promise Rejection', value: 'promise' },
            { name: 'Async DNS Error', value: 'async-dns' },
            { name: 'Uncaught Exception', value: 'exception' },
            { name: 'Firebase/Google API Error', value: 'firebase' },
            { name: 'Process Exit', value: 'exit' },
            { name: 'Memory Crash', value: 'memory' },
            { name: 'Timeout', value: 'timeout' }
          )
      )
      .addIntegerOption(option =>
        option
          .setName('delay')
          .setDescription('Delay in milliseconds before triggering error')
          .setRequired(false)
      ),
  ],
  options: {
  },
  settings: {
  },
  execute: async (instance, event) => {
    const Manager = instance.Manager;
    const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
    const assistant = instance.assistant;

    // Set shortcuts
    const interaction = event.interaction;
    const options = event.options;
    const errorType = options.type;
    const delay = options.delay || 0;

    // Log
    assistant.warn(`Triggering ${errorType} error in ${delay}ms...`);

    // Reply first
    await interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.orange)
          .setDescription(`⚠️ Triggering **${errorType}** error in ${delay}ms...\n\nThis will likely crash the bot and trigger a restart.`)
      ]
    });

    // Trigger error after delay
    setTimeout(async () => {
      switch (errorType) {
        case 'dns':
          // Direct DNS error
          assistant.error('Triggering DNS error...');
          try {
            await fetch('https://this-domain-definitely-does-not-exist-123456789.com', {
              response: 'json'
            });
          } catch (e) {
            assistant.error('DNS error caught:', e.message);
            throw e; // Re-throw to make it unhandled
          }
          break;

        case 'promise':
          // Unhandled promise rejection
          assistant.error('Triggering unhandled promise rejection...');
          Promise.reject(new Error('Test unhandled promise rejection'));
          break;

        case 'async-dns':
          // Async DNS error (simulates Manager.getApp() error)
          assistant.error('Triggering async DNS error...');
          (async () => {
            const error = new Error('getaddrinfo ENOTFOUND us-central1-itw-creative-works.cloudfunctions.net');
            error.code = 'ENOTFOUND';
            error.errno = -3008;
            error.syscall = 'getaddrinfo';
            error.hostname = 'us-central1-itw-creative-works.cloudfunctions.net';
            throw error;
          })();
          break;

        case 'exception':
          // Uncaught exception
          assistant.error('Triggering uncaught exception...');
          throw new Error('Test uncaught exception');

        case 'firebase':
          // Firebase/Google API error
          assistant.error('Triggering Firebase error...');
          (async () => {
            const error = new Error('Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token with the following error: "request to https://www.googleapis.com/oauth2/v4/token failed, reason: getaddrinfo ENOTFOUND www.googleapis.com"');
            error.code = 'ENOTFOUND';
            throw error;
          })();
          break;

        case 'exit':
          // Process exit with error code
          assistant.error('Triggering process exit with code 1...');
          process.exit(1);
          break;

        case 'memory':
          // Memory crash (be careful with this!)
          assistant.error('Triggering memory crash...');
          const arr = [];
          while (true) {
            arr.push(new Array(1000000).fill('memory'));
          }
          break;

        case 'timeout':
          // Infinite loop timeout
          assistant.error('Triggering infinite loop...');
          while (true) {
            // Infinite loop
          }
          break;

        default:
          assistant.error(`Unknown error type: ${errorType}`);
      }
    }, delay);

    // Return
    return true;
  },
};