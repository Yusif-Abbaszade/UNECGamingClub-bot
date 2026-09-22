const { scheduleGeneralChatChannelUpdate } = require('../utils/channelStats');

module.exports = {
  name: 'presenceUpdate',
  once: false,
  async execute(oldPresence, newPresence) {
    scheduleGeneralChatChannelUpdate(newPresence.guild);
  },
};