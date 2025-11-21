// Example SPAM
/*
  [image.png](https://imageapp.at/1HVjc5c/1.jpg)
  [image.png](https://imageapp.at/1HVjc5c/2.jpg)
  [image.png](https://imageapp.at/1HVjc5c/3.jpg)
  [image.png](https://imageapp.at/otHnqTm/1.jpg)
*/

module.exports = async function (instance, member, message) {
  const Manager = instance.Manager;
  const { client, config, helpers } = Manager.discord;
  const assistant = instance.assistant;

  const content = message.content;
  const contentLower = content.toLowerCase();

  // Extract URLs from embeds (for when Discord renders markdown links as embeds)
  const embedUrls = message.embeds
    .map((embed) => embed.url || embed.image?.url || embed.thumbnail?.url)
    .filter(Boolean);

  // Combine content and embed URLs for checking
  const fullContent = [content, ...embedUrls].join(' ');
  const fullContentLower = fullContent.toLowerCase();

  // Check for crypto scam patterns (multiple Discord attachments)
  // https://www.reddit.com/r/discordapp/comments/1nphcbv/how_do_i_get_automod_to_block_these_new_scams/
  // https://github.com/Tazhys/zora/tree/main/src
  const cryptoScamPattern = /(https:\/\/(?:cdn|media)\.(?:discord|discordapp)\.(?:com|net)\/attachments\/\d+\/\d+\/(?:[1234]|image)\.(?:jpg|png|webp)(?:\?.*?)?(?:\s+|$)){2,}/i;

  // Check for numbered image pattern (1.jpg, 2.jpg, 3.jpg, etc.)
  const numberedImagePattern = /(https?:\/\/[^\s\)]+\/[1234]\.(?:jpg|png|webp))/gi;
  const numberedImageMatches = fullContent.match(numberedImagePattern);

  // Check for banned image hosting sites
  const bannedImageHosts = [
    'https://i.postimg.cc/',
    'https://imageds.com/',
    'imageapp.at',
  ];

  // Check for banned words/phrases
  const bannedWords = [
    // Add your banned words here
    // 'example',
  ];

  let reason = null;
  let matchedContent = null;

  // Check crypto scam pattern (Discord attachments)
  if (cryptoScamPattern.test(fullContent)) {
    reason = 'Crypto scam pattern detected (multiple Discord attachments)';
    matchedContent = 'Multiple Discord attachment links';
  }

  // Check numbered image pattern (multiple numbered images like 1.jpg, 2.jpg, 3.jpg)
  if (!reason && numberedImageMatches && numberedImageMatches.length >= 2) {
    reason = 'Crypto scam pattern detected (multiple numbered images)';
    matchedContent = `${numberedImageMatches.length} numbered image links`;
  }

  // Check banned image hosts
  if (!reason) {
    const foundBannedHost = bannedImageHosts.find((host) => fullContentLower.includes(host.toLowerCase()));
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

  // Log
  assistant.log(`[Auto-Moderation] Detected issue in message from ${helpers.displayMember(member, true)}: ${reason} - ${matchedContent}`);

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
