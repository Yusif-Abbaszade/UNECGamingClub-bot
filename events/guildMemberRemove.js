const { scheduleGeneralChatChannelUpdate } = require('../utils/channelStats');

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    scheduleGeneralChatChannelUpdate(member.guild);
  },
};