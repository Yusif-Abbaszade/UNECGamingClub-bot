const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { checkPermission, checkPermissionInteraction } = require('../../utils/permissions');
const { sendCommandLog } = require('../../utils/commandLogger');
const { addWarn } = require('../../utils/warnStorage');

module.exports = {
  category: 'Moderasiya',
  name: 'warn',
  description: 'İstifadəçiyə xəbərdarlıq verir (qeydə alınır)',
  usage: 'warn @istifadəçi <səbəb>',

  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('İstifadəçiyə xəbərdarlıq verir')
    .addUserOption((o) => o.setName('istifadeci').setDescription('Xəbərdarlıq veriləcək istifadəçi').setRequired(true))
    .addStringOption((o) => o.setName('sebeb').setDescription('Xəbərdarlıq səbəbi').setRequired(true)),

  // ============ PREFIX (ugc!warn) ============
  async execute(message, args) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [errorEmbed(`İstifadəçini mention et.\nİstifadə: \`${this.usage}\``)] });
    }

    const reason = args.slice(1).join(' ');
    if (!reason) {
      return message.reply({ embeds: [errorEmbed('Xəbərdarlıq üçün səbəb göstərməlisən.')] });
    }

    const warnCount = addWarn(message.guild.id, target.id, reason, message.author.id);

    await target.send({
      embeds: [errorEmbed(`**${message.guild.name}** serverində xəbərdarlıq aldın.\n**Səbəb:** ${reason}\n**Ümumi xəbərdarlıq sayın:** ${warnCount}`)],
    }).catch(() => null);

    await message.reply({ embeds: [successEmbed(`**${target.user.tag}** xəbərdarlıq aldı. (Ümumi: ${warnCount})\n**Səbəb:** ${reason}`)] });

    await sendCommandLog(message.guild, {
      action: 'WARN', color: 'WARN', target: target.user, moderator: message.author, reason,
      extra: `Ümumi xəbərdarlıq sayı: ${warnCount}`,
    });
  },

  // ============ SLASH (/warn) ============
  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getMember('istifadeci');
    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('İstifadəçi serverdə tapılmadı.')], ephemeral: true });
    }

    const reason = interaction.options.getString('sebeb');

    const warnCount = addWarn(interaction.guild.id, target.id, reason, interaction.user.id);

    await target.send({
      embeds: [errorEmbed(`**${interaction.guild.name}** serverində xəbərdarlıq aldın.\n**Səbəb:** ${reason}\n**Ümumi xəbərdarlıq sayın:** ${warnCount}`)],
    }).catch(() => null);

    await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** xəbərdarlıq aldı. (Ümumi: ${warnCount})\n**Səbəb:** ${reason}`)] });

    await sendCommandLog(interaction.guild, {
      action: 'WARN', color: 'WARN', target: target.user, moderator: interaction.user, reason,
      extra: `Ümumi xəbərdarlıq sayı: ${warnCount}`,
    });
  },
};
