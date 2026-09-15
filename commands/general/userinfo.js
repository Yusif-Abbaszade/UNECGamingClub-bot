const { SlashCommandBuilder } = require('discord.js');
const sharp = require('sharp');

function escapeXml(value) {
  return String(value).replace(/[&<>']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&apos;',
  }[character]));
}

function formatDate(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleDateString('az-AZ') : 'Məlum deyil';
}

function wrapRoleNames(roleNames, maxCharacters = 42) {
  const lines = [];
  let line = '';

  for (const roleName of roleNames) {
    const role = `@${roleName}`;
    if ((line + (line ? ', ' : '') + role).length > maxCharacters && line) {
      lines.push(line);
      line = role;
    } else {
      line += `${line ? ', ' : ''}${role}`;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : ['Yoxdur'];
}

async function getAvatarDataUri(target) {
  try {
    const response = await fetch(target.user.displayAvatarURL({ extension: 'png', size: 256 }));
    if (!response.ok) return null;
    const avatar = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:image/png;base64,${avatar}`;
  } catch (err) {
    console.warn('[İstifadəçi avatarı yüklənmədi]', err.message);
    return null;
  }
}

async function buildUserImage(target) {
  const roleNames = target.roles.cache
    .filter((role) => role.id !== target.guild.id)
    .sort((first, second) => second.position - first.position)
    .map((role) => role.name);
  const roleLines = wrapRoleNames(roleNames);
  const displayName = escapeXml(target.user.globalName || target.user.username);
  const nickname = escapeXml(target.displayName || target.user.username);
  const username = escapeXml(`@${target.user.username}`);
  const avatarDataUri = await getAvatarDataUri(target);
  const rolesHeight = 78 + (roleLines.length * 32);
  const height = 595 + rolesHeight;
  const avatarSvg = avatarDataUri
    ? `<image href="${avatarDataUri}" x="52" y="46" width="112" height="112" clip-path="url(#avatar)" preserveAspectRatio="xMidYMid slice"/>`
    : '<circle cx="108" cy="102" r="56" fill="#5865f2"/><text x="108" y="114" text-anchor="middle" class="fallbackIcon">UGC</text>';
  const roleSvg = roleLines.map((line, index) => (
    `<text x="76" y="${615 + (index * 32)}" class="roleValue">${escapeXml(line)}</text>`
  )).join('');
  const stats = [
    ['İstifadəçi ID', target.id],
    ['Ləqəb (Nickname)', nickname],
    ['Bot?', target.user.bot ? 'Bəli' : 'Xeyr'],
    ['Hesab yaradılıb', formatDate(target.user.createdTimestamp)],
    ['Serverə qoşulub', formatDate(target.joinedTimestamp)],
  ];
  const statSvg = stats.map(([label, value], index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 52 + (column * 280);
    const y = 205 + (row * 112);
    return `<rect x="${x}" y="${y}" width="250" height="84" rx="14" fill="#293039"/>
      <text x="${x + 18}" y="${y + 30}" class="label">${escapeXml(label)}</text>
      <text x="${x + 18}" y="${y + 63}" class="value">${escapeXml(value)}</text>`;
  }).join('');

  const svg = `<svg width="900" height="${height}" viewBox="0 0 900 ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#151a20"/>
        <stop offset="1" stop-color="#242d36"/>
      </linearGradient>
      <clipPath id="avatar"><rect x="52" y="46" width="112" height="112" rx="32"/></clipPath>
    </defs>
    <rect width="900" height="${height}" rx="24" fill="url(#background)"/>
    <rect x="0" y="0" width="10" height="${height}" rx="5" fill="#5865f2"/>
    ${avatarSvg}
    <text x="198" y="82" class="title">${displayName}</text>
    <text x="198" y="120" class="subtitle">${username}</text>
    ${statSvg}
    <rect x="52" y="540" width="796" height="${rolesHeight}" rx="16" fill="#293039"/>
    <text x="76" y="580" class="roleTitle">Rollar (${roleNames.length})</text>
    ${roleSvg}
    <text x="52" y="${height - 28}" class="footer">Created by Zarzigle  •  User Info</text>
    <style>
      .title { font: 700 36px Arial, sans-serif; fill: #ffffff; }
      .subtitle { font: 22px Arial, sans-serif; fill: #aeb7c2; }
      .label { font: 19px Arial, sans-serif; fill: #aeb7c2; }
      .value { font: 700 22px Arial, sans-serif; fill: #ffffff; }
      .roleTitle { font: 700 22px Arial, sans-serif; fill: #ffffff; }
      .roleValue { font: 18px Arial, sans-serif; fill: #c8d4ff; }
      .footer { font: 18px Arial, sans-serif; fill: #87919d; }
      .fallbackIcon { font: 700 22px Arial, sans-serif; fill: #ffffff; }
    </style>
  </svg>`;

  return { files: [{ attachment: await sharp(Buffer.from(svg)).png().toBuffer(), name: 'userinfo.png' }] };
}

module.exports = {
  category: 'Ümumi',
  name: 'userinfo',
  description: 'İstifadəçi haqqında məlumat göstərir',
  usage: 'userinfo [@istifadəçi]',

  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('İstifadəçi haqqında məlumat göstərir')
    .addUserOption((option) => option.setName('istifadeci').setDescription('Baxılacaq istifadəçi').setRequired(false)),

  async execute(message) {
    const target = message.mentions.members.first() || message.member;
    await message.reply(await buildUserImage(target));
  },

  async executeSlash(interaction) {
    const target = interaction.options.getMember('istifadeci') || interaction.member;
    await interaction.reply(await buildUserImage(target));
  },
};
