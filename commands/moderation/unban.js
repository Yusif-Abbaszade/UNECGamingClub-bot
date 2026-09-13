const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const {
  checkPermission, checkBotPermission,
  checkPermissionInteraction, checkBotPermissionInteraction,
} = require('../../utils/permissions');
const { sendCommandLog } = require('../../utils/commandLogger');

module.exports = {
  category: 'Moderasiya',
  name: 'unban',
  description: 'İstifadəçinin banını götürür (User ID ilə)',
  usage: 'unban <istifadəçi ID> [səbəb]',

  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('İstifadəçinin banını götürür')
    .addStringOption((o) => o.setName('istifadeci_id').setDescription('Banı götürüləcək istifadəçinin ID-si').setRequired(true))
    .addStringOption((o) => o.setName('sebeb').setDescription('Səbəb').setRequired(false)),

  // ============ PREFIX (ugc!unban) ============
  async execute(message, args) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;
    if (!(await checkBotPermission(message, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;

    const userId = args[0];
    if (!userId || !/^\d{15,20}$/.test(userId)) {
      return message.reply({ embeds: [errorEmbed(`Düzgün İstifadəçi ID daxil et.\nİstifadə: \`${this.usage}\``)] });
    }

    const reason = args.slice(1).join(' ') || 'Səbəb göstərilmədi';

    try {
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.get(userId);

      if (!bannedUser) {
        return message.reply({ embeds: [errorEmbed('Bu ID ilə banlanmış istifadəçi tapılmadı.')] });
      }

      await message.guild.members.unban(userId, `${reason} | Moderator: ${message.author.tag}`);

      await message.reply({
        embeds: [successEmbed(`**${bannedUser.user.tag}** istifadəçisinin banı götürüldü.\n**Səbəb:** ${reason}`)],
      });

      await sendCommandLog(message.guild, {
        action: 'UNBAN', color: 'SUCCESS', target: bannedUser.user, moderator: message.author, reason,
      });
    } catch (err) {
      console.error(err);
      await message.reply({ embeds: [errorEmbed('Unban əməliyyatı zamanı xəta baş verdi.')] });
    }
  },

  // ============ SLASH (/unban) ============
  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;
    if (!(await checkBotPermissionInteraction(interaction, PermissionsBitField.Flags.BanMembers, 'Ban Members'))) return;

    const userId = interaction.options.getString('istifadeci_id');
    if (!/^\d{15,20}$/.test(userId)) {
      return interaction.reply({ embeds: [errorEmbed('Düzgün İstifadəçi ID daxil et.')], ephemeral: true });
    }

    const reason = interaction.options.getString('sebeb') || 'Səbəb göstərilmədi';

    try {
      const bans = await interaction.guild.bans.fetch();
      const bannedUser = bans.get(userId);

      if (!bannedUser) {
        return interaction.reply({ embeds: [errorEmbed('Bu ID ilə banlanmış istifadəçi tapılmadı.')], ephemeral: true });
      }

      await interaction.guild.members.unban(userId, `${reason} | Moderator: ${interaction.user.tag}`);

      await interaction.reply({
        embeds: [successEmbed(`**${bannedUser.user.tag}** istifadəçisinin banı götürüldü.\n**Səbəb:** ${reason}`)],
      });

      await sendCommandLog(interaction.guild, {
        action: 'UNBAN', color: 'SUCCESS', target: bannedUser.user, moderator: interaction.user, reason,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ embeds: [errorEmbed('Unban əməliyyatı zamanı xəta baş verdi.')], ephemeral: true });
    }
  },
};
