const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const sharp = require('sharp');
const config = require('../config/config');

const TWEET_BUTTON_ID = 'tweet_create';
const TWEET_MODAL_ID = 'tweet_modal';
const TWEET_INPUT_ID = 'tweet_content';
const TWEET_PANEL_TITLE = 'Tweet yaz';

function getTweetPanelPayload() {
  return {
    embeds: [new EmbedBuilder()
      .setColor(config.COLORS.INFO)
      .setTitle('UNEC Gaming Club Tweet')
      .setDescription('Fikirlərini bizimlə paylaşmaq üçün aşağıdakı düyməyə bas və tweetini yaz.')
      .setFooter({ text: config.FOOTER_TEXT })],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(TWEET_BUTTON_ID)
        .setLabel(TWEET_PANEL_TITLE)
        .setEmoji('📝')
        .setStyle(ButtonStyle.Primary),
    )],
  };
}

function escapeXml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&apos;',
    '"': '&quot;',
  }[character]));
}

function wrapTweetText(content, maxCharacters = 48) {
  return content.split(/\r?\n/).flatMap((paragraph) => {
    if (!paragraph) return [''];
    const words = paragraph.split(/\s+/);
    const lines = [];
    let line = '';

    for (const word of words) {
      if ((line + (line ? ' ' : '') + word).length > maxCharacters && line) {
        lines.push(line);
        line = word;
      } else {
        line += `${line ? ' ' : ''}${word}`;
      }
    }
    if (line) lines.push(line);
    return lines;
  }).slice(0, 10);
}

async function getAvatarDataUri(user) {
  try {
    const response = await fetch(user.displayAvatarURL({ extension: 'png', size: 128 }));
    if (!response.ok) return null;
    const avatar = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:image/png;base64,${avatar}`;
  } catch (err) {
    console.warn('[Tweet avatarı yüklənmədi]', err.message);
    return null;
  }
}

async function getTweetImage(user, content) {
  const displayName = escapeXml(user.globalName || user.username);
  const username = escapeXml(`@${user.username}`);
  const lines = wrapTweetText(content);
  const avatarDataUri = await getAvatarDataUri(user);
  const height = Math.max(420, 270 + (lines.length * 42));
  const contentSvg = lines.map((line, index) => (
    `<text x="145" y="${205 + (index * 42)}" class="content">${escapeXml(line)}</text>`
  )).join('');
  const avatarSvg = avatarDataUri
    ? `<image href="${avatarDataUri}" x="55" y="48" width="64" height="64" clip-path="url(#avatar)" preserveAspectRatio="xMidYMid slice"/>`
    : '<circle cx="87" cy="80" r="32" fill="#1da1f2"/><text x="87" y="91" text-anchor="middle" class="avatarText">U</text>';

  const svg = `<svg width="900" height="${height}" viewBox="0 0 900 ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="avatar"><circle cx="87" cy="80" r="32"/></clipPath>
    </defs>
    <rect width="900" height="${height}" rx="22" fill="#ffffff"/>
    ${avatarSvg}
    <text x="145" y="72" class="name">${displayName}</text>
    <text x="145" y="105" class="username">${username}  •  indi</text>
    ${contentSvg}
    <line x1="70" y1="${height - 105}" x2="830" y2="${height - 105}" stroke="#d8d8d8" stroke-width="2"/>
    <text x="170" y="${height - 45}" class="action">♡</text>
    <text x="365" y="${height - 45}" class="action">↻</text>
    <text x="560" y="${height - 45}" class="action">♡</text>
    <text x="750" y="${height - 45}" class="action">↗</text>
    <style>
      .name { font: 700 28px Arial, sans-serif; fill: #101214; }
      .username { font: 22px Arial, sans-serif; fill: #6b7280; }
      .content { font: 30px Arial, sans-serif; fill: #101214; }
      .action { font: 42px Arial, sans-serif; fill: #626a73; }
      .avatarText { font: 700 28px Arial, sans-serif; fill: #ffffff; }
    </style>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function getTweetPayload(user, content) {
  const image = await getTweetImage(user, content);

  return {
    files: [{ attachment: image, name: 'tweet.png' }],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(TWEET_BUTTON_ID)
        .setLabel(TWEET_PANEL_TITLE)
        .setEmoji('📝')
        .setStyle(ButtonStyle.Secondary),
    )],
  };
}

async function ensureTweetPanelMessage(client) {
  if (!config.TWEET_CHANNEL_ID) return;

  const channel = await client.channels.fetch(config.TWEET_CHANNEL_ID);
  if (!channel || !channel.isTextBased() || !channel.guild) {
    throw new Error('Tweet kanalı tapılmadı və ya mətn kanalı deyil.');
  }

  const messages = await channel.messages.fetch({ limit: 50 });
  const existingMessage = messages.find((message) => message.author.id === client.user.id
    && message.embeds.some((embed) => embed.title === 'UNEC Gaming Club Tweet'));
  const payload = getTweetPanelPayload();

  if (existingMessage) {
    await existingMessage.edit(payload);
  } else {
    await channel.send(payload);
  }

  console.log(`🐦 Tweet panelı hazırdır: #${channel.name}`);
}

module.exports = {
  TWEET_BUTTON_ID,
  TWEET_MODAL_ID,
  TWEET_INPUT_ID,
  getTweetPanelPayload,
  getTweetPayload,
  ensureTweetPanelMessage,
};