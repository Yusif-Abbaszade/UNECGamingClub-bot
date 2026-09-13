const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const {
  checkPermission, checkBotPermission,
  checkPermissionInteraction, checkBotPermissionInteraction,
} = require('../../utils/permissions');
const { sendCommandLog } = require('../../utils/commandLogger');

module.exports = {
  category: 'Moderasiya',
  name: 'unmute',
  description: 'İstifadəçinin susdurulmasını (timeout) ləğv edir',
  usage: 'unmute @istifadəçi [səbəb]',

  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('İstifadəçinin susdurulmasını ləğv edir')
    .addUserOption((o) => o.setName('istifadeci').setDescription('Susdurması ləğv olunacaq istifadəçi').setRequired(true))
    .addStringOption((o) => o.setName('sebeb').setDescription('Səbəb').setRequired(false)),

  // ============ PREFIX (ugc!unmute) ============
  async execute(message, args) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;
    if (!(await checkBotPermission(message, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [errorEmbed(`İstifadəçini mention et.\nİstifadə: \`${this.usage}\``)] });
    }

    if (!target.isCommunicationDisabled()) {
      return message.reply({ embeds: [errorEmbed('Bu istifadəçi hazırda susdurulmayıb.')] });
    }

    const reason = args.slice(1).join(' ') || 'Səbəb göstərilmədi';

    try {
      await target.timeout(null, `${reason} | Moderator: ${message.author.tag}`);

      await message.reply({ embeds: [successEmbed(`**${target.user.tag}** üzərindən susdurma götürüldü.`)] });

      await sendCommandLog(message.guild, {
        action: 'UNMUTE', color: 'SUCCESS', target: target.user, moderator: message.author, reason,
      });
    } catch (err) {
      console.error(err);
      await message.reply({ embeds: [errorEmbed('Unmute əməliyyatı zamanı xəta baş verdi.')] });
    }
  },

  // ============ SLASH (/unmute) ============
  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;
    if (!(await checkBotPermissionInteraction(interaction, PermissionsBitField.Flags.ModerateMembers, 'Moderate Members'))) return;

    const target = interaction.options.getMember('istifadeci');
    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('İstifadəçi serverdə tapılmadı.')], ephemeral: true });
    }

    if (!target.isCommunicationDisabled()) {
      return interaction.reply({ embeds: [errorEmbed('Bu istifadəçi hazırda susdurulmayıb.')], ephemeral: true });
    }

    const reason = interaction.options.getString('sebeb') || 'Səbəb göstərilmədi';

    try {
      await target.timeout(null, `${reason} | Moderator: ${interaction.user.tag}`);

      await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** üzərindən susdurma götürüldü.`)] });

      await sendCommandLog(interaction.guild, {
        action: 'UNMUTE', color: 'SUCCESS', target: target.user, moderator: interaction.user, reason,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [errorEmbed('Unmute əməliyyatı zamanı xəta baş verdi.')], ephemeral: true });
    }
  },
};
