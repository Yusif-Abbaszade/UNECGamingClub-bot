const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const {
  checkPermission, checkBotPermission, checkRoleHierarchy,
  checkPermissionInteraction, checkBotPermissionInteraction, checkRoleHierarchyInteraction,
} = require('../../utils/permissions');
const { sendCommandLog } = require('../../utils/commandLogger');

module.exports = {
  category: 'Moderasiya',
  name: 'kick',
  description: 'İstifadəçini serverdən çıxarır',
  usage: 'kick @istifadəçi [səbəb]',

  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('İstifadəçini serverdən çıxarır')
    .addUserOption((o) => o.setName('istifadeci').setDescription('Çıxarılacaq istifadəçi').setRequired(true))
    .addStringOption((o) => o.setName('sebeb').setDescription('Səbəb').setRequired(false)),

  // ============ PREFIX (ugc!kick) ============
  async execute(message, args) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.KickMembers, 'Kick Members'))) return;
    if (!(await checkBotPermission(message, PermissionsBitField.Flags.KickMembers, 'Kick Members'))) return;

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [errorEmbed(`İstifadəçini mention et.\nİstifadə: \`${this.usage}\``)] });
    }

    if (!(await checkRoleHierarchy(message, target))) return;

    const reason = args.slice(1).join(' ') || 'Səbəb göstərilmədi';

    try {
      await target.send({
        embeds: [errorEmbed(`**${message.guild.name}** serverindən çıxarıldın.\n**Səbəb:** ${reason}`)],
      }).catch(() => null);

      await target.kick(`${reason} | Moderator: ${message.author.tag}`);

      await message.reply({ embeds: [successEmbed(`**${target.user.tag}** serverdən çıxarıldı.\n**Səbəb:** ${reason}`)] });

      await sendCommandLog(message.guild, {
        action: 'KICK', color: 'WARN', target: target.user, moderator: message.author, reason,
      });
    } catch (err) {
      console.error(err);
      await message.reply({ embeds: [errorEmbed('Kick əməliyyatı zamanı xəta baş verdi.')] });
    }
  },

  // ============ SLASH (/kick) ============
  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.KickMembers, 'Kick Members'))) return;
    if (!(await checkBotPermissionInteraction(interaction, PermissionsBitField.Flags.KickMembers, 'Kick Members'))) return;

    const target = interaction.options.getMember('istifadeci');
    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('İstifadəçi serverdə tapılmadı.')], ephemeral: true });
    }

    if (!(await checkRoleHierarchyInteraction(interaction, target))) return;

    const reason = interaction.options.getString('sebeb') || 'Səbəb göstərilmədi';

    try {
      await target.send({
        embeds: [errorEmbed(`**${interaction.guild.name}** serverindən çıxarıldın.\n**Səbəb:** ${reason}`)],
      }).catch(() => null);

      await target.kick(`${reason} | Moderator: ${interaction.user.tag}`);

      await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** serverdən çıxarıldı.\n**Səbəb:** ${reason}`)] });

      await sendCommandLog(interaction.guild, {
        action: 'KICK', color: 'WARN', target: target.user, moderator: interaction.user, reason,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [errorEmbed('Kick əməliyyatı zamanı xəta baş verdi.')], ephemeral: true });
    }
  },
};
