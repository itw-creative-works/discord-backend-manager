const { EmbedBuilder, BaseInteraction, MessageFlags, roleMention, channelMention } = require('discord.js');
const Commands = require('../helpers/commands.js');

module.exports = async function (instance, interaction) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Load libraries
  const moment = Manager.require('moment');

  // Set variables
  const loading = `**One moment...** ${config.emojis.loading}`

  const isChatInputCommand = interaction.isChatInputCommand();
  const isUserContextMenuCommand = interaction.isUserContextMenuCommand();
  const isMessageContextMenuCommand = interaction.isMessageContextMenuCommand();

  const isButton = interaction.isButton();
  const isStringSelectMenu = interaction.isStringSelectMenu();
  const isMessageInteraction = isButton || isStringSelectMenu;

  const isOfficialServer = (interaction?.guild?.id || '-1') === config.main.server;
  const isDirectMessage = (interaction?.guild?.id || '-1') === '-1';
  const isInCommandsChannel = (interaction?.channel?.id || '-1') === config.channels.chat.commands;
  const isPrivelagedMember = helpers.isPrivelagedMember(interaction.member);

  const command = commands[interaction.commandName];
  const blockCommand = !Manager.discord.options.enableCommands;

  // Log
  assistant.log(`[Command] ${interaction?.member?.user?.username}: /${interaction.commandName} ==> permission=${command?.permission}, exists=${!!command}, blocked=${!!blockCommand}`);

  // Check for blocking
  if (blockCommand) { return };

  // Build payload
  const payload = {
    content: loading,
  }

  // If isMessageInteraction
  if (isMessageInteraction) {
    payload.flags = MessageFlags.Ephemeral;
  }

  // Send reply
  await interaction.reply(payload)
  .catch(async (e) => {
    await interaction.editReply(payload)
    .catch(async (e) => e)
  })

  // Get the Discord profile
  const discordProfile = await profile.get(interaction?.member?.id);

  // console.log('---__dirname', __dirname);
  // console.log('---isChatInputCommand', isChatInputCommand);
  // console.log('---isOfficialServer', isOfficialServer);
  // console.log('---command.permission', command.permission);
  // console.log('---process.env.OWNER_ID', process.env.OWNER_ID);

  // COMMAND TYPES
  if (isChatInputCommand) {
    // // Check for blocking
    // if (blockCommand || !command) { return };
    if (!command) { return };

    // Checks
    if (isOfficialServer) {
      if (!isInCommandsChannel && !isPrivelagedMember) {
        return helpers.sendError(interaction, `Please use commands in the ${channelMention(config.channels.chat.commands)} channel.`, {embed: false})
      }
    } else {
      // if (isOwnerCommand && interaction?.guild?.id !== 'process.env.OWNER_ID') {
      if (command.permission === 'owner' && interaction?.member?.id !== process.env.OWNER_ID) {
        return helpers.sendError(interaction, `This is a restricted command`, {embed: false})
      }
    }

    if (isDirectMessage) {
      return helpers.sendError(interaction, `Please use commands in the ${channelMention(config.channels.chat.commands)} channel.`, {embed: false})
    }

    _executeCommand(interaction, command)
  } else if (isUserContextMenuCommand || isMessageContextMenuCommand) {
    let menu;
    let command;

    Object.keys(contextMenus)
    .forEach(key => {
      menu = interaction.commandName === contextMenus[key].data.name
        ? contextMenus[key]
        : menu

      if (menu && menu.settings && menu.settings.command) {
        command = commands[menu.settings.command]
      }
    })

    assistant.log(`[Context Menu] ${interaction.member.user.username}: ${interaction.commandName}`);

    if (!menu) {return}

    if (command) {
      _executeCommand(interaction, command)
    } else {
      _executeCommand(interaction, menu)
    }

  } else if (isMessageInteraction) {
    _executeMessageInteraction(interaction, command)
  } else {
    assistant.log('Other interaction');
    return
  }

  async function _executeCommand(interaction, command) {
    try {
      // Resolve the command
      const event = await Commands.resolve(
        instance,
        interaction,
        command?.options || false,
        command?.settings || null,
      );

      // Execute the command
      await command.execute(instance, event);
    } catch (e) {
      assistant.error('Failed to execute command', e);
      return helpers.sendError(interaction, `There was an error while executing the ${interaction.commandName} command: ${e}`)
    }
  }

  async function _executeMessageInteraction(interaction, command) {
    const key = `${interaction.values ? interaction.values[0] : interaction.customId}`;
    const type = key.split('|')[0];
    const id = key.split('|')[1];
    const argument = key.split('|')[2];

    assistant.log(`[Message Interaction] ${interaction.member.user.username}: ${type} ${id} ${argument}`);

    if (!type || !id) {
      return
    }

    // Handle role menu
    if (type === 'role-menu') {
      const roleMenu = config.roleMenu.menus.find(m => m.id === id)

      if (!argument || !roleMenu) { return }

      // First we remove all OTHER roles if multiples aren't allowed
      if (!roleMenu.multiple) {

        // Create an awaitable iterable array of member role IDs
        const roles = []
        interaction.member.roles.cache.forEach(r => roles.push(r.id));

        // Iterate the array and remove any role this interaction offers
        for (var i = 0; i < roles.length; i++) {
          const memberRoleId = roles[i];
          if (roleMenu.choices.find(c => c.role === memberRoleId)) {
            await interaction.member.roles.remove(memberRoleId)
          }
        }

      }

      // Then, check if the user has the role
      const hasRole = interaction.member.roles.cache.has(argument);
      let response = '';

      // Then we can worry about adding or removing depending on if the member has the role
      if (hasRole) {
        await interaction.member.roles.remove(argument)
        response = ':x: Removed';
      } else {
        await interaction.member.roles.add(argument)
        response = ':white_check_mark: Added';
      }

      return helpers.sendNormal(interaction, `${response} the **${roleMention(argument)}** role!`, {embed: true})
    } else if (type === 'giveaway') {
      const activeGiveaway = await helpers.resolveActiveGiveaway();
      const timestampUNIX = moment(activeGiveaway.endDate.timestamp).unix();
      const winnerMessage = `The winner will be chosen <t:${timestampUNIX}:R>`

      if (activeGiveaway.daysUntilExpire <= 0) {
        await helpers.updateActiveGiveaway();
        return helpers.sendError(interaction, `This event ended <t:${timestampUNIX}:R>`, {embed: true})
      } else if (discordProfile.contest.giveaway.id === activeGiveaway.id) {
        return helpers.sendError(interaction, `You have already entered this giveaway! \n\n${winnerMessage}.`, {embed: true})
      }

      // Add to database
      await Manager.libraries.initializedAdmin.firestore().doc(`discord/${interaction.member.id}`)
      .set({
        contest: {
          giveaway: {
            id: activeGiveaway.id
          }
        }
      }, {merge: true})

      // Log to Discord
			helpers.sendToLogChannel(`:gift: ${helpers.displayMember(interaction.member, true)} has entered the giveaway (${activeGiveaway.id})!`);

      return helpers.sendNormal(interaction, `:white_check_mark: You have entered the giveaway! \n\n${winnerMessage}.`, {embed: true})
    } else {
      return helpers.sendError(interaction, `Unhandled interaction: ${type} ${id}`, {embed: true})
    }


  }
}
