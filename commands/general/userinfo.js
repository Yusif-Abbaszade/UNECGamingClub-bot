const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../config/config');

function buildUserEmbed(target) {
  const roles = target.roles.cache
    .filter((r) => r.id !== target.guild.id)
    .map((r) => `<@&${r.id}>`)
    .join(', ') || 'Yoxdur';

  return new EmbedBuilder()
    .setColor(config.COLORS.INFO)
    .setTitle(`👤 ${target.user.tag}`)
    .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'İstifadəçi ID', value: target.id, inline: true },
      { name: 'Ləqəb (Nickname)', value: target.displayName, inline: true },
      { name: 'Bot?', value: target.user.bot ? 'Bəli' : 'Xeyr', inline: true },
      { name: 'Hesab yaradılıb', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Serverə qoşulub', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: `Rollar (${target.roles.cache.size - 1})`, value: roles },
    )
    .setFooter({ text: config.FOOTER_TEXT })
    .setTimestamp();
}

module.exports = {
  category: 'Ümumi',
  name: 'userinfo',
  description: 'İstifadəçi haqqında məlumat göstərir',
  usage: 'userinfo [@istifadəçi]',

  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('İstifadəçi haqqında məlumat göstərir')
    .addUserOption((o) => o.setName('istifadeci').setDescription('Baxılacaq istifadəçi').setRequired(false)),

  // ============ PREFIX (ugc!userinfo) ============
  async execute(message, args) {
    const target = message.mentions.members.first() || message.member;
    await message.reply({ embeds: [buildUserEmbed(target)] });
  },

  // ============ SLASH (/userinfo) ============
  async executeSlash(interaction) {
    const target = interaction.options.getMember('istifadeci') || interaction.member;
    await interaction.reply({ embeds: [buildUserEmbed(target)] });
  },
};
