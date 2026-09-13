const config = require('../config/config');
const { errorEmbed } = require('../utils/embeds');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return; // DM-lərdə əmr işləməsin
    if (!message.content.startsWith(config.PREFIX)) return;

    const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Əmri adı ilə, ya da alias (qısa ad) ilə tap
    const command =
      client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return; // bilinməyən əmr — səssiz keç

    try {
      await command.execute(message, args, client);
      await message.react(config.SUCCESS_REACTION).catch(() => null);
    } catch (err) {
      console.error(`[Əmr xətası: ${commandName}]`, err);
      await message.reply({ embeds: [errorEmbed('Əmr icra olunarkən gözlənilməz xəta baş verdi.')] }).catch(() => null);
    }
  },
};
