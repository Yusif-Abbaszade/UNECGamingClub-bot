const { errorEmbed } = require('../utils/embeds');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return; // yalnız slash əmrləri

    const command = client.commands.get(interaction.commandName);
    if (!command || !command.executeSlash) return;

    try {
      await command.executeSlash(interaction, client);
    } catch (err) {
      console.error(`[Slash əmr xətası: ${interaction.commandName}]`, err);
      const payload = { embeds: [errorEmbed('Əmr icra olunarkən gözlənilməz xəta baş verdi.')], ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  },
};
