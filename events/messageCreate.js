const config = require('../config/config');
const { errorEmbed } = require('../utils/embeds');
const { incrementMessageCount } = require('../utils/activityStats');

const spamWindows = new Map();

function isGeneralChat(message) {
  return message.channel.id === config.GENERAL_CHAT_CHANNEL_ID
    || (!config.GENERAL_CHAT_CHANNEL_ID && message.channel.name === config.GENERAL_CHAT_CHANNEL_NAME);
}

async function handleGeneralChatActivity(message) {
  if (!isGeneralChat(message)) return false;

  const now = Date.now();
  const key = `${message.guild.id}_${message.author.id}`;
  const recentMessages = (spamWindows.get(key) || []).filter((timestamp) => now - timestamp < config.SPAM_WINDOW_MS);
  recentMessages.push(now);
  spamWindows.set(key, recentMessages);

  if (recentMessages.length > config.SPAM_MESSAGE_LIMIT) {
    spamWindows.delete(key);
    await message.member.timeout(config.SPAM_TIMEOUT_MS, 'Ümumi söhbət kanalında spam').catch((err) => {
      console.error('[Spam timeout xətası]', err.message);
    });
    return true;
  }

  incrementMessageCount(message.guild.id, message.author.id);
  return false;
}

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return; // DM-lərdə əmr işləməsin
    if (await handleGeneralChatActivity(message)) return;
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
