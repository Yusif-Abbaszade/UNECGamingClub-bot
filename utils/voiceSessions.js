const sessions = new Map();

function getKey(guildId, userId) {
  return `${guildId}_${userId}`;
}

function startVoiceSession(guildId, userId) {
  sessions.set(getKey(guildId, userId), Date.now());
}

function endVoiceSession(guildId, userId) {
  const key = getKey(guildId, userId);
  const startedAt = sessions.get(key);
  sessions.delete(key);
  return startedAt ? Date.now() - startedAt : 0;
}

module.exports = { startVoiceSession, endVoiceSession };