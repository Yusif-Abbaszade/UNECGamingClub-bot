const config = require('../config/config');
const { scheduleGeneralChatChannelUpdate } = require('../utils/channelStats');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    scheduleGeneralChatChannelUpdate(member.guild);
    const welcomeChannel = member.guild.channels.cache.get(config.WELCOME_CHANNEL_ID);
    if (!welcomeChannel || typeof welcomeChannel.send !== 'function') return;

    await welcomeChannel.send(
      `${member} **Sunucumuza Xoş Gəldin!**\n> *<#${config.ROLE_CHANNEL_ID}> Kanal vasitəsilə xüsusi rollar əldə edə bilərsiniz!*`,
    ).catch((err) => {
      console.error('[Qarşılama mesajı xətası]', err.message);
    });
  },
};