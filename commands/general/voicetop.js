const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { buildLeaderboardImage } = require('../../utils/activityLeaderboard');

function isAdministrator(member) {
  return member?.permissions.has(PermissionsBitField.Flags.Administrator);
}

module.exports = {
  category: 'Ümumi',
  name: 'voicetop',
  description: 'Səsdə ən çox qalan istifadəçilərin top 10 sıralamasını göstərir',
  usage: 'voicetop',
  data: new SlashCommandBuilder().setName('voicetop').setDescription('Səs sıralamasını göstərir'),
  async execute(message) {
    if (!isAdministrator(message.member)) {
      await message.reply('❌ Bu komandanı yalnız administratorlar istifadə edə bilər.');
      return;
    }
    await message.reply(await buildLeaderboardImage(message.guild, 'voice'));
  },
  async executeSlash(interaction) {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({ content: '❌ Bu komandanı yalnız administratorlar istifadə edə bilər.', ephemeral: true });
      return;
    }
    await interaction.reply(await buildLeaderboardImage(interaction.guild, 'voice'));
  },
};