const { EmbedBuilder, ChannelType, SlashCommandBuilder } = require('discord.js');
const config = require('../../config/config');

function buildServerEmbed(guild) {
  const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;

  return new EmbedBuilder()
    .setColor(config.COLORS.INFO)
    .setTitle(`🖥️ ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .addFields(
      { name: 'Sahib', value: `<@${guild.ownerId}>`, inline: true },
      { name: 'Üzv sayı', value: `${guild.memberCount}`, inline: true },
      { name: 'Rol sayı', value: `${guild.roles.cache.size}`, inline: true },
      { name: 'Mətn kanalları', value: `${textChannels}`, inline: true },
      { name: 'Səs kanalları', value: `${voiceChannels}`, inline: true },
      { name: 'Yaradılıb', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
    )
    .setFooter({ text: config.FOOTER_TEXT })
    .setTimestamp();
}

module.exports = {
  category: 'Ümumi',
  name: 'serverinfo',
  description: 'Server haqqında məlumat göstərir',
  usage: 'serverinfo',

  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Server haqqında məlumat göstərir'),

  // ============ PREFIX (ugc!serverinfo) ============
  async execute(message) {
    await message.reply({ embeds: [buildServerEmbed(message.guild)] });
  },

  // ============ SLASH (/serverinfo) ============
  async executeSlash(interaction) {
    await interaction.reply({ embeds: [buildServerEmbed(interaction.guild)] });
  },
};
