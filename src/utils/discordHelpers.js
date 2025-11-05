const { EmbedBuilder } = require('discord.js');

/**
 * Announce a Notion status change in a Discord channel using an embed.
 * @param {Object} client - Discord.js client
 * @param {string} title - Page title
 * @param {string} status - Status string
 * @param {string} url - Page URL
 */
const announceStatusChange = async (client, title, status, url) => {
  try {
    const channel = await client.channels.fetch(process.env.LOGS_CHANNEL);
    if (!channel) {
      console.warn('[DiscordHelpers] Channel not found');
      return;
    }

    // Define color palette by status
    const statusColors = {
      'Not Started': 0x808080, // gray
      'In Progress': 0xf1c40f, // yellow
      'Done': 0x2ecc71,        // green
      'Archived': 0x95a5a6,    // muted gray
    };

    // Notion logo (transparent background preferred)
    const notionLogo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSdH-QSCjbXL3npBNdna1LM-pG36Q0OnGWcA&s';

    // Build embed
    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Notion Update',
        iconURL: notionLogo,
      })
      .setTitle(title)
      .setURL(url || null)
      .setDescription(`**Status changed to:** ${status}`)
      .setColor(statusColors[status] || 0x5865f2)
      .setThumbnail(notionLogo)
      .setTimestamp()
      .setFooter({ text: 'Notion ↔ Discord Sync' });

    await channel.send({ embeds: [embed] });

    console.log(`[DiscordHelpers] Announced "${title}" → ${status}`);
  } catch (err) {
    console.error('[DiscordHelpers] Failed to send Discord embed:', err);
  }
};

module.exports = { announceStatusChange };
