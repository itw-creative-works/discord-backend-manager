const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, userMention, roleMention, channelMention } = require('discord.js');

module.exports = function (instance, member, message, messages) {
  const Manager = instance.Manager;
  const { client, config, helpers, profile, events, commands, contextMenus, processes, invites, fastify } = Manager.discord;
  const assistant = instance.assistant;

  // Load libraries
  const fetch = Manager.require('wonderful-fetch');

  // Get support items
  const channel = message.channel;

  // Get default support channel
  helpers.getOfficialServerChannel(config.channels.defaults.support)
  .then(async (support) => {

    if (channel.id !== support.id) { return }

    const messageContent = message.content.replace(/<@!?\d+>/g, '').trim();
    const mentions = message.mentions.members.map(member => member);
    const mentionedBot = mentions.some(mention => mention.id === client.user.id);
    const mentionedPrivelagedMember = !mentionedBot && mentions.some(mention => helpers.isPrivelagedMember(mention));
    const messagesFromThisChannel = messages.filter(msg => msg.channel === channel.id);

    assistant.log('Processing auto support', `mentionedBot=${mentionedBot}, mentionedPrivelagedMember=${mentionedPrivelagedMember}, messagesFromThisChannel=${messagesFromThisChannel.length}, message=${messageContent}`);

    // Check if privelaged member is mentioned
    if (mentionedPrivelagedMember) {
      assistant.log('Backing out because privelaged member is mentioned');

      // if (messagesFromThisChannel.length === 1) {
      if (messagesFromThisChannel.length <= 3) {
        // Remind them they can get instant support from the bot by tagging it but will have to wait for a human if they tag a staff member
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(config.colors.blue)
              .setDescription(``
                + `Hey, **${helpers.displayMember(member, true)}** Tagging ${userMention(client.user.id)} is **the fastest way to get an answer**. Otherwise, please wait for a ${helpers.getPrettyRole('staff')} member to get to your question.\n`
                + ``
              )
          ]
        });
      }

      return
    }

    // Messages from this channel in the last 24 hours
    const messagesFromThisChannel_24h = messagesFromThisChannel.filter(msg => new Date(msg.timestamp) > new Date(Date.now() - 86400000));
    const resolvedRoles = helpers.resolveRole(config.main.support.exemptRoles);
    const isExempt = member.roles.cache.some((role) => resolvedRoles.includes(role.id));

    // If user is is not exempt and has reached the daily message limit, send a message
    if (
      (messagesFromThisChannel_24h.length > config.main.support.maxDailyMessages && !isExempt)
      || (messageContent.includes('/test-support'))
      // || true
    ) {
      assistant.log('Backing out because user has reached the daily message limit');

      // Get exempt roles
      let exemptRolesText = '';
      const components = [];

      // Check if user has any of the exempt roles
      config.main.support.exemptRoles.forEach((role) => {
        exemptRolesText += `${helpers.getPrettyRole(role)}\n`;

        // Check for action button role
        if (role === 'booster') {
          components.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Become a Booster')
                .setStyle(ButtonStyle.Primary)
                .setURL('https://discord.com/nitro')
            )
          )
        } else if (role === 'premium') {
          components.push(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(`Get ${instance.app.name} Premium`)
                .setStyle(ButtonStyle.Success)
                .setURL(`${instance.app.url}/pricing`)
            )
          )
        }
      });

      // Send ephemeral error
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.red)
            .setDescription(``
              + `Hey, **${helpers.displayMember(member, true)}**, you have reached the daily question limit.\n`
              + `\n`
              + `You can ask **unlimited questions** if you have any of the following roles:\n`
              // + `${resolvedRoles.map(role => helpers.getPrettyRole(role)).join('\n')}\n`
              + `${exemptRolesText}\n`
              + `\n`
            )
        ],
        components: components,
      })

      return
    }

    // Check if message has a mention
    if (!mentionedBot || (mentionedBot && messageContent.length === 0)) {
      // If user is staff, ignore
      if (helpers.isPrivelagedMember(member) && process.env.ENVIRONMENT === 'production') {
        assistant.log('Backing out because user is staff');
        return
      }

      // Simulate typing
      message.channel.sendTyping();

      // Send ephemeral error
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.red)
            .setDescription(``
              + `Hey, **${helpers.displayMember(member, true)}**, please tag ${userMention(client.user.id)} before your message so I have permission to read it and provide support.\n`
              + ``
            )
        ]
      })
      .then(async (message) => {
        // Delete message after X seconds
        setTimeout(() => {
          message.delete().catch(e => assistant.log(e));
        }, 60000);
      });

      // remove message
      message.delete().catch(e => assistant.log(e));

      return
    }

    // Simulate typing
    message.channel.sendTyping();

    // Get user's Chatsy chatID from Firebase
    const discordProfile = await profile.get(member.id);
    const firebaseAccount = await helpers.getFirebaseAccount(member.id);
    const conversationId = discordProfile?.chatsy?.conversationId || null;
    // Add some context that this is from Discord so the bot doesnt tell the user to go to Discord
    const finalMessageContent = `{context=discord application} ${messageContent}`

    // If user doesn't have a chatID, ignore
    fetch('https://api.chatsy.ai/converse', {
      method: 'post',
      response: 'json',
      body: {
        accountId: config.settings.chatsy.accountId,
        chatId: config.settings.chatsy.chatId,
        conversationId: conversationId,
        message: finalMessageContent,
        // sessionData: getSessionData(),
        userData: {
          discord: true,
          discordId: member.id,
          username: member.user.username + member.user.discriminator,
          uid: firebaseAccount.auth.uid || null,
          email: firebaseAccount.auth.email || null,
        },
      },
    })
    .then(async (response) => {
      // assistant.log('---response', response);
      const lastMessage = response.messages[response.messages.length - 1];

      // Add the user's name to the message
      lastMessage.content = `**${helpers.displayMember(member, true)}**, ${lastMessage.content}`;

      // Add support instructions to the first message since server restart
      // if (messagesFromThisChannel === 1) {
      if (messagesFromThisChannel <= 3 && config.settings.chatsy.supportInstructions) {
        lastMessage.content += ``
          + `\n\n`
          + `**Here's more things to try**\n`
          + `1. Check ${channelMention(config.channels.information.status)} to see if the issue is being worked on already.\n`
          + `2. Attach a **video and/or screenshot** to your message so we can help you faster\n`
      }

      // Save conversationId to user's profile
      await profile.set(member.id, {
        chatsy: {
          conversationId: response.id,
        }
      });

      // Reply with support
      await message.reply({
        content: lastMessage.content
      });
    })
    .catch(async (e) => {
      // Reply with support
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.red)
            .setDescription(`I am unable to respond at the moment: ${e.message}`)
        ]
      });
    });


  })

}
