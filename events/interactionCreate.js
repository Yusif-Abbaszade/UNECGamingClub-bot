const { errorEmbed } = require('../utils/embeds');
const {
  ROLE_MENU_PREFIX,
  GENDER_MENU_PREFIX,
  getUniversity,
  getRoleName,
  getGender,
  getGenderRoleName,
  universities,
  genders,
} = require('../utils/roleMenu');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith(ROLE_MENU_PREFIX)) {
      await handleUniversityRoleSelection(interaction);
      return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith(GENDER_MENU_PREFIX)) {
      await handleGenderRoleSelection(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

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

async function handleUniversityRoleSelection(interaction) {
  const university = getUniversity(interaction.values[0]);
  if (!university || !interaction.guild) {
    await interaction.reply({ content: 'Bu rol seçimi artıq mövcud deyil.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const selectedRole = interaction.guild.roles.cache.find((role) => role.name === getRoleName(university))
      || await interaction.guild.roles.create({ name: getRoleName(university), reason: 'Universitet rolu seçimi üçün yaradıldı' });
    const removableRoles = interaction.member.roles.cache.filter((role) => universities.some((item) => (
      getRoleName(item) === role.name || item.label === role.name
    )));
    const rolesToRemove = removableRoles.filter((role) => role.id !== selectedRole.id);

    if (rolesToRemove.size > 0) {
      await interaction.member.roles.remove(rolesToRemove, 'Universitet rolu dəyişdirildi');
    }
    if (!interaction.member.roles.cache.has(selectedRole.id)) {
      await interaction.member.roles.add(selectedRole, 'Universitet rolu seçildi');
    }

    await interaction.editReply(`✅ Universitet rolun **${getRoleName(university)}** olaraq təyin edildi.`);
  } catch (err) {
    console.error('[Universitet rolu xətası]', err);
    await interaction.editReply('❌ Rol verilə bilmədi. Botun **Manage Roles** icazəsini və rol sıralamasını yoxla.');
  }
}

async function handleGenderRoleSelection(interaction) {
  const gender = getGender(interaction.values[0]);
  if (!gender || !interaction.guild) {
    await interaction.reply({ content: 'Bu rol seçimi artıq mövcud deyil.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const selectedRole = interaction.guild.roles.cache.find((role) => role.name === getGenderRoleName(gender))
      || await interaction.guild.roles.create({ name: getGenderRoleName(gender), reason: 'Cinsiyyət rolu seçimi üçün yaradıldı' });
    const removableRoles = interaction.member.roles.cache.filter((role) => genders.some((item) => (
      getGenderRoleName(item) === role.name
    )));
    const rolesToRemove = removableRoles.filter((role) => role.id !== selectedRole.id);

    if (rolesToRemove.size > 0) {
      await interaction.member.roles.remove(rolesToRemove, 'Cinsiyyət rolu dəyişdirildi');
    }
    if (!interaction.member.roles.cache.has(selectedRole.id)) {
      await interaction.member.roles.add(selectedRole, 'Cinsiyyət rolu seçildi');
    }

    await interaction.editReply(`✅ Cinsiyyət rolun **${getGenderRoleName(gender)}** olaraq təyin edildi.`);
  } catch (err) {
    console.error('[Cinsiyyət rolu xətası]', err);
    await interaction.editReply('❌ Rol verilə bilmədi. Botun **Manage Roles** icazəsini və rol sıralamasını yoxla.');
  }
}
