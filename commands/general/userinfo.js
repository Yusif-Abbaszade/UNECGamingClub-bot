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

function buildRoleRows(roleNames) {
  const rows = [[]];

  for (const roleName of roleNames.length ? roleNames : ['Yoxdur']) {
    const label = `@${roleName}`;
    const width = Math.min(244, Math.max(112, (label.length * 9) + 34));
    const currentRow = rows[rows.length - 1];
    const currentWidth = currentRow.reduce((sum, role) => sum + role.width + 10, 0);

    if (currentRow.length && currentWidth + width > 756) {
      rows.push([]);
    }
    rows[rows.length - 1].push({ label, width });
  }

  return rows;
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
  const roleRows = buildRoleRows(roleNames);
  const displayName = escapeXml(target.user.globalName || target.user.username);
  const nickname = escapeXml(target.displayName || target.user.username);
  const username = escapeXml(`@${target.user.username}`);
  const avatarDataUri = await getAvatarDataUri(target);
  const rolesHeight = 88 + (roleRows.length * 52);
  const height = 435 + rolesHeight + 70;
  const avatarSvg = avatarDataUri
    ? `<image href="${avatarDataUri}" x="52" y="46" width="112" height="112" clip-path="url(#avatar)" preserveAspectRatio="xMidYMid slice"/>`
    : '<circle cx="108" cy="102" r="56" fill="#5865f2"/><text x="108" y="114" text-anchor="middle" class="fallbackIcon">UGC</text>';
  const roleSvg = roleRows.map((row, rowIndex) => {
    let x = 76;
    const y = 520 + (rowIndex * 52);
    return row.map((role) => {
      const chip = `<rect x="${x}" y="${y - 28}" width="${role.width}" height="38" rx="12" fill="#39465f"/>
        <text x="${x + 14}" y="${y - 3}" class="roleValue">${escapeXml(role.label)}</text>`;
      x += role.width + 10;
      return chip;
    }).join('');
  }).join('');
  const stats = [
    ['İstifadəçi ID', target.id],
    ['Ləqəb (Nickname)', nickname],
    ['Bot?', target.user.bot ? 'Bəli' : 'Xeyr'],
    ['Hesab yaradılıb', formatDate(target.user.createdTimestamp)],
    ['Serverə qoşulub', formatDate(target.joinedTimestamp)],
  ];
  const statSvg = stats.map(([label, value], index) => {
    const layouts = [
      { x: 52, y: 205, width: 530 },
      { x: 602, y: 205, width: 246 },
      { x: 52, y: 317, width: 250 },
      { x: 322, y: 317, width: 250 },
      { x: 592, y: 317, width: 256 },
    ];
    const { x, y, width } = layouts[index];
    return `<rect x="${x}" y="${y}" width="${width}" height="84" rx="14" fill="#293039"/>
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
    <rect x="52" y="435" width="796" height="${rolesHeight}" rx="16" fill="#293039"/>
    <text x="76" y="475" class="roleTitle">Rollar (${roleNames.length})</text>
    ${roleSvg}
    <text x="52" y="${height - 28}" class="footer">UNEC Gaming Club</text>
    <text x="848" y="${height - 28}" text-anchor="end" class="footer">Created by Zarzigle</text>
    <style>
      .title { font: 700 36px Arial, sans-serif; fill: #ffffff; }
      .subtitle { font: 22px Arial, sans-serif; fill: #aeb7c2; }
      .label { font: 19px Arial, sans-serif; fill: #aeb7c2; }
      .value { font: 700 22px Arial, sans-serif; fill: #ffffff; }
      .roleTitle { font: 700 22px Arial, sans-serif; fill: #ffffff; }
      .roleValue { font: 16px Arial, sans-serif; fill: #d6e0ff; }
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
