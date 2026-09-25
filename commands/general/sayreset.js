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

    resetCountingState(message.guild.id);
    await purgeCountingChannel(message.guild.id);
    await message.reply('✅ Sayma sıfırlandı və kanalın mesajları silindi. Növbəti mesaj 1 olmalıdır.');
  },
  async executeSlash(interaction) {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({ content: '❌ Bu komandanı yalnız administratorlar istifadə edə bilər.', ephemeral: true });
      return;
    }

    resetCountingState(interaction.guild.id);
    await purgeCountingChannel(interaction.guild.id);
    await interaction.reply({ content: '✅ Sayma sıfırlandı və kanalın mesajları silindi. Növbəti mesaj 1 olmalıdır.', ephemeral: true });
  },
};
