const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'activity-stats.json');

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

function readDb() {
  ensureDbFile();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (err) {
    console.error('[Aktivlik bazası oxunmadı]', err);
    return {};
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getUserStats(guildId, userId) {
  const db = readDb();
  return db[`${guildId}_${userId}`] || { messageCount: 0, voiceMs: 0 };
}

function getLeaderboard(guildId, field) {
  const db = readDb();
  return Object.entries(db)
    .filter(([key, stats]) => key.startsWith(`${guildId}_`) && Number(stats[field]) > 0)
    .map(([key, stats]) => ({
      userId: key.slice(`${guildId}_`.length),
      value: Number(stats[field]),
    }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 10);
}

function incrementMessageCount(guildId, userId) {
  const db = readDb();
  const key = `${guildId}_${userId}`;
  if (!db[key]) db[key] = { messageCount: 0, voiceMs: 0 };
  db[key].messageCount += 1;
  writeDb(db);
  return db[key];
}

function addVoiceTime(guildId, userId, milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return getUserStats(guildId, userId);
  const db = readDb();
  const key = `${guildId}_${userId}`;
  if (!db[key]) db[key] = { messageCount: 0, voiceMs: 0 };
  db[key].voiceMs += milliseconds;
  writeDb(db);
  return db[key];
}

module.exports = { getUserStats, getLeaderboard, incrementMessageCount, addVoiceTime };