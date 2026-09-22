const config = require('../config/config');

const pendingUpdates = new Map();
const activeUpdates = new Set();
const nameUpdates = new Set();

function getActiveMemberCount(guild) {
  return guild.presences.cache.filter((presence) => presence.status && presence.status !== 'offline').size;
}

async function updateGeneralChatChannel(guild) {
  if (!guild) return;

  const topic = `**ÜMUMİ ÜZV: ${guild.memberCount} | AKTİV ÜZV: ${getActiveMemberCount(guild)}**`;
  await Promise.all(config.MEMBER_STATS_CHANNEL_IDS.map((channelId) => updateStatsChannel(guild, channelId, topic)));
}

async function updateStatsChannel(guild, channelId, topic) {
  const updateKey = `${guild.id}:${channelId}`;
  if (activeUpdates.has(updateKey)) return;
  activeUpdates.add(updateKey);

  try {
    const channel = await guild.channels.fetch(channelId).catch((err) => {
      console.error(`[Kanal statistikası] Kanal tapılmadı (${channelId})`, err.message);
      return null;
    });
    if (!channel || typeof channel.setTopic !== 'function') {
      console.error(`[Kanal statistikası] Kanal ID-si text kanalına aid deyil (${channelId}).`);
      return;
    }
    console.log(`[Kanal statistikası] Kanal tapıldı: ${channel.name}`);
    const botMember = guild.members.me;
    if (!botMember) {
      console.error('[Kanal statistikası] Bot üzv məlumatı cache-də yoxdur.');
      return;
    }
    if (botMember && !channel.permissionsFor(botMember)?.has('ManageChannels')) {
      console.error('[Kanal statistikası] Botda bu kanal üçün Manage Channels icazəsi yoxdur.');
      return;
    }

    console.log(`[Kanal statistikası] Mövcud topic: ${channel.topic || '(boş)'}`);

    if (channel.topic !== topic) {
      await channel.setTopic(topic, 'Üzv statistikası yeniləndi');
      console.log(`[Kanal statistikası] Topic yeniləndi: ${topic}`);
    }

    const channelName = config.GENERAL_CHAT_CHANNEL_PREFIX;
    if (channel.id === config.GENERAL_CHAT_CHANNEL_ID
      && channel.name !== channelName && !nameUpdates.has(channel.id)) {
      nameUpdates.add(channel.id);
      channel.setName(channelName, 'Kanal adı standart formata qaytarıldı')
        .then(() => console.log(`[Kanal statistikası] Kanal adı yeniləndi: ${channelName}`))
        .catch((err) => console.error('[Kanal adı xətası]', err.message))
        .finally(() => nameUpdates.delete(channel.id));
    }
  } catch (err) {
    console.error('[Kanal statistikası xətası]', err.message, err.code ? `(kod: ${err.code})` : '');
  } finally {
    activeUpdates.delete(updateKey);
  }
}

function scheduleGeneralChatChannelUpdate(guild) {
  if (!guild || pendingUpdates.has(guild.id)) return;

  const timeout = setTimeout(async () => {
    pendingUpdates.delete(guild.id);
    await updateGeneralChatChannel(guild);
  }, 5000);

  pendingUpdates.set(guild.id, timeout);
}

module.exports = { scheduleGeneralChatChannelUpdate, updateGeneralChatChannel };