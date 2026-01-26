// Example SPAM
/*
  [image.png](https://imageapp.at/1HVjc5c/1.jpg)
  [image.png](https://imageapp.at/1HVjc5c/2.jpg)
  [image.png](https://imageapp.at/1HVjc5c/3.jpg)
  [image.png](https://imageapp.at/otHnqTm/1.jpg)

  ||​||||​||||​||||​|| ... (zero-width spam) ... https://imgur.com/r7Xs2ZC
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

  // Extract URLs from actual file attachments
  const attachmentUrls = message.attachments
    .map((attachment) => attachment.url)
    .filter(Boolean);

  // Combine content, embed URLs, and attachment URLs for checking
  const fullContent = [content, ...embedUrls, ...attachmentUrls].join(' ');
  const fullContentLower = fullContent.toLowerCase();

  // Check for multiple Discord CDN/media attachment links (common scam pattern)
  // https://www.reddit.com/r/discordapp/comments/1nphcbv/how_do_i_get_automod_to_block_these_new_scams/
  // https://github.com/Tazhys/zora/tree/main/src
  const discordAttachmentPattern = /https:\/\/(?:cdn|media)\.(?:discord|discordapp)\.(?:com|net)\/attachments\/\d+\/\d+\/[^\s]+\.(?:jpg|png|webp|gif)/gi;
  const discordAttachmentMatches = fullContent.match(discordAttachmentPattern);

  // Check for numbered image pattern (1.jpg, 2.jpg, 3.jpg, etc.)
  const numberedImagePattern = /(https?:\/\/[^\s\)]+\/[1234]\.(?:jpg|png|webp))/gi;
  const numberedImageMatches = fullContent.match(numberedImagePattern);

  // Check for zero-width characters (used to hide spam)
  // \u200B = zero-width space, \u200C = zero-width non-joiner, \u200D = zero-width joiner, \u2060 = word joiner
  const zeroWidthPattern = /[\u200B\u200C\u200D\u2060]/g;
  const zeroWidthMatches = content.match(zeroWidthPattern);

  // Check for excessive empty spoiler tags (||​||)
  const emptySpoilerPattern = /\|\|\u200B?\|\|/g;
  const emptySpoilerMatches = content.match(emptySpoilerPattern);

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

  // Debug logging for moderation checks
  if (message.attachments.size > 0 || embedUrls.length > 0) {
    assistant.log(`[Auto-Moderation] Checking message from ${helpers.displayMember(member, true)}: attachments=${message.attachments.size}, embeds=${embedUrls.length}, contentLength=${content.length}`);
  }

  // Check for multiple image attachments with little/no text (common crypto scam pattern)
  // Scammers often post 3-4 images with no explanation
  const imageAttachments = message.attachments.filter((a) =>
    a.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name)
  );
  const contentWithoutWhitespace = content.replace(/\s/g, '');
  if (imageAttachments.size >= 3 && contentWithoutWhitespace.length < 20) {
    reason = 'Crypto scam pattern detected (multiple image attachments with no text)';
    matchedContent = `${imageAttachments.size} image attachments`;
  }

  // Check for multiple Discord attachment links (3+ is suspicious)
  if (!reason && discordAttachmentMatches && discordAttachmentMatches.length >= 3) {
    reason = 'Crypto scam pattern detected (multiple Discord attachments)';
    matchedContent = `${discordAttachmentMatches.length} Discord attachment links`;
  }

  // Check numbered image pattern (multiple numbered images like 1.jpg, 2.jpg, 3.jpg)
  if (!reason && numberedImageMatches && numberedImageMatches.length >= 2) {
    reason = 'Crypto scam pattern detected (multiple numbered images)';
    matchedContent = `${numberedImageMatches.length} numbered image links`;
  }

  // Check for excessive zero-width characters (spam obfuscation technique)
  if (!reason && zeroWidthMatches && zeroWidthMatches.length >= 10) {
    reason = 'Spam pattern detected (excessive zero-width characters)';
    matchedContent = `${zeroWidthMatches.length} zero-width characters`;
  }

  // Check for excessive empty spoiler tags (||​||)
  if (!reason && emptySpoilerMatches && emptySpoilerMatches.length >= 5) {
    reason = 'Spam pattern detected (excessive empty spoiler tags)';
    matchedContent = `${emptySpoilerMatches.length} empty spoiler tags`;
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

  if (reason) {
    // Log only when an issue is detected
    assistant.log(`[Auto-Moderation] Detected issue in message from ${helpers.displayMember(member, true)}: ${reason} - ${matchedContent}`);
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
