// Bu skript botun bütün kodundan asılı olmadan, birbaşa Discord gateway-ə
// WebSocket ilə qoşulmağa çalışır. Məqsəd: problem şəbəkədədir, yoxsa kodda?

const WebSocket = require('ws');

console.log('⏳ wss://gateway.discord.gg-ə qoşulmağa çalışılır...');

const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

const timeout = setTimeout(() => {
  console.log('❌ 10 saniyə ərzində heç bir cavab gəlmədi — WebSocket bağlantısı çox güman ki bloklanıb.');
  process.exit(1);
}, 10000);

ws.on('open', () => {
  clearTimeout(timeout);
  console.log('✅ WebSocket bağlantısı UĞURLA açıldı! Şəbəkə problemi yoxdur.');
  ws.close();
  process.exit(0);
});

ws.on('error', (err) => {
  clearTimeout(timeout);
  console.log('❌ WebSocket XƏTASI:', err.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`ℹ️ Bağlantı bağlandı. Kod: ${code}, Səbəb: ${reason}`);
});
