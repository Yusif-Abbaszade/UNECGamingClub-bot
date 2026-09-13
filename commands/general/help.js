const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../config/config');

function buildCommandDetailEmbed(cmd) {
  return new EmbedBuilder()
    .setColor(config.COLORS.INFO)
    .setTitle(`Əmr: ${cmd.name}`)
    .setDescription(cmd.description || 'Təsvir yoxdur')
    .addFields(
      { name: 'Prefix istifadə', value: `\`${config.PREFIX}${cmd.usage}\`` },
      { name: 'Slash istifadə', value: cmd.data ? `\`/${cmd.name}\`` : 'Mövcud deyil' },
    )
    .setFooter({ text: config.FOOTER_TEXT });
}

function buildOverviewEmbed(client) {
  const categories = {};
  client.commands.forEach((cmd) => {
    const cat = cmd.category || 'Digər';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(cmd);
  });

  const embed = new EmbedBuilder()
    .setColor(config.COLORS.INFO)
    .setTitle('📖 UNEC Gaming Club Bot — Əmrlər')
    .setDescription(
      `Prefix əmrlər: \`${config.PREFIX}əmr\`\nSlash əmrlər: \`/əmr\`\nƏtraflı məlumat üçün: \`${config.PREFIX}help <əmr>\``
    )
    .setFooter({ text: config.FOOTER_TEXT })
    .setTimestamp();

  for (const [category, cmds] of Object.entries(categories)) {
    const list = cmds.map((c) => `\`${config.PREFIX}${c.name}\` / \`/${c.name}\` — ${c.description}`).join('\n');
    embed.addFields({ name: category, value: list });
  }

  return embed;
}

module.exports = {
  category: 'Ümumi',
  name: 'help',
  description: 'Botun bütün əmrlərini göstərir',
  usage: 'help [əmr adı]',

  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Botun bütün əmrlərini göstərir')
    .addStringOption((o) => o.setName('emr').setDescription('Ətraflı baxılacaq əmrin adı').setRequired(false)),

  // ============ PREFIX (ugc!help) ============
  async execute(message, args, client) {
    if (args[0]) {
      const cmd = client.commands.get(args[0].toLowerCase());
      if (!cmd) {
        return message.reply(`\`${args[0]}\` adlı əmr tapılmadı. Bütün əmrlər üçün \`${config.PREFIX}help\` yaz.`);
      }
      return message.reply({ embeds: [buildCommandDetailEmbed(cmd)] });
    }
    await message.reply({ embeds: [buildOverviewEmbed(client)] });
  },

  // ============ SLASH (/help) ============
  async executeSlash(interaction, client) {
    const cmdName = interaction.options.getString('emr');
    if (cmdName) {
      const cmd = client.commands.get(cmdName.toLowerCase());
      if (!cmd) {
        return interaction.reply({ content: `\`${cmdName}\` adlı əmr tapılmadı.`, ephemeral: true });
      }
      return interaction.reply({ embeds: [buildCommandDetailEmbed(cmd)] });
    }
    await interaction.reply({ embeds: [buildOverviewEmbed(client)] });
  },
};
