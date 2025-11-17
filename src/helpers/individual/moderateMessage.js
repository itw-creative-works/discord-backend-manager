module.exports = async function (instance, member, message) {
  const Manager = instance.Manager;
  const { client, config, helpers } = Manager.discord;
  const assistant = instance.assistant;

  const content = message.content;
  const contentLower = content.toLowerCase();

  // Check for crypto scam patterns (multiple Discord attachments)
  const cryptoScamPattern = /(https:\/\/(?:cdn|media)\.(?:discord|discordapp)\.(?:com|net)\/attachments\/\d+\/\d+\/(?:[1234]|image)\.(?:jpg|png|webp)(?:\?.*?)?(?:\s+|$)){2,}/i;

  // Check for banned image hosting sites
  const bannedImageHosts = [
    'https://i.postimg.cc/',
    'https://imageds.com/',
  ];

  // Check for banned words/phrases
  const bannedWords = [
    // Add your banned words here
    // 'example',
  ];

  let reason = null;
  let matchedContent = null;

  // Check crypto scam pattern
  if (cryptoScamPattern.test(content)) {
    reason = 'Crypto scam pattern detected (multiple Discord attachments)';
    matchedContent = 'Multiple Discord attachment links';
  }

  // Check banned image hosts
  if (!reason) {
    const foundBannedHost = bannedImageHosts.find((host) => contentLower.includes(host.toLowerCase()));
    if (foundBannedHost) {
      reason = 'Banned image host detected';
      matchedContent = foundBannedHost;
    }
  }

  // Check banned words
  if (!reason) {
    const foundBannedWord = bannedWords.find((word) => contentLower.includes(word.toLowerCase()));
    if (foundBannedWord) {
      reason = 'Banned word detected';
      matchedContent = foundBannedWord;
    }
  }

  if (reason) {
    try {
      // Delete the message
      await message.delete();

      // Log the moderation action
      await helpers.sendToLogChannel(
        `${config.emojis.warning || '⚠️'} **Auto-Moderation:** Deleted message from ${helpers.displayMember(member, true)} in <#${message.channel.id}>\n`
        + `**Reason:** ${reason}\n`
        + `**Match:** \`${matchedContent}\`\n`
        + `**Content:** ${message.content}`
      );

      // Optionally notify the user
      // await message.channel.send({
      //   content: `${member}, your message was removed because it contained prohibited content.`,
      // }).then((msg) => setTimeout(() => msg.delete(), 5000));

      return true;
    } catch (error) {
      assistant.error('Error deleting message:', error);
      return false;
    }
  }

  return false;
};
