const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const {
  checkPermission, checkBotPermission,
  checkPermissionInteraction, checkBotPermissionInteraction,
} = require('../../utils/permissions');
const { sendCommandLog } = require('../../utils/commandLogger');

module.exports = {
  category: 'Moderasiya',
  name: 'clear',
  aliases: ['purge'],
  description: 'Kanalda son mesajları silir (max 100)',
  usage: 'clear <say>',

  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Kanalda son mesajları silir (max 100)')
    .addIntegerOption((o) => o.setName('say').setDescription('Silinəcək mesaj sayı (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),

  // ============ PREFIX (ugc!clear) ============
  async execute(message, args) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.ManageMessages, 'Manage Messages'))) return;
    if (!(await checkBotPermission(message, PermissionsBitField.Flags.ManageMessages, 'Manage Messages'))) return;

    const amount = parseInt(args[0], 10);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply({ embeds: [errorEmbed(`1-100 arası ədəd göstər.\nİstifadə: \`${this.usage}\``)] });
    }

    try {
      const deleted = await message.channel.bulkDelete(amount + 1, true);

      const confirmMsg = await message.channel.send({ embeds: [successEmbed(`${deleted.size - 1} mesaj silindi.`)] });
      setTimeout(() => confirmMsg.delete().catch(() => null), 4000);

      await sendCommandLog(message.guild, {
        action: 'CLEAR', color: 'INFO', target: null, moderator: message.author,
        reason: `${deleted.size - 1} mesaj silindi (#${message.channel.name})`,
      });
    } catch (err) {
      console.error(err);
      await message.reply({ embeds: [errorEmbed('Mesajları silmək mümkün olmadı (14 gündən köhnə mesajlar bulk-delete ilə silinə bilməz).')] });
    }
  },

  // ============ SLASH (/clear) ============
  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.ManageMessages, 'Manage Messages'))) return;
    if (!(await checkBotPermissionInteraction(interaction, PermissionsBitField.Flags.ManageMessages, 'Manage Messages'))) return;

    const amount = interaction.options.getInteger('say');

    try {
      await interaction.deferReply({ ephemeral: true });
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply({ embeds: [successEmbed(`${deleted.size} mesaj silindi.`)] });

      await sendCommandLog(interaction.guild, {
        action: 'CLEAR', color: 'INFO', target: null, moderator: interaction.user,
        reason: `${deleted.size} mesaj silindi (#${interaction.channel.name})`,
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('Mesajları silmək mümkün olmadı (14 gündən köhnə mesajlar bulk-delete ilə silinə bilməz).')] });
    }
  },
};
