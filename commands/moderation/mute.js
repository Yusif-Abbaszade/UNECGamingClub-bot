const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const {
  checkPermission, checkBotPermission, checkRoleHierarchy,
  checkPermissionInteraction, checkBotPermissionInteraction, checkRoleHierarchyInteraction,
} = require('../../utils/permissions');
const { sendCommandLog } = require('../../utils/commandLogger');
const config = require('../../config/config');

// "10m", "1h", "30s", "2d" kimi vaxt formatını millisaniyəyə çevirir
function parseDuration(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return num * multipliers[unit];
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} dəqiqə`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat`;
  const days = Math.floor(hours / 24);
  return `${days} gün`;
}

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000; // Discord timeout limiti

module.exports = {
  category: 'Moderasiya',
  name: 'mute',
  description: 'İstifadəçini müəyyən müddətə susdurur (timeout)',
  usage: 'mute @istifadəçi [10m/1h/2d] [səbəb]',

  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('İstifadəçini müəyyən müddətə susdurur')
    .addUserOption((o) => o.setName('istifadeci').setDescription('Susdurulacaq istifadəçi').setRequired(true))
    .addStringOption((o) => o.setName('muddet').setDescription('Məsələn: 10m, 1h, 2d (default: 10m)').setRequired(false))
    .addStringOption((o) => o.setName('sebeb').setDescription('Səbəb').setRequired(false)),

  // ============ PREFIX (ugc!mute) ============
  async execute(message, args) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;
    if (!(await checkBotPermission(message, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [errorEmbed(`İstifadəçini mention et.\nİstifadə: \`${this.usage}\``)] });
    }

    if (!(await checkRoleHierarchy(message, target))) return;

    let durationMs = parseDuration(args[1]);
    let reasonStartIndex = 2;
    if (durationMs === null) {
      durationMs = config.DEFAULT_MUTE_MS;
      reasonStartIndex = 1;
    }

    if (durationMs > MAX_TIMEOUT) {
      return message.reply({ embeds: [errorEmbed('Maksimum mute müddəti 28 gündür.')] });
    }

    const reason = args.slice(reasonStartIndex).join(' ') || 'Səbəb göstərilmədi';

    try {
      await target.timeout(durationMs, `${reason} | Moderator: ${message.author.tag}`);
      const durationText = formatDuration(durationMs);

      await message.reply({
        embeds: [successEmbed(`**${target.user.tag}** susduruldu.\n**Müddət:** ${durationText}\n**Səbəb:** ${reason}`)],
      });

      await sendCommandLog(message.guild, {
        action: 'MUTE', color: 'WARN', target: target.user, moderator: message.author, reason,
        extra: `Müddət: ${durationText}`,
      });
    } catch (err) {
      console.error(err);
      await message.reply({ embeds: [errorEmbed('Mute əməliyyatı zamanı xəta baş verdi.')] });
    }
  },

  // ============ SLASH (/mute) ============
  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;
    if (!(await checkBotPermissionInteraction(interaction, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getMember('istifadeci');
    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('İstifadəçi serverdə tapılmadı.')], ephemeral: true });
    }

    if (!(await checkRoleHierarchyInteraction(interaction, target))) return;

    const durationInput = interaction.options.getString('muddet');
    let durationMs = parseDuration(durationInput);
    if (durationMs === null) durationMs = config.DEFAULT_MUTE_MS;

    if (durationMs > MAX_TIMEOUT) {
      return interaction.reply({ embeds: [errorEmbed('Maksimum mute müddəti 28 gündür.')], ephemeral: true });
    }

    const reason = interaction.options.getString('sebeb') || 'Səbəb göstərilmədi';

    try {
      await target.timeout(durationMs, `${reason} | Moderator: ${interaction.user.tag}`);
      const durationText = formatDuration(durationMs);

      await interaction.reply({
        embeds: [successEmbed(`**${target.user.tag}** susduruldu.\n**Müddət:** ${durationText}\n**Səbəb:** ${reason}`)],
      });

      await sendCommandLog(interaction.guild, {
        action: 'MUTE', color: 'WARN', target: target.user, moderator: interaction.user, reason,
        extra: `Müddət: ${durationText}`,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [errorEmbed('Mute əməliyyatı zamanı xəta baş verdi.')], ephemeral: true });
    }
  },
};
