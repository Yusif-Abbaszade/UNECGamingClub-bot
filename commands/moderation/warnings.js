const { SlashCommandBuilder } = require('discord.js');
const { infoEmbed } = require('../../utils/embeds');
const { getWarns } = require('../../utils/warnStorage');

function buildWarnList(guildId, target) {
  const warns = getWarns(guildId, target.id);
  if (warns.length === 0) return `**${target.user.tag}** istifadəçisinin heç bir xəbərdarlığı yoxdur.`;

  const list = warns
    .map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.moderatorId}> tərəfindən, <t:${Math.floor(w.timestamp / 1000)}:R>`)
    .join('\n');

  return `**${target.user.tag}** — ${warns.length} xəbərdarlıq:\n\n${list}`;
}

module.exports = {
  category: 'Moderasiya',
  name: 'warnings',
  description: 'İstifadəçinin xəbərdarlıq tarixçəsini göstərir',
  usage: 'warnings @istifadəçi',

  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('İstifadəçinin xəbərdarlıq tarixçəsini göstərir')
    .addUserOption((o) => o.setName('istifadeci').setDescription('Baxılacaq istifadəçi').setRequired(false)),

  // ============ PREFIX (ugc!warnings) ============
  async execute(message, args) {
    const target = message.mentions.members.first() || message.member;
    await message.reply({ embeds: [infoEmbed(buildWarnList(message.guild.id, target))] });
  },

  // ============ SLASH (/warnings) ============
  async executeSlash(interaction) {
    const target = interaction.options.getMember('istifadeci') || interaction.member;
    await interaction.reply({ embeds: [infoEmbed(buildWarnList(interaction.guild.id, target))] });
  },
};
