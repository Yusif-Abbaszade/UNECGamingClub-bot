// Bu skripti bot əmrləri dəyişəndə (yeni əmr əlavə/silinəndə) BİR DƏFƏ işlədirsən:
//   node deploy-commands.js
//
// GUILD_ID verilibsə əmrlər dərhal (bir neçə saniyəyə) həmin serverdə görünür.
// GUILD_ID verilməyibsə əmrlər QLOBAL qeydiyyatdan keçir — bu, bütün serverlərdə
// görünməsi üçündür, amma yayılması Discord tərəfindən ~1 saata qədər çəkə bilər.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // istəyə bağlı, test üçün tövsiyə olunur

if (!token || !clientId) {
  console.error('❌ .env faylında DISCORD_TOKEN və CLIENT_ID olmalıdır.');
  process.exit(1);
}

// commands/ altındakı bütün "data" sahəsi olan əmrləri topla
const commandsData = [];

function collectCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCommands(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data) {
        commandsData.push(command.data.toJSON());
      }
    }
  }
}

collectCommands(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`⏳ ${commandsData.length} slash əmr qeydiyyatdan keçirilir...`);

    let route;
    if (guildId) {
      route = Routes.applicationGuildCommands(clientId, guildId);
      console.log(`📍 Guild-specific qeydiyyat (dərhal aktiv olacaq): ${guildId}`);
    } else {
      route = Routes.applicationCommands(clientId);
      console.log('🌐 Qlobal qeydiyyat (yayılması ~1 saat çəkə bilər)');
    }

    const data = await rest.put(route, { body: commandsData });

    console.log(`✅ ${data.length} slash əmr uğurla qeydiyyatdan keçdi:`);
    data.forEach((cmd) => console.log(`   • /${cmd.name}`));
  } catch (err) {
    console.error('❌ Qeydiyyat zamanı xəta baş verdi:', err);
  }
})();
