const {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const config = require('../config/config');

const universities = [
  { key: 'unec', label: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)' },
  { key: 'bdu', label: 'Bakı Dövlət Universiteti (BDU)' },
  { key: 'adnsu', label: 'Azərbaycan Dövlət Neft və Sənaye Universiteti (ADNSU)' },
  { key: 'aztu', label: 'Azərbaycan Texniki Universiteti (AzTU)' },
  { key: 'adpu', label: 'Azərbaycan Dövlət Pedaqoji Universiteti (ADPU)' },
  { key: 'azmiu', label: 'Azərbaycan Memarlıq və İnşaat Universiteti (AzMİU)' },
  { key: 'bsu', label: 'Bakı Slavyan Universiteti (BSU)' },
  { key: 'adu', label: 'Azərbaycan Dillər Universiteti (ADU)' },
  { key: 'dia', label: 'Prezident yanında Dövlət İdarəçilik Akademiyası (DİA)' },
  { key: 'maa', label: 'Milli Aviasiya Akademiyası (MAA)' },
  { key: 'sdu', label: 'Sumqayıt Dövlət Universiteti (SDU)' },
  { key: 'ldu', label: 'Lənkəran Dövlət Universiteti (LDU)' },
  { key: 'banm', label: 'Bakı Ali Neft Məktəbi (BANM)' },
  { key: 'ufaz', label: 'Azərbaycan-Fransız Universiteti (UFAZ)' },
  { key: 'bmu', label: 'Bakı Mühəndislik Universiteti (BMU)' },
  { key: 'ada', label: 'ADA Universiteti (ADA)' },
  { key: 'khazar', label: 'Xəzər Universiteti (Khazar)' },
  { key: 'oyu', label: 'Odlar Yurdu Universiteti (OYU)' },
];

const ROLE_MENU_PREFIX = 'university_role_';
const GENDER_MENU_PREFIX = 'gender_role_';
const genders = [
  { key: 'girl', label: 'Qız', emoji: '♀️' },
  { key: 'boy', label: 'Oğlan', emoji: '♂️' },
];

function getUniversity(key) {
  return universities.find((university) => university.key === key);
}

function getRoleName(university) {
  const code = university.label.match(/\(([^)]+)\)$/)?.[1] || university.key.toUpperCase();
  return `🎓${code}`;
}

function getGender(key) {
  return genders.find((gender) => gender.key === key);
}

function getGenderRoleName(gender) {
  return `${gender.emoji}${gender.label}`;
}

function getRoleMenuPayload() {
  return {
    embeds: [new EmbedBuilder()
      .setColor(config.COLORS.INFO)
      .setTitle('Rolunu seç')
      .setDescription('Aşağıdakı menyulardan universitetini və cinsiyyətini seç. Hər kateqoriyadan yalnız bir rol saxlaya bilərsən.')
      .setFooter({ text: config.FOOTER_TEXT })],
    components: [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`${ROLE_MENU_PREFIX}0`)
          .setPlaceholder('Universitetini seç')
          .addOptions(universities.map((university) => ({ label: university.label, value: university.key }))),
      ),
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`${GENDER_MENU_PREFIX}0`)
          .setPlaceholder('Cinsiyyətini seç')
          .addOptions(genders.map((gender) => ({
            label: gender.label,
            value: gender.key,
            emoji: gender.emoji,
          }))),
      ),
    ],
  };
}

async function ensureRoleMenuMessage(client) {
  if (!config.ROLE_CHANNEL_ID) return;

  const channel = await client.channels.fetch(config.ROLE_CHANNEL_ID);
  if (!channel || !channel.isTextBased() || !channel.guild) {
    throw new Error('Rol kanalı tapılmadı və ya mətn kanalı deyil.');
  }

  for (const university of universities) {
    const role = channel.guild.roles.cache.find((item) => item.name === getRoleName(university));
    if (!role) {
      await channel.guild.roles.create({ name: getRoleName(university), reason: 'Universitet rol menyusu üçün yaradıldı' });
    }
  }
  for (const gender of genders) {
    const role = channel.guild.roles.cache.find((item) => item.name === getGenderRoleName(gender));
    if (!role) {
      await channel.guild.roles.create({ name: getGenderRoleName(gender), reason: 'Cinsiyyət rol menyusu üçün yaradıldı' });
    }
  }

  const messages = await channel.messages.fetch({ limit: 50 });
  const existingMessage = messages.find((message) => message.author.id === client.user.id
    && message.embeds.some((embed) => embed.title === 'Universitet rolunu seç'));
  const payload = getRoleMenuPayload();

  if (existingMessage) {
    await existingMessage.edit(payload);
  } else {
    await channel.send(payload);
  }

  console.log(`🎓 Rol-al menyusu hazırdır: #${channel.name}`);
}

module.exports = {
  ROLE_MENU_PREFIX,
  GENDER_MENU_PREFIX,
  getUniversity,
  getRoleName,
  getGender,
  getGenderRoleName,
  getRoleMenuPayload,
  ensureRoleMenuMessage,
  universities,
  genders,
};