// Sadə fayl-əsaslı warn (xəbərdarlıq) saxlama sistemi.
// Kiçik/orta server üçün kifayətdir. Böyüdükcə SQLite/MongoDB-yə keçmək olar —
// bu fayldakı funksiyaların adını dəyişmədən daxili məntiqi əvəz etmək kifayətdir.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'warns.json');

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

function readDb() {
  ensureDbFile();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function addWarn(guildId, userId, reason, moderatorId) {
  const db = readDb();
  const key = `${guildId}_${userId}`;
  if (!db[key]) db[key] = [];
  db[key].push({ reason, moderatorId, timestamp: Date.now() });
  writeDb(db);
  return db[key].length; // ümumi warn sayını qaytarır
}

function getWarns(guildId, userId) {
  const db = readDb();
  return db[`${guildId}_${userId}`] || [];
}

function clearWarns(guildId, userId) {
  const db = readDb();
  const key = `${guildId}_${userId}`;
  const count = (db[key] || []).length;
  delete db[key];
  writeDb(db);
  return count;
}

module.exports = { addWarn, getWarns, clearWarns };
