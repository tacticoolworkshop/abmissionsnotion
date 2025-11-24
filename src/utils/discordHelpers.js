// utils/discordHelpers.js
const { EmbedBuilder } = require('discord.js');

const statusColors = {
  'Not Started': 0x808080, // gray
  'In Progress': 0xf1c40f, // yellow
  'Done': 0x2ecc71,        // green (used for "mission live")
  'Archived': 0x95a5a6,    // muted gray
};

// Replace this with your own hosted icon URL when you have one
const notionLogo =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSdH-QSCjbXL3npBNdna1LM-pG36Q0OnGWcA&s';

const settinsLogo =
  'https://upload.wikimedia.org/wikipedia/commons/2/28/Setting-front-gradient.png';

const postLogo =
  'https://i.pinimg.com/736x/2b/02/ab/2b02ab5215c8392646b9eb205ca4361c.jpg';

// Helper: wrap text in a markdown code block with a title line
const formatAsCodeBlock = (title, body) => {
  const safeTitle = title || 'Task';
  const safeBody = (body || '').replace(/```/g, 'ʼʼʼ'); // avoid breaking code block

  return [
    '```md',
    `# ${safeTitle}`,
    safeBody && '',
    safeBody,
    '```',
  ]
    .filter(Boolean)
    .join('\n');
};

/**
 * Sends a generic status update embed for a Notion task.
 *
 * @param {import('discord.js').Client} client - Discord.js client instance.
 * @param {string} title - Notion page title.
 * @param {string} status - Current status value.
 * @param {string} url - URL of the Notion page.
 */
const announceStatusChange = async (client, title, status, url) => {
  try {
    const channel = await client.channels.fetch(process.env.LOGS_CHANNEL);
    if (!channel) {
      console.warn('[DiscordHelpers] LOGS_CHANNEL not found or inaccessible');
      return;
    }

    const statusLine = `Status: ${status || 'Unknown'}`;
    const description = formatAsCodeBlock(title, statusLine);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Notion Task Update',
        iconURL: notionLogo,
      })
      .setTitle(title || 'Untitled task')
      .setURL(url || null)
      .setDescription(description)
      .setColor(statusColors[status] || 0x5865f2)
      .setThumbnail(settinsLogo)
      .setTimestamp()
      .setFooter({ text: 'Notion ↔ Discord Sync' });

    await channel.send({ embeds: [embed] });

    console.log(`[DiscordHelpers] Status updated: "${title}" → ${status}`);
  } catch (err) {
    console.error('[DiscordHelpers] Failed to send status update embed:', err);
  }
};

/**
 * Sends a “mission” style embed when a task reaches internal status "Done",
 * meaning the mission is now live/available for users.
 *
 * @param {import('discord.js').Client} client - Discord.js client instance.
 * @param {string} title - Notion page title.
 * @param {string} url - URL of the Notion page.
 * @param {string} [content] - Optional plain-text content preview for the page.
 * @param {string} [postImage] - Optional image URL from Notion (post_image).
 */
const announceMission = async (client, title, url, content, postImage) => {
  try {
    const channel = await client.channels.fetch(process.env.LOGS_CHANNEL);
    if (!channel) {
      console.warn('[DiscordHelpers] LOGS_CHANNEL not found or inaccessible');
      return;
    }

    const summaryText = content && content.trim()
      ? content.trim().length > 700
        ? content.trim().slice(0, 700).trimEnd() + '…'
        : content.trim()
      : '';

    // Code block = short mission announcement + status
    const statusBlock = formatAsCodeBlock(
      title,
      ['🚀 New mission available', '', 'Status: Live'].join('\n')
    );

    // Rest of content = normal markdown outside the code block
    let description = statusBlock;

    if (summaryText) {
      description += `\n\n**Mission details:**\n${summaryText}`;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'New Mission Available',
        iconURL: notionLogo,
      })
      .setTitle(title || 'New mission')
      .setURL(url || null)
      .setDescription(description)
      .setColor(statusColors['Done']) // still using the green "Done" color
      .setTimestamp()
      .setThumbnail(postLogo)
      .setFooter({ text: 'Notion ↔ Discord Sync' });

    if (postImage) {
      console.log(`[DiscordHelpers] Using postImage for mission ${title} embed`);
      embed.setImage(postImage);
    }

    await channel.send({ embeds: [embed] });

    console.log(`[DiscordHelpers] Mission announcement sent for "${title}"`);
  } catch (err) {
    console.error('[DiscordHelpers] Failed to send mission embed:', err);
  }
};

module.exports = {
  announceStatusChange,
  announceMission,
};
