const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  SlashCommandBuilder,
} = require('discord.js');
const sharp = require('sharp');

const SERVERINFO_REFRESH_BUTTON_ID = 'serverinfo_refresh';

function escapeXml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&apos;',
    '"': '&quot;',
  }[character]));
}

async function getGuildIconDataUri(guild) {
  if (!guild.iconURL()) return null;

  try {
    const response = await fetch(guild.iconURL({ extension: 'png', size: 256 }));
    if (!response.ok) return null;
    const icon = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:image/png;base64,${icon}`;
  } catch (err) {
    console.warn('[Server ikonası yüklənmədi]', err.message);
    return null;
  }
}

async function buildServerImage(guild) {
  const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
  let ownerName = guild.members.cache.get(guild.ownerId)?.user.username;
  if (!ownerName) {
    try {
      const owner = await guild.members.fetch(guild.ownerId);
      ownerName = owner.user.username;
    } catch (err) {
      console.warn('[Server sahibi yüklənmədi]', err.message);
      ownerName = 'Məlum deyil';
    }
  }
  const activeMembers = guild.presences?.cache.filter((presence) => presence.status !== 'offline').size || 0;
  const voiceMembers = guild.voiceStates?.cache.filter((voiceState) => voiceState.channelId).size || 0;
  const createdAt = new Date(guild.createdTimestamp).toLocaleDateString('az-AZ');
  const iconDataUri = await getGuildIconDataUri(guild);
  const serverName = escapeXml(guild.name);
  const iconSvg = iconDataUri
    ? `<image href="${iconDataUri}" x="60" y="52" width="112" height="112" clip-path="url(#icon)" preserveAspectRatio="xMidYMid slice"/>`
    : '<circle cx="116" cy="108" r="56" fill="#5865f2"/><text x="116" y="120" text-anchor="middle" class="fallbackIcon">UGC</text>';
  const stats = [
    ['Sahib', ownerName],
    ['Üzv sayı', guild.memberCount],
    ['Rol sayı', guild.roles.cache.size],
    ['Mətn kanalları', textChannels],
    ['Səs kanalları', voiceChannels],
    ['Aktiv istifadəçi', activeMembers],
    ['Səsdə aktiv', voiceMembers],
    ['Yaradılıb', createdAt],
  ];
  const statSvg = stats.map(([label, value], index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 60 + (column * 270);
    const y = 235 + (row * 120);
    return `<rect x="${x}" y="${y}" width="240" height="92" rx="14" fill="#293039"/>
      <text x="${x + 22}" y="${y + 32}" class="label">${escapeXml(label)}</text>
      <text x="${x + 22}" y="${y + 69}" class="value">${escapeXml(String(value))}</text>`;
  }).join('');

  const svg = `<svg width="900" height="640" viewBox="0 0 900 640" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#151a20"/>
        <stop offset="1" stop-color="#242d36"/>
      </linearGradient>
      <clipPath id="icon"><rect x="60" y="52" width="112" height="112" rx="26"/></clipPath>
    </defs>
    <rect width="900" height="640" rx="24" fill="url(#background)"/>
    <rect x="0" y="0" width="10" height="640" rx="5" fill="#5865f2"/>
    ${iconSvg}
    <text x="205" y="90" class="title">${serverName}</text>
    <text x="205" y="130" class="subtitle">Server məlumatları</text>
    ${statSvg}
    <text x="60" y="605" class="footer">UNEC Gaming Club  •  Server Info</text>
    <style>
      .title { font: 700 36px Arial, sans-serif; fill: #ffffff; }
      .subtitle { font: 22px Arial, sans-serif; fill: #aeb7c2; }
      .label { font: 20px Arial, sans-serif; fill: #aeb7c2; }
      .value { font: 700 25px Arial, sans-serif; fill: #ffffff; }
      .footer { font: 18px Arial, sans-serif; fill: #87919d; }
      .fallbackIcon { font: 700 22px Arial, sans-serif; fill: #ffffff; }
    </style>
  </svg>`;

  const image = await sharp(Buffer.from(svg)).png().toBuffer();
  return {
    files: [{ attachment: image, name: 'serverinfo.png' }],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(SERVERINFO_REFRESH_BUTTON_ID)
        .setLabel('Yenilə')
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Primary),
    )],
  };
}

module.exports = {
  SERVERINFO_REFRESH_BUTTON_ID,
  buildServerImage,
  category: 'Ümumi',
  name: 'serverinfo',
  description: 'Server haqqında məlumat göstərir',
  usage: 'serverinfo',

  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Server haqqında məlumat göstərir'),

  // ============ PREFIX (ugc!serverinfo) ============
  async execute(message) {
    await message.reply(await buildServerImage(message.guild));
  },

  // ============ SLASH (/serverinfo) ============
  async executeSlash(interaction) {
    await interaction.reply(await buildServerImage(interaction.guild));
  },
};
