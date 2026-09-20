const { ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const config = require('../config/config');
const { ensureTweetPanelMessage } = require('../utils/tweetBot');

async function joinAutoVoiceChannel(client) {
  try {
    const channel = await client.channels.fetch(config.AUTO_VOICE_CHANNEL_ID);

    if (!channel || !channel.isVoiceBased() || !channel.guild) {
      console.error('❌ Avtomatik səs kanalı tapılmadı və ya kanal səs kanalı deyil.');
      return;
    }

    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });

    console.log(`🔊 Bot səs kanalına qoşuldu: ${channel.name} (qulaqlıq və mikrofon bağlı)`);
  } catch (err) {
    console.error('❌ Avtomatik səs kanalına qoşulmaq mümkün olmadı:', err.message);
  }
}

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot işə düşdü: ${client.user.tag}`);
    console.log(`📋 ${client.commands.size} əmr yükləndi`);
    console.log(`🌐 ${client.guilds.cache.size} serverdə aktivdir`);

    client.user.setPresence({
      activities: [{ name: `${config.PREFIX}help | UNEC Gaming Club`, type: ActivityType.Watching }],
      status: 'online',
    });

    await joinAutoVoiceChannel(client);

    if (config.TWEET_CHANNEL_ID) {
      try {
        await ensureTweetPanelMessage(client);
      } catch (err) {
        console.error('❌ Tweet panelını hazırlamaq mümkün olmadı:', err.message);
      }
    }
  },
};
