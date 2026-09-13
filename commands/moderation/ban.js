const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const {
  checkPermission, checkBotPermission, checkRoleHierarchy,
  checkPermissionInteraction, checkBotPermissionInteraction, checkRoleHierarchyInteraction,
} = require('../../utils/permissions');
const { sendCommandLog } = require('../../utils/commandLogger');

module.exports = {
  category: 'Moderasiya',
  name: 'ban',
  description: 'İstifadəçini serverdən banlayır',
  usage: 'ban @istifadəçi [səbəb]',

  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('İstifadəçini serverdən banlayır')
    .addUserOption((o) => o.setName('istifadeci').setDescription('Banlanacaq istifadəçi').setRequired(true))
    .addStringOption((o) => o.setName('sebeb').setDescription('Ban səbəbi').setRequired(false)),

  // ============ PREFIX (ugc!ban) ============
  async execute(message, args) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;
    if (!(await checkBotPermission(message, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [errorEmbed(`İstifadəçini mention et.\nİstifadə: \`${this.usage}\``)] });
    }

    if (!(await checkRoleHierarchy(message, target))) return;

    const reason = args.slice(1).join(' ') || 'Səbəb göstərilmədi';

    try {
      await target.send({
        embeds: [errorEmbed(`**${message.guild.name}** serverindən banlandın.\n**Səbəb:** ${reason}`)],
      }).catch(() => null);

      await target.ban({ reason: `${reason} | Moderator: ${message.author.tag}` });

      await message.reply({
        embeds: [successEmbed(`**${target.user.tag}** serverdən banlandı.\n**Səbəb:** ${reason}`)],
      });

      await sendCommandLog(message.guild, {
        action: 'BAN', color: 'ERROR', target: target.user, moderator: message.author, reason,
      });
    } catch (err) {
      console.error(err);
      await message.reply({ embeds: [errorEmbed('Ban əməliyyatı zamanı xəta baş verdi.')] });
    }
  },

  // ============ SLASH (/ban) ============
  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;
    if (!(await checkBotPermissionInteraction(interaction, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;

    const target = interaction.options.getMember('istifadeci');
    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('İstifadəçi serverdə tapılmadı.')], ephemeral: true });
    }

    if (!(await checkRoleHierarchyInteraction(interaction, target))) return;

    const reason = interaction.options.getString('sebeb') || 'Səbəb göstərilmədi';

    try {
      await target.send({
        embeds: [errorEmbed(`**${interaction.guild.name}** serverindən banlandın.\n**Səbəb:** ${reason}`)],
      }).catch(() => null);

      await target.ban({ reason: `${reason} | Moderator: ${interaction.user.tag}` });

      await interaction.reply({
        embeds: [successEmbed(`**${target.user.tag}** serverdən banlandı.\n**Səbəb:** ${reason}`)],
      });

      await sendCommandLog(interaction.guild, {
        action: 'BAN', color: 'ERROR', target: target.user, moderator: interaction.user, reason,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [errorEmbed('Ban əməliyyatı zamanı xəta baş verdi.')], ephemeral: true });
    }
  },
};
