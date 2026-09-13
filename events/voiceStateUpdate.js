const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function buildVoiceEmbed({ title, color, member, channel }) {
  return new EmbedBuilder()
    .setColor(config.COLORS[color])
    .setTitle(title)
    .addFields(
      { name: 'Kanal', value: `${channel}`, inline: false },
      { name: 'İstifadəçi', value: `${member}`, inline: true },
      { name: 'Nickname', value: member.displayName, inline: true },
      { name: 'İstifadəçi ID', value: `\`${member.id}\``, inline: false },
      { name: 'Kateqoriya', value: channel.parent ? channel.parent.name.toUpperCase() : 'Yoxdur', inline: false },
    )
    .setFooter({ text: config.FOOTER_TEXT })
    .setTimestamp();
}

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState) {
    const logChannel = newState.guild.channels.cache.get(config.LOG_CHANNELS.VOICE);
    if (!logChannel) return; // config-də ID düzgün deyilsə səssiz keç

    const member = newState.member;

    // Kanala daxil olma (heç bir kanalda deyildi → kanala girdi)
    if (!oldState.channel && newState.channel) {
      const embed = buildVoiceEmbed({
        title: '➡️ SƏS KANALINA GİRİŞ EDİLDİ',
        color: 'JOIN',
        member,
        channel: newState.channel,
      });
      return logChannel.send({ embeds: [embed] });
    }

    // Kanaldan çıxma (kanalda idi → heç bir kanalda deyil)
    if (oldState.channel && !newState.channel) {
      const embed = buildVoiceEmbed({
        title: '⬅️ SƏS KANALINDAN ÇIXIŞ EDİLDİ',
        color: 'LEAVE',
        member,
        channel: oldState.channel,
      });
      return logChannel.send({ embeds: [embed] });
    }

    // Bir kanaldan başqa kanala keçmə
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.INFO)
        .setTitle('🔄 SƏS KANALI DƏYİŞDİRİLDİ')
        .addFields(
          { name: 'Köhnə kanal', value: `${oldState.channel}`, inline: true },
          { name: 'Yeni kanal', value: `${newState.channel}`, inline: true },
          { name: 'İstifadəçi', value: `${member}`, inline: false },
          { name: 'İstifadəçi ID', value: `\`${member.id}\``, inline: false },
        )
        .setFooter({ text: config.FOOTER_TEXT })
        .setTimestamp();
      return logChannel.send({ embeds: [embed] });
    }
  },
};
