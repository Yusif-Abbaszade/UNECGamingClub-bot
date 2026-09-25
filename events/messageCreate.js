const config = require('../config/config');
const { errorEmbed } = require('../utils/embeds');
const { incrementMessageCount } = require('../utils/activityStats');

const spamWindows = new Map();
const countingState = new Map();
const COUNTING_CHANNEL_ID = '1552833359502254090';
const COUNTING_CONFIRM_REACTION_ID = '1552834541062852678';

function getCountingStateKey(guildId) {
  return `${guildId}:${COUNTING_CHANNEL_ID}`;
}

async function handleCountingChannel(message) {
  if (message.channel.id !== COUNTING_CHANNEL_ID) return false;

  const content = String(message.content || '').trim();
  const numericValue = Number(content);
  const isNumericMessage = /^\d+$/.test(content);

  if (!isNumericMessage) {
    await message.delete().catch(() => null);
    return true;
  }

  const stateKey = getCountingStateKey(message.guild.id);
  const currentState = countingState.get(stateKey) || { nextNumber: 1, lastUserId: null };
  const expectedValue = currentState.nextNumber;

  if (numericValue !== expectedValue || message.author.id === currentState.lastUserId) {
    await message.delete().catch(() => null);
    return true;
  }

  currentState.nextNumber = expectedValue + 1;
  currentState.lastUserId = message.author.id;
  countingState.set(stateKey, currentState);

  try {
    await message.react(COUNTING_CONFIRM_REACTION_ID);
  } catch (err) {
    console.error('[Sayma kanal reaksiya xətası]', err.message);
  }

  return true;
}

function getForwardRoleNames() {
  return (config.ROLE_FORWARD_ROLE_NAMES || []).map((name) => String(name).trim().toLowerCase());
}

async function handleRoleMentionForward(message) {
  if (!message.mentions || !message.mentions.roles || message.mentions.roles.size === 0) return false;

  const monitoredRoles = [...message.mentions.roles.values()].filter((role) => {
    const roleName = String(role?.name || '').trim().toLowerCase();
    return getForwardRoleNames().includes(roleName);
  });

  if (monitoredRoles.length === 0) return false;

  await message.react(config.ROLE_MENTION_REACTION).catch(() => null);

  const targets = new Map();
  for (const role of monitoredRoles) {
    for (const member of role.members.values()) {
      if (member.id === message.author.id) continue;
      targets.set(member.id, member);
    }
  }

  const originalText = String(message.content || '').trim();
  const trimmedText = originalText.length > 1800 ? `${originalText.slice(0, 1800)}...` : originalText;
  const sourceHint = message.channel ? `\n\nMənbə: ${message.channel} | ${message.url || 'link yoxdur'}` : '';
  const dmText = `📣 ${message.author} adlı istifadəçi sizə ${message.guild?.name || 'server'}-də aşağıdakı mesajı yolladı:\n>>> ${trimmedText}${sourceHint}`;

  for (const member of targets.values()) {
    await member.send(dmText).catch((err) => {
      console.error('[Rol etiket yönləndirmə xətası]', err.message);
    });
  }

  return true;
}

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

    if (await handleCountingChannel(message)) return;
    if (await handleRoleMentionForward(message)) return;
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
