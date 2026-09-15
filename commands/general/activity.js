const { SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');
const { getUserStats } = require('../../utils/activityStats');

function escapeXml(value) {
  return String(value).replace(/[&<>']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&apos;',
  }[character]));
}

function formatVoiceTime(milliseconds) {
  return `${(milliseconds / 3600000).toFixed(2).replace('.', ',')} saat`;
}

function getTarget(message, args) {
  const commandArgs = args || [];
  return message.mentions.members.first()
    || (commandArgs[0] ? message.guild.members.cache.get(commandArgs[0]) : null)
    || message.member;
}

async function getAvatarDataUri(target) {
  try {
    const response = await fetch(target.user.displayAvatarURL({ extension: 'png', size: 256 }));
    if (!response.ok) return null;
    const avatar = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:image/png;base64,${avatar}`;
  } catch (err) {
    console.warn('[Aktivlik avatarı yüklənmədi]', err.message);
    return null;
  }
}

async function buildActivityImage(target) {
  const stats = getUserStats(target.guild.id, target.id);
  const displayName = escapeXml(target.user.globalName || target.user.username);
  const username = escapeXml(`@${target.user.username}`);
  const avatarDataUri = await getAvatarDataUri(target);
  const avatarSvg = avatarDataUri
    ? `<image href="${avatarDataUri}" x="58" y="52" width="112" height="112" clip-path="url(#avatar)" preserveAspectRatio="xMidYMid slice"/>`
    : '<circle cx="114" cy="108" r="56" fill="#5865f2"/><text x="114" y="120" text-anchor="middle" class="fallbackIcon">UGC</text>';
  const voiceTime = formatVoiceTime(stats.voiceMs);
  const messageCount = Number(stats.messageCount) || 0;
  const voiceHours = stats.voiceMs / 3600000;
  const messageProgress = Math.min(100, Math.max(8, Math.log10(messageCount + 1) * 24));
  const voiceProgress = Math.min(100, Math.max(8, Math.log10(voiceHours + 1) * 35));

  const svg = `<svg width="900" height="570" viewBox="0 0 900 570" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#121820"/>
        <stop offset="1" stop-color="#293545"/>
      </linearGradient>
      <linearGradient id="messageGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#6c7cff"/>
        <stop offset="1" stop-color="#9b8cff"/>
      </linearGradient>
      <linearGradient id="voiceGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#24c6dc"/>
        <stop offset="1" stop-color="#50e3c2"/>
      </linearGradient>
      <clipPath id="avatar"><rect x="58" y="52" width="112" height="112" rx="32"/></clipPath>
    </defs>
    <rect width="900" height="570" rx="24" fill="url(#background)"/>
    <rect x="0" y="0" width="10" height="570" rx="5" fill="#6c7cff"/>
    ${avatarSvg}
    <text x="205" y="88" class="title">${displayName}</text>
    <text x="205" y="127" class="subtitle">${username}</text>
    <text x="205" y="164" class="eyebrow">AKTİVLİK STATİSTİKASI</text>

    <rect x="58" y="215" width="378" height="225" rx="20" fill="#202a36"/>
    <circle cx="102" cy="264" r="22" fill="#6c7cff"/>
    <text x="102" y="273" text-anchor="middle" class="icon">✦</text>
    <text x="140" y="272" class="cardTitle">Mesajlar</text>
    <text x="84" y="346" class="bigValue">${messageCount}</text>
    <text x="84" y="378" class="muted">#umumi-sohbet kanalında</text>
    <rect x="84" y="402" width="326" height="10" rx="5" fill="#303d4d"/>
    <rect x="84" y="402" width="${326 * (messageProgress / 100)}" height="10" rx="5" fill="url(#messageGradient)"/>

    <rect x="464" y="215" width="378" height="225" rx="20" fill="#202a36"/>
    <circle cx="508" cy="264" r="22" fill="#24c6dc"/>
    <text x="508" y="273" text-anchor="middle" class="icon">♫</text>
    <text x="546" y="272" class="cardTitle">Səsdə qalma</text>
    <text x="490" y="346" class="bigValue">${escapeXml(voiceTime)}</text>
    <text x="490" y="378" class="muted">səs kanallarında</text>
    <rect x="490" y="402" width="326" height="10" rx="5" fill="#303d4d"/>
    <rect x="490" y="402" width="${326 * (voiceProgress / 100)}" height="10" rx="5" fill="url(#voiceGradient)"/>

    <text x="58" y="515" class="footer">UNEC Gaming Club</text>
    <text x="842" y="515" text-anchor="end" class="footer">Created by Zarzigle</text>
    <style>
      .title { font: 700 38px Arial, sans-serif; fill: #ffffff; }
      .subtitle { font: 23px Arial, sans-serif; fill: #aeb9c8; }
      .eyebrow { font: 700 16px Arial, sans-serif; fill: #8190ff; letter-spacing: 2px; }
      .cardTitle { font: 700 22px Arial, sans-serif; fill: #ffffff; }
      .bigValue { font: 700 42px Arial, sans-serif; fill: #ffffff; }
      .muted { font: 18px Arial, sans-serif; fill: #9aa8b8; }
      .footer { font: 18px Arial, sans-serif; fill: #8795a6; }
      .icon { font: 700 25px Arial, sans-serif; fill: #ffffff; }
      .fallbackIcon { font: 700 22px Arial, sans-serif; fill: #ffffff; }
    </style>
  </svg>`;

  return { files: [{ attachment: await sharp(Buffer.from(svg)).png().toBuffer(), name: 'activity.png' }] };
}

module.exports = {
  category: 'Ümumi',
  name: 'activity',
  description: 'İstifadəçinin mesaj və səs aktivliyini göstərir',
  usage: 'activity [@istifadəçi]',

  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('İstifadəçinin mesaj və səs aktivliyini göstərir')
    .addUserOption((option) => option.setName('istifadeci').setDescription('Baxılacaq istifadəçi').setRequired(false)),

  async execute(message, args) {
    await message.reply(await buildActivityImage(getTarget(message, args)));
  },

  async executeSlash(interaction) {
    const target = interaction.options.getMember('istifadeci') || interaction.member;
    await interaction.reply(await buildActivityImage(target));
  },
};
