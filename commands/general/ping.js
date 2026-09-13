const { SlashCommandBuilder } = require('discord.js');
const { infoEmbed } = require('../../utils/embeds');

module.exports = {
  category: 'Ümumi',
  name: 'ping',
  description: 'Botun gecikməsini (latency) göstərir',
  usage: 'ping',

  data: new SlashCommandBuilder().setName('ping').setDescription('Botun gecikməsini göstərir'),

  // ============ PREFIX (ugc!ping) ============
  async execute(message, args, client) {
    const sent = await message.reply({ embeds: [infoEmbed('🏓 Hesablanır...')] });
    const latency = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit({
      embeds: [infoEmbed(`🏓 Pong!\n**Bot gecikməsi:** ${latency}ms\n**API gecikməsi:** ${Math.round(client.ws.ping)}ms`)],
    });
  },

  // ============ SLASH (/ping) ============
  async executeSlash(interaction, client) {
    const sent = await interaction.reply({ embeds: [infoEmbed('🏓 Hesablanır...')], fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply({
      embeds: [infoEmbed(`🏓 Pong!\n**Bot gecikməsi:** ${latency}ms\n**API gecikməsi:** ${Math.round(client.ws.ping)}ms`)],
    });
  },
};
