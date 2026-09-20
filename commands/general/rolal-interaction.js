const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const config = require('../../config/config');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { checkPermission, checkPermissionInteraction } = require('../../utils/permissions');
const { sendRoleMenuMessage } = require('../../utils/roleMenu');

module.exports = {
  category: 'Ümumi',
  name: 'rolal-interaction',
  description: 'Rol-al kanalına universitet və cinsiyyət rol menyusunu göndərir',
  usage: 'rolal-interaction',

  data: new SlashCommandBuilder()
    .setName('rolal-interaction')
    .setDescription('Rol-al kanalına rol menyusunu göndərir')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(message) {
    if (!(await checkPermission(message, PermissionsBitField.Flags.Administrator, 'Administrator'))) return;

    try {
      await sendRoleMenuMessage(message.client);
      await message.reply({ embeds: [successEmbed(`Rol menyusu <#${config.ROLE_CHANNEL_ID}> kanalına göndərildi.`)] });
    } catch (err) {
      console.error('[Rol menyusu göndərilmə xətası]', err);
      await message.reply({ embeds: [errorEmbed('Rol menyusunu göndərmək mümkün olmadı.')] });
    }
  },

  async executeSlash(interaction) {
    if (!(await checkPermissionInteraction(interaction, PermissionsBitField.Flags.Administrator, 'Administrator'))) return;

    try {
      await sendRoleMenuMessage(interaction.client);
      await interaction.reply({ embeds: [successEmbed(`Rol menyusu <#${config.ROLE_CHANNEL_ID}> kanalına göndərildi.`)], ephemeral: true });
    } catch (err) {
      console.error('[Rol menyusu göndərilmə xətası]', err);
      await interaction.reply({ embeds: [errorEmbed('Rol menyusunu göndərmək mümkün olmadı.')], ephemeral: true });
    }
  },
};