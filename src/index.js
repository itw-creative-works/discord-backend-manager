const { Client, GatewayIntentBits, Partials, Routes, Collection, ActivityType, channelMention, REST, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
// const { DiscordTogether } = require('discord-together');

// Setup main manager
const cwd = process.cwd();
const Manager = (new (require('backend-manager'))).init(exports, {
  projectType: 'custom',
  setupServer: true,
  cwd: cwd,
  projectPackageDirectory: cwd,
  fetchStats: false,
  log: true,
});

// Require modules
const glob = Manager.require('glob').globSync;
const jetpack = Manager.require('fs-jetpack');
const dotenv = Manager.require('dotenv');
const fetch = Manager.require('wonderful-fetch');
const powertools = Manager.require('node-powertools');
const { get, set, merge } = Manager.require('lodash');
const path = require('path');

// Configure dotenv
dotenv.config();

// Constants
const OWNER_PERM = new RegExp(`\\${path.sep}owner\\${path.sep}`);
const ADMIN_PERM = new RegExp(`\\${path.sep}admin\\${path.sep}`);
const MOD_PERM = new RegExp(`\\${path.sep}moderator\\${path.sep}`);

function DiscordManager() {
  const self = this;

  // Set initialized to false
  self.initialized = false;
  self.instances = {};

  return self;
}

DiscordManager.prototype.init = function (options) {
  const self = this;

  // Check if init
  if (self.initialized) {
    return self;
  }

  // Fix options
  options = options || {};
  options.logSavePath = options.logSavePath || false;

  // Attach options
  self.options = options;

  // Set Manager property
  Manager.DiscordManager = self;

  // Log init
  console.log(`Initializing DiscordManager with options: ${JSON.stringify(options)}`);

  // Load all server configs
  glob('servers/*/', { cwd: cwd })
  .forEach((file) => {
    // Split last part usingsystem path separator
    const name = file.split(path.sep).slice(-1)[0];

    // Save login time
    Manager.storage().set(`servers.${name}.startTime`, new Date().toISOString()).write();

    // Login
    self.login(file, 3);
  });

  // Handle online event
  try {
    self.registerUniversalEntities(Manager.getCustomServer());
  } catch (e) {
    Manager.on('online', async (event, server, app) => {
      self.registerUniversalEntities(server, app);
    })
  }

  // Set init to true
  self.initialized = true;

  return self;
}

DiscordManager.prototype.registerUniversalEntities = function (server, app) {
  const self = this;

  // Setup routes
  iterate(`routes/**/*.js`, undefined, {instance: null, nameIndex: 2})
  .then(async (files) => {
    files.forEach((file) => {
      // Load route
      app.all(`/${file.name}`, async (req, res) => {
        Manager.Middleware(req, res).run(file.name, {
          schema: file.name,
          routesDir: `${__dirname}/routes`,
          schemasDir: `${__dirname}/schemas`,
        })
      })
    });
  })
}

DiscordManager.prototype.login = async function (file, attempts) {
  const self = this;

  const projectPath = path.resolve(cwd, file);
  const name = path.basename(projectPath);
  const Manager = (new (require('backend-manager'))).init(exports, {
    projectType: 'custom',
    setupServer: false,
    cwd: projectPath,
    projectPackageDirectory: cwd,
    // fetchStats: false,
    uniqueAppName: name,
    log: false,
    logSavePath: path.join(self.options.logSavePath, name),
  });
  Manager.DiscordManager = self;

  // Create variables
  const assistant = Manager.Assistant({}, {functionName: name});
  const maxAttempts = attempts || 3;
  let DISCORD_TOKEN;
  let ENABLED;

  // Setup prefix
  // assistant.setLogPrefix(`${name}`);
  assistant.log(`Logging in as ${name}...`);

  // Set dotenv
  try {
    const env = dotenv.config({path: path.resolve(projectPath, '.env')});
    DISCORD_TOKEN = env.parsed.DISCORD_TOKEN;
    ENABLED = env.parsed.ENABLED;
  } catch (e) {
    assistant.error(new Error(`Failed to set up environment variables from .env file: ${e.message}`));
  }

  // Quit if not enabled
  if (ENABLED === 'false') {
    return assistant.warn(`Server ${name} is not enabled. Exiting...`);
  }

  // Set up client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,

      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.DirectMessages,

      GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
      Partials.Channel, // Required to receive DMs
    ],
  });
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  // Set up Discord Together
  // client.discordTogether = new DiscordTogether(client);

  // On ready
  client.once('ready', async () => {
    const commandsJSON = [];
    const instance = self.instances[name];

    // Setup main
    Manager.discord = {
      instance: instance,
      assistant: assistant,
      client: client,
      rest: rest,
      helpers: new (require('./helpers/helpers.js'))(instance),
      profile: new (require('./helpers/profile.js'))(instance),
      invites: new Collection(),
      options: {
        enableCommands: true,
      },
      memberRoleUpdateIgnore: [],
      session: {
        members: {
          // MEMBER_ID: { messages: 0, }
        },
      },
    };

    // Shortcuts
    const helpers = Manager.discord.helpers;

    // Setup config
    await iterate(`config/**/*.js`, projectPath, {instance: instance, schemafy: true})
    .then(async (files) => {
      files.forEach((file) => {
        set(Manager, `discord.config.${file.name}`, file.content);

        // assistant.log('Registered config for', file.name, file.content);
      });
    })

    // Setup events
    await iterate(`events/**/*.js`, projectPath, {instance: instance,})
    .then(async (files) => {
      files.forEach(file => {
        const event = require(file.path);

        // Register event
        set(Manager, `discord.events.${file.name}`, event);

        // Register event
        // client.on(file.name, event)
        client.on(file.name, (...args) => event(instance, ...args));

        // assistant.log('Registered listener for', file.name);
      });
    })

    // Setup commands
    await iterate(`commands/**/*.js`, projectPath, {instance: instance})
    .then(async (files) => {
      files.forEach(file => {
        const item = loadCommand(assistant, file.path);

        // Register command
        set(Manager, `discord.commands.${item.data.name}`, item);

        // Ensure admin and moderator commands have proper permissions
        resolveCommand(item, file.path);

        // Register command
        commandsJSON.push(item.data.toJSON());

        // Log
        // assistant.log('Registered command for', file.name, command.data.name);
      });
    })

    // // Setup context menus
    await iterate(`context-menus/**/*.js`, projectPath, {instance: instance})
    .then(async (files) => {
      files.forEach(file => {
        const item = loadCommand(assistant, file.path);

        // Register context menu
        set(Manager, `discord.contextMenus.${file.name}`, item);

        // Ensure admin and moderator commands have proper permissions
        resolveCommand(item, file.path);

        // Register context menu
        commandsJSON.push(item.data.toJSON());

        // assistant.log('Registered context-menu for', file.name, item);
      });
    })


    // commandsJSON.forEach((command) => {
    //   // console
    //   console.log('---command.name', name, command.name);
    // })

    // Initiate processes
    await iterate(`processes/**/*.js`, projectPath, {instance: instance})
    .then(async (files) => {
      files.forEach(file => {
        const currentProcess = require(file.path);
        currentProcess.data.name = file.name;

        set(Manager, `discord.processes.${currentProcess.data.name}`, currentProcess);
        function _execute(p) {
          assistant.log(`Running process ${p.data.name}`);
          p.execute(instance);
        }

        if (!currentProcess.data.enabled) {
          return assistant.log(`Skipping process ${currentProcess.data.name}`);
        }

        if (currentProcess.data.interval) {
          setInterval(function () {
            _execute(currentProcess)
          }, currentProcess.data.interval);
        }
        if (currentProcess.data.runInitially) {
          // const delay = Manager.discord.config.settings.initialProcessDelay || 0;
          const delay = currentProcess.data.initialDelay || 0;
          if (delay) {
            assistant.log(`Delaying process ${currentProcess.data.name}`);
          }
          setTimeout(function () {
            _execute(currentProcess);
          }, delay);
        }
      });
    })

    // Get official server
    const officialServer = await helpers.getOfficialServer();

    // Publish commands
    await rest.put(Routes.applicationCommands(client.user.id), { body: commandsJSON })
    // await rest.put(Routes.applicationCommands(client.user.id), { body: {} })
      .then((r) => {
        assistant.log(`💿 Successfully published all commands!`);
        Manager.discord.publishedCommands = r;
      })
      .catch((e) => assistant.error(`❌ Failed to published commands:`, e))

    // Loop over all the guilds
    const firstInvites = await officialServer.invites.fetch();
    Manager.discord.invites.set(officialServer.id, new Collection(firstInvites.map((invite) => [invite.code, invite.uses])));

    // Test
    // assistant.log('Member', await helpers.getOfficialServerMember('549076304830660619'));

    // Set activity
    const url = new URL(Manager.config.brand.url);
    client.user.setActivity({
      name: url.host,
      state: `🚀 ${url.host}`,
      url: url.href,
      type: ActivityType.Custom,
      // shardId: 0,
    });
    // client.user.setActivity({
    //   name: url.host,
    //   state: url.host,
    //   url: 'https://www.youtube.com/watch?v=m4XZMI5Xdng',
    //   type: ActivityType.Streaming,
    //   // shardId: 0,
    // });

    // Make bot join voice channel XXX and start the YouTube Activity
    helpers.autoActivityStarter();

    // Log
    assistant.log(`🤖 Logged in as ${client.user.tag}!`);
  });

  // client.on('debug', function (event) {
  // 	assistant.log('[Client Debug]', event);
  // })

  client.on('warn', (event) => {
    assistant.warn('[Discord warn]', event);
  });

  client.on('error', (event) => {
    assistant.error('[Discord error]', event);
  });

  client.on('disconnect', (message) => {
    assistant.error('[Discord disconnect]', message);
  });

  // Fetch app Object
  const app = await Manager.getApp();

  // Set instance
  self.instances[name] = {
    path: projectPath,
    Manager: Manager,
    assistant: assistant,
    client: client,
    rest: rest,
    app: app,
  };

  // Login using attempts
  const login = () => {
    return new Promise((resolve, reject) => {
      const attemptLogin = async () => {
        const attempt = `(${maxAttempts - attempts + 1}/${maxAttempts})`;

        // Log
        assistant.log(`Attempting login ${attempt}...`);

        try {
          await client.login(DISCORD_TOKEN);
          assistant.log(`Login successful ${attempt}!`);
          resolve();
        } catch (e) {
          if (attempts > 0) {
            attempts--;
            assistant.warn(`Login failed ${attempt}, retrying in 5 seconds...`, e);
            setTimeout(attemptLogin, 5000);
          } else {
            assistant.error(`Login failed after all attempts ${attempt}`, e);
            reject(e);
          }
        }
      }
      attemptLogin();
    });
  }

  // Start login
  await login();

  // Return self
  return self;
}

// Helpers
function iterate(pattern, customDir, options) {
  return new Promise((resolve, reject) => {
    const defaultDir = __dirname;
    const result = [];

    // Set options
    options = options || {};
    options.instance = typeof options.instance === 'undefined' ? null : options.instance;
    options.nameIndex = typeof options.nameIndex === 'undefined' ? 1 : options.nameIndex;
    options.schemafy = typeof options.schemafy === 'undefined' ? false : options.schemafy;

    // File loader
    const req = (path) => {
      try {
        return require(path);
      } catch (e) {
        return {};
      }
    }

    // Helper function to process files and add them to the result
    const processFiles = (dir, type) => {
      const files = glob(pattern, { cwd: dir });

      // Loop over files
      files.forEach((file) => {
        const filePath = path.resolve(dir, file);
        const fileName = file.split(path.sep).slice(-options.nameIndex)[0].split('.')[0];
        const item = {
          name: fileName,
          path: filePath,
          content: req(filePath),
          schema: type === 'default' && options.schemafy
            ? req(filePath)(options.instance).defaults
            : {},
        };

        // Replace item if exists, otherwise push new item
        const index = result.findIndex((item) => item.name === fileName);
        if (index !== -1) {
          const existing = result[index];
          const content = item.content(options.instance)

          // Run schema defaults
          if (options.schemafy) {
            item.content = powertools.defaults(content, existing.schema);

            // Add other items back into it
            powertools.getKeys(content).forEach((key) => {
              const value = get(item.content, key);
              if (value === undefined) {
                set(item.content, key, get(content, key));
              }
            });
          }

          // Replace item
          result[index] = item;
        } else {
          // Run schema defaults
          if (options.schemafy) {
            item.content = powertools.defaults({}, item.schema);
          }
          result.push(item);
        }
      });
    };

    // Process files from default and custom directories
    processFiles(defaultDir, 'default');
    if (customDir) {
      processFiles(customDir);
    }

    // Return the result
    return resolve(result);
  });
}

function resolveCommand(command, filePath) {
  if (filePath.match(OWNER_PERM)) {
    command.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    command.permission = 'owner';
  } else if (filePath.match(ADMIN_PERM)) {
    command.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    command.permission = 'admin';
  } else if (filePath.match(MOD_PERM)) {
    command.data.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers);
    command.permission = 'moderator';
  } else {
    command.permission = 'member';
  }
}

function loadCommand(assistant, filePath) {
  const command = require(filePath);

  // Get the first index
  // assistant.log('---item', filePath, typeof command.data, typeof command.data[0]);
  // assistant.log('---command.data', command.data);

  // Get the first index
  // THIS SHIT IS WACK DONT CHAGNE IT (SWEAR TO FUCKING GOD THE LAST COMMAND FILE NO MATTER WHAT IT IS WILL BREAK)
  // EVEYR OTHER FILE IS A PROPER ARRAY EXCEPT THE LAST FILE, DOESNT MATTER WHAT FILE IT IS LMAOOO
  command.data = command.data[0] || command.data;

  return command;
}

module.exports = DiscordManager;
