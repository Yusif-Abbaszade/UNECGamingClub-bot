require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildPresences,
];

const client = new Client({
  intents,
  partials: [Partials.Channel, Partials.Message],
});

// ============================================
//  ƏMRLƏRİ AVTOMATİK YÜKLƏMƏ
//  commands/ altındakı bütün alt-qovluqlardan .js fayllarını oxuyur
// ============================================
client.commands = new Collection();

function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommands(fullPath); // alt-qovluqları da gəz (moderation/, general/, ...)
    } else if (entry.name.endsWith('.js')) {
      const command = require(fullPath);
      if (command.name) {
        client.commands.set(command.name, command);
      }
    }
  }
}

loadCommands(path.join(__dirname, 'commands'));

// ============================================
//  EVENT-LƏRİ AVTOMATİK YÜKLƏMƏ
//  events/ qovluğundakı bütün .js fayllarını oxuyur
// ============================================
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ============================================
//  XƏTA İDARƏETMƏSİ (bot çökməsin deyə)
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('İdarə olunmayan xəta (unhandledRejection):', err);
});

// Discord.js daxili xəta/reconnect hadisələrini görmək üçün
client.on('error', (err) => console.error('[Client error]:', err));
client.on('shardError', (err) => console.error('[Shard error]:', err));
client.on('debug', (info) => {
  // yalnız qoşulma ilə bağlı vacib mesajları göstər (spam etməsin deyə)
  if (/gateway|session|resum|heartbeat/i.test(info)) {
    console.log('[Debug]:', info);
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ XƏTA: .env faylında DISCORD_TOKEN tapılmadı. .env faylının mövcud olduğunu və düzgün doldurulduğunu yoxla.');
  process.exit(1);
}

console.log('⏳ Discord-a qoşulmağa çalışılır...');

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('🔑 Login uğurlu oldu, "ready" hadisəsi gözlənilir...'))
  .catch((err) => {
    console.error('❌ Login zamanı xəta baş verdi:', err.message);
    process.exit(1);
  });
