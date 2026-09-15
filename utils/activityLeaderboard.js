const sharp = require('sharp');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { getLeaderboard } = require('./activityStats');

const MESSAGE_TOP_REFRESH_BUTTON_ID = 'messagetop_refresh';
const VOICE_TOP_REFRESH_BUTTON_ID = 'voicetop_refresh';

function escapeXml(value) {
  return String(value).replace(/[&<>']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&apos;',
  }[character]));
}

function formatVoiceHours(milliseconds) {
  return `${(milliseconds / 3600000).toFixed(2).replace('.', ',')} saat`;
}

function formatValue(value, type) {
  return type === 'voice' ? formatVoiceHours(value) : value.toLocaleString('az-AZ');
}

function getBakuUpdateText() {
  const parts = new Intl.DateTimeFormat('az-AZ', {
    timeZone: 'Asia/Baku',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date()).reduce((values, part) => {
    values[part.type] = part.value;
    return values;
  }, {});
  const updatedAt = `${parts.day} ${parts.month} ${parts.year} • ${parts.hour}:${parts.minute}`;
  return `🕒 Son yenilənmə: ${updatedAt} (Azərbaycan vaxtı)`;
}

async function getMemberData(guild, userId) {
  try {
    const member = guild.members.cache.get(userId) || await guild.members.fetch(userId);
    return {
      name: member.displayName || member.user.globalName || member.user.username,
      avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 64 }),
    };
  } catch (err) {
    return { name: userId, avatarUrl: null };
  }
}

async function getAvatarDataUri(url) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const image = await sharp(Buffer.from(await response.arrayBuffer())).png().toBuffer();
    return `data:image/png;base64,${image.toString('base64')}`;
  } catch (err) {
    return null;
  }
}

async function buildLeaderboardImage(guild, type) {
  const isVoice = type === 'voice';
  const entries = getLeaderboard(guild.id, isVoice ? 'voiceMs' : 'messageCount');
  const memberData = await Promise.all(entries.map(async (entry) => {
    const member = await getMemberData(guild, entry.userId);
    return {
      ...entry,
      ...member,
      avatarDataUri: await getAvatarDataUri(member.avatarUrl),
    };
  }));
  const rows = memberData.length ? memberData : [{ userId: '', value: 0, name: 'Hələ statistika yoxdur', avatarUrl: null }];
  const rowHeight = 58;
  const headerHeight = 150;
  const footerHeight = 48;
  const height = headerHeight + (rows.length * rowHeight) + footerHeight;
  const avatarSvg = [];
  const rowSvg = rows.map((entry, index) => {
    const y = headerHeight + (index * rowHeight);
    const avatar = entry.avatarDataUri;
    const rowBackground = index % 2 === 0 ? '#171d25' : '#202832';
    const rankColor = index < 3 ? ['#f7c948', '#c7d2df', '#d78a58'][index] : '#7f8b9a';
    const name = escapeXml(entry.name.length > 27 ? `${entry.name.slice(0, 26)}...` : entry.name);
    const value = escapeXml(formatValue(entry.value, type));
    const progressValue = memberData[0]?.value ? Math.max(3, (entry.value / memberData[0].value) * 650) : 3;
    if (avatar) {
      avatarSvg.push(`<image href="${avatar}" x="82" y="${y + 10}" width="36" height="36" clip-path="url(#avatar-${index})" preserveAspectRatio="xMidYMid slice"/>`);
    } else {
      avatarSvg.push(`<circle cx="100" cy="${y + 28}" r="18" fill="#5865f2"/>`);
    }
    return `<rect x="32" y="${y}" width="836" height="${rowHeight}" fill="${rowBackground}"/>
      <text x="54" y="${y + 36}" class="rank" fill="${rankColor}">${String(index + 1).padStart(2, '0')}</text>
      <text x="132" y="${y + 34}" class="name">${name}</text>
      <text x="818" y="${y + 34}" text-anchor="end" class="value">${value}</text>
      <rect x="132" y="${y + 46}" width="650" height="3" rx="2" fill="#313c49"/>
      <rect x="132" y="${y + 46}" width="${progressValue}" height="3" rx="2" fill="${isVoice ? '#45d3c2' : '#8a82ff'}"/>`;
  }).join('');
  const clips = rows.map((entry, index) => `<clipPath id="avatar-${index}"><circle cx="100" cy="${headerHeight + (index * rowHeight) + 28}" r="18"/></clipPath>`).join('');
  const title = isVoice ? 'Səs Sıralaması' : 'Mesaj Sıralaması';
  const subtitle = isVoice ? 'Səsdə qalma müddətinə görə top 10' : '#umumi-sohbet mesajlarına görə top 10';

  const svg = `<svg width="900" height="${height}" viewBox="0 0 900 ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#111720"/><stop offset="1" stop-color="#283442"/>
      </linearGradient>
      ${clips}
    </defs>
    <rect width="900" height="${height}" rx="18" fill="url(#background)"/>
    <rect x="0" y="0" width="8" height="${height}" rx="4" fill="${isVoice ? '#45d3c2' : '#8a82ff'}"/>
    <text x="38" y="52" class="title">${title}</text>
    <text x="38" y="84" class="subtitle">${subtitle}</text>
    <text x="812" y="53" text-anchor="end" class="badge">Top 10</text>
    <line x1="32" y1="112" x2="868" y2="112" stroke="#374452" stroke-width="2"/>
    ${rowSvg}
    ${avatarSvg.join('')}
    <text x="38" y="${height - 18}" class="footer">UNEC Gaming Club</text>
    <text x="862" y="${height - 18}" text-anchor="end" class="footer">Created by Zarzigle</text>
    <style>
      .title { font: 700 30px Arial, sans-serif; fill: #ffffff; }
      .subtitle { font: 17px Arial, sans-serif; fill: #9eacbb; }
      .badge { font: 700 14px Arial, sans-serif; fill: #dce3ed; }
      .rank { font: 700 17px Arial, sans-serif; }
      .name { font: 700 19px Arial, sans-serif; fill: #f4f7fb; }
      .value { font: 700 18px Arial, sans-serif; fill: #f4f7fb; }
      .footer { font: 15px Arial, sans-serif; fill: #81909f; }
    </style>
  </svg>`;

  const refreshButtonId = isVoice ? VOICE_TOP_REFRESH_BUTTON_ID : MESSAGE_TOP_REFRESH_BUTTON_ID;
  return {
    content: getBakuUpdateText(),
    files: [{ attachment: await sharp(Buffer.from(svg)).png().toBuffer(), name: `${type}top.png` }],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(refreshButtonId)
        .setLabel('Yenilə')
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Secondary),
    )],
  };
}

module.exports = {
  MESSAGE_TOP_REFRESH_BUTTON_ID,
  VOICE_TOP_REFRESH_BUTTON_ID,
  buildLeaderboardImage,
};