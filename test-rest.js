// Bu skript discord.js-in WebSocket-dən ƏVVƏL etdiyi REST sorğusunu
// (token doğrulama + gateway/shard məlumatı almaq) ayrıca test edir.
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log('❌ .env-də DISCORD_TOKEN tapılmadı.');
  process.exit(1);
}

console.log('⏳ Discord REST API-yə sorğu göndərilir (/gateway/bot)...');

const controller = new AbortController();
const timeoutId = setTimeout(() => {
  console.log('❌ 10 saniyə ərzində REST sorğusu cavab vermədi — problem burada ola bilər (fetch/undici).');
  controller.abort();
  process.exit(1);
}, 10000);

fetch('https://discord.com/api/v10/gateway/bot', {
  headers: { Authorization: `Bot ${token}` },
  signal: controller.signal,
})
  .then(async (res) => {
    clearTimeout(timeoutId);
    const data = await res.json();
    if (res.ok) {
      console.log('✅ REST sorğusu UĞURLA cavab verdi:', data);
    } else {
      console.log(`❌ REST sorğusu xəta ilə cavab verdi (status ${res.status}):`, data);
    }
    process.exit(0);
  })
  .catch((err) => {
    clearTimeout(timeoutId);
    console.log('❌ REST sorğusu FETCH XƏTASI:', err.message);
    process.exit(1);
  });
