const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

/**
 * Moderasiya əmrinin icrasını #komanda-log kanalına göndərir.
 * @param {Guild} guild - Discord guild (server) obyekti
 * @param {Object} data - { action, color, target, moderator, reason, extra }
 */
async function sendCommandLog(guild, data) {
  const logChannel = guild.channels.cache.get(config.LOG_CHANNELS.COMMAND);
  if (!logChannel) {
    console.warn(`[commandLogger] #komanda-log kanalı tapılmadı. config.js-də LOG_CHANNELS.COMMAND ID-sini yoxla.`);
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(config.COLORS[data.color] || config.COLORS.INFO)
    .setTitle(`🛡️ ${data.action}`)
    .addFields(
      { name: 'Moderator', value: `${data.moderator.tag} (${data.moderator.id})` },
    )
    .setFooter({ text: config.FOOTER_TEXT })
    .setTimestamp();

  if (data.target) {
    embed.addFields({ name: 'Hədəf', value: `${data.target.tag} (${data.target.id})` });
  }
  if (data.reason) {
    embed.addFields({ name: 'Səbəb', value: data.reason });
  }
  if (data.extra) {
    embed.addFields({ name: 'Əlavə', value: data.extra });
  }

  await logChannel.send({ embeds: [embed] }).catch((err) => {
    console.error('[commandLogger] Log göndərilə bilmədi:', err.message);
  });
}

module.exports = { sendCommandLog };
