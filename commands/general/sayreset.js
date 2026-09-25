const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { resetCountingState, purgeCountingChannel } = require('../../events/messageCreate');

function isAdministrator(member) {
  return member?.permissions.has(PermissionsBitField.Flags.Administrator);
}

module.exports = {
  category: 'Ümumi',
  name: 'sayreset',
  aliases: ['say-reset', 'resetcount', 'reset-say'],
  description: 'Sayma kanalını admin üçün sıfırlayır',
  usage: 'sayreset',
  data: new SlashCommandBuilder()
    .setName('sayreset')
    .setDescription('Sayma kanalını sıfırlar'),
  async execute(message) {
    if (!isAdministrator(message.member)) {
      await message.reply('❌ Bu komandanı yalnız administratorlar istifadə edə bilər.');
      return;
    }

    const botMember = message.guild.members.me || await message.guild.members.fetchMe().catch(() => null);
    if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await message.reply('❌ Botun bu kanalda **Manage Messages** icazəsi yoxdur. Bot rolu üzərində bu icazəni açın.');
      return;
    }

    resetCountingState(message.guild.id);
    const cleared = await purgeCountingChannel(message.guild.id);
    await message.reply(
      cleared
        ? '✅ Sayma sıfırlandı və kanalın mesajları silindi. Növbəti mesaj 1 olmalıdır.'
        : '⚠️ Sayma sıfırlandı, amma mesajları silmək üçün botun **Manage Messages** icazəsi lazımdır.'
    );
  },
  async executeSlash(interaction) {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({ content: '❌ Bu komandanı yalnız administratorlar istifadə edə bilər.', ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me || await interaction.guild.members.fetchMe().catch(() => null);
    if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await interaction.reply({ content: '❌ Botun bu kanalda **Manage Messages** icazəsi yoxdur. Bot rolu üzərində bu icazəni açın.', ephemeral: true });
      return;
    }

    resetCountingState(interaction.guild.id);
    const cleared = await purgeCountingChannel(interaction.guild.id);
    await interaction.reply({
      content: cleared
        ? '✅ Sayma sıfırlandı və kanalın mesajları silindi. Növbəti mesaj 1 olmalıdır.'
        : '⚠️ Sayma sıfırlandı, amma mesajları silmək üçün botun **Manage Messages** icazəsi lazımdır.',
      ephemeral: true,
    });
  },
};
