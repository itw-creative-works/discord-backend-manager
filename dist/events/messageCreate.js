const { EmbedBuilder, ChannelType } = require('discord.js');
const processAutoSupport = require('../helpers/individual/processAutoSupport.js');
const processNormalMessage = require('../helpers/individual/processNormalMessage.js');
const processStaffPremium = require('../helpers/individual/processStaffPremium.js');

module.exports = async function (instance, message) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Load libraries
  const { get, set } = Manager.require('lodash');

  // Get properties
  const isOfficialServer = message?.guild?.id === config.main.server;
  const isDM = message.channel.type === ChannelType.DM;

  if (message.author.bot) { return}

  if (isOfficialServer || isDM) {
    const member = isOfficialServer ? message.member : message.author;

    assistant.log(`[Message] ${message.author.username} (${message.channel.name}):`, message.content);

    if (isOfficialServer) {
      const messagePath = `discord.session.members.${member.id}.messages`;
      const messages = get(Manager, messagePath, []).concat({channel: message.channel.id, timestamp: new Date().toISOString()});

      // Save message count
      set(Manager, messagePath, messages);

      // Count for this channel
      // const messageCount = messages.filter(item => item.channel === message.channel.id).length;

      processNormalMessage(instance, member, message);
      processAutoSupport(instance, member, message, messages);
      processStaffPremium(instance, member);
    } else if (isDM) {
      // Is an active Giveaway
      const activeGiveaway = await helpers.resolveActiveGiveaway();
      if (activeGiveaway.daysUntilExpire <= 0 && activeGiveaway.winner.id === member.id && !activeGiveaway.winner.claimed) {
		    const giveaway = await helpers.getOfficialServerChannel('events.giveaway');

        // Store claimed
			  Manager.storage().set('giveaway.winner.claimed', true).write();

        // Send DM
        await message.reply({
          content: `${config.emojis.celebrate} Congratulations, **${helpers.displayMember(member, true)}**, you have successfully **claimed your prize** for the **${activeGiveaway.prize}** giveaway! \n\n:heart_decoration: Please be patient while a staff member sends your prize to you!`,
        });

        await giveaway.send({
          content: `${config.emojis.celebrate} **${helpers.displayMember(member, true)}** has claimed their prize for the **${activeGiveaway.prize}** giveaway! \n\n:heart_decoration: Thank you everyone for entering. There will be more giveaways soon! :relaxed:`,
        });

			  await helpers.updateActiveGiveaway()

        return;
      }

      // Otherwise, send them a message to bring them to the server
      await message.reply({
        content: await config.messages.general.comeToServer(member),
      });

      helpers.sendToLogChannel(`${member} (${message.author.username}) DM'd me: \n${message.content}`)
    }
  }

}

