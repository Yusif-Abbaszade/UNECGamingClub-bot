const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../config/config');

const channelCommands = [
  ['limit', 'Müvəqqəti kanalındakı istifadəçi limitini dəyişir.'],
  ['name', 'Müvəqqəti kanalının adını dəyişir.'],
  ['bitrate', 'Müvəqqəti kanalının bitrate dəyərini dəyişir.'],
  ['claim', 'Müvəqqəti kanalı sahibsizdirsə, sahibliyini əldə edir.'],
  ['delete', 'Müvəqqəti kanalını silir.'],
  ['info', 'Müvəqqəti kanal haqqında məlumat göstərir.'],
  ['invite', 'Bu söhbətdə müvəqqəti kanalına dəvət linki göndərir.'],
  ['password', 'Müvəqqəti kanalın üçün parol təyin edir.'],
  ['privacy', 'Müvəqqəti kanalını kilidləyir və ya gizlədir.'],
  ['region', 'Müvəqqəti kanalının regionunu dəyişir.'],
  ['reset', 'Müvəqqəti kanalının konfiqurasiyasını sıfırlayır.'],
  ['status', 'Müvəqqəti kanalının statusunu dəyişir.'],
  ['thread', 'Müvəqqəti kanalın üçün müvəqqəti thread yaradır.'],
  ['transfer', 'Müvəqqəti kanalının sahibliyini başqa istifadəçiyə ötürür.'],
];

const userCommands = [
  ['user block', 'İstifadəçilərin müvəqqəti kanalına girişini bloklayır.'],
  ['user invite', 'Bir istifadəçini müvəqqəti kanalına dəvət edir.'],
  ['user kick', 'İstifadəçini müvəqqəti kanalından çıxarır.'],
  ['user trust', 'İstifadəçilərə müvəqqəti kanalına daimi giriş verir.'],
  ['user unblock', 'İstifadəçinin müvəqqəti kanalına giriş blokunu götürür.'],
  ['user untrust', 'Etibarlı istifadəçinin daimi girişini ləğv edir.'],
];

function formatCommands(commands) {
  const lines = commands.map(([name, description]) => `**/voice ${name}** — ${description}`);
  const chunks = [];
  let currentChunk = '';

  for (const line of lines) {
    if ((currentChunk + line).length > 1000) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += `${currentChunk ? '\n' : ''}${line}`;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

function buildTempVoiceEmbed() {
  return new EmbedBuilder()
    .setColor(config.COLORS.INFO)
    .setTitle('🔊 TempVoice — Özəl otaq əmrləri')
    .setDescription(
      `Müvəqqəti səs kanalını idarə etmək üçün TempVoice əmrləri.\n\n` +
      `Nümunə: \`/voice params\``
    )
    .addFields([
      ...formatCommands(channelCommands).map((value, index, chunks) => ({
        name: `Kanal idarəsi${chunks.length > 1 ? ` (${index + 1}/${chunks.length})` : ''}`,
        value,
      })),
      ...formatCommands(userCommands).map((value, index, chunks) => ({
        name: `İstifadəçi idarəsi${chunks.length > 1 ? ` (${index + 1}/${chunks.length})` : ''}`,
        value,
      })),
    ])
    .setFooter({ text: config.FOOTER_TEXT })
    .setTimestamp();
}

module.exports = {
  category: 'Ümumi',
  name: 'ozelotaq',
  description: 'TempVoice özəl otaq əmrlərini detallı şəkildə göstərir',
  usage: 'ozelotaq',

  data: new SlashCommandBuilder()
    .setName('ozelotaq')
    .setDescription('TempVoice özəl otaq əmrlərini detallı şəkildə göstərir'),

  async execute(message) {
    await message.reply({ embeds: [buildTempVoiceEmbed()] });
  },

  async executeSlash(interaction) {
    await interaction.reply({ embeds: [buildTempVoiceEmbed()] });
  },
};
