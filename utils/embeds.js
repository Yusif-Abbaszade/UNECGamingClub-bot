const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

/**
 * Standart embed yaradır (rəng, footer, timestamp avtomatik əlavə olunur)
 */
function baseEmbed(color) {
  return new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: config.FOOTER_TEXT })
    .setTimestamp();
}

function successEmbed(description) {
  return baseEmbed(config.COLORS.SUCCESS).setDescription(`✅ ${description}`);
}

function errorEmbed(description) {
  return baseEmbed(config.COLORS.ERROR).setDescription(`❌ ${description}`);
}

function infoEmbed(description) {
  return baseEmbed(config.COLORS.INFO).setDescription(description);
}

module.exports = { baseEmbed, successEmbed, errorEmbed, infoEmbed };
