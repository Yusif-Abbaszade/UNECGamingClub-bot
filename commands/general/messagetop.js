const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { buildLeaderboardImage } = require('../../utils/activityLeaderboard');

function isAdministrator(member) {
  return member?.permissions.has(PermissionsBitField.Flags.Administrator);
}

module.exports = {
  category: 'Ümumi',
  name: 'messagetop',
  description: 'Mesaj yazan istifadəçilərin top 10 sıralamasını göstərir',
  usage: 'messagetop',
  data: new SlashCommandBuilder().setName('messagetop').setDescription('Mesaj sıralamasını göstərir'),
  async execute(message) {
    if (!isAdministrator(message.member)) {
      await message.reply('❌ Bu komandanı yalnız administratorlar istifadə edə bilər.');
      return;
    }
    await message.reply(await buildLeaderboardImage(message.guild, 'message'));
  },
  async executeSlash(interaction) {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({ content: '❌ Bu komandanı yalnız administratorlar istifadə edə bilər.', ephemeral: true });
      return;
    }
    await interaction.reply(await buildLeaderboardImage(interaction.guild, 'message'));
  },
};