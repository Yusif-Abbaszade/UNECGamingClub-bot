const {
  ActionRowBuilder,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const config = require('../config/config');
const { errorEmbed } = require('../utils/embeds');
const {
  TWEET_BUTTON_ID,
  TWEET_MODAL_ID,
  TWEET_INPUT_ID,
  getTweetPayload,
} = require('../utils/tweetBot');
const {
  SERVERINFO_REFRESH_BUTTON_ID,
  buildServerImage,
} = require('../commands/general/serverinfo');
const {
  MESSAGE_TOP_REFRESH_BUTTON_ID,
  VOICE_TOP_REFRESH_BUTTON_ID,
  buildLeaderboardImage,
} = require('../utils/activityLeaderboard');
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
    if (interaction.isButton() && interaction.customId === SERVERINFO_REFRESH_BUTTON_ID) {
      await handleServerInfoRefresh(interaction);
      return;
    }

    if (interaction.isButton() && [MESSAGE_TOP_REFRESH_BUTTON_ID, VOICE_TOP_REFRESH_BUTTON_ID].includes(interaction.customId)) {
      await handleLeaderboardRefresh(interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === TWEET_BUTTON_ID) {
      await interaction.showModal({
        title: 'Tweet yaz',
        customId: TWEET_MODAL_ID,
        components: [new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(TWEET_INPUT_ID)
            .setLabel('Tweetin')
            .setPlaceholder('Nə düşünürsən?')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(4000)
            .setRequired(true),
        )],
      });
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === TWEET_MODAL_ID) {
      await handleTweetSubmit(interaction, client);
      return;
    }

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

async function handleServerInfoRefresh(interaction) {
  if (!interaction.guild) return;

  try {
    await interaction.deferUpdate();
    await interaction.message.edit(await buildServerImage(interaction.guild));
  } catch (err) {
    console.error('[Serverinfo yenilənmə xətası]', err);
    if (interaction.deferred) {
      await interaction.followUp({ content: '❌ Server məlumatlarını yeniləmək mümkün olmadı.', ephemeral: true }).catch(() => null);
    }
  }
}

async function handleLeaderboardRefresh(interaction) {
  if (!interaction.guild) return;
  if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({ content: '❌ Bu sıralamanı yalnız administratorlar yeniləyə bilər.', ephemeral: true });
    return;
  }

  try {
    await interaction.deferUpdate();
    const type = interaction.customId === VOICE_TOP_REFRESH_BUTTON_ID ? 'voice' : 'message';
    await interaction.message.edit(await buildLeaderboardImage(interaction.guild, type));
  } catch (err) {
    console.error('[Top sıralama yenilənmə xətası]', err);
    if (interaction.deferred) {
      await interaction.followUp({ content: '❌ Sıralamanı yeniləmək mümkün olmadı.', ephemeral: true }).catch(() => null);
    }
  }
}

async function handleTweetSubmit(interaction, client) {
  const content = interaction.fields.getTextInputValue(TWEET_INPUT_ID).trim();
  if (!content) {
    await interaction.reply({ content: '❌ Tweet mətni boş ola bilməz.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await client.channels.fetch(config.TWEET_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      throw new Error('Tweet kanalı tapılmadı.');
    }

    await channel.send(await getTweetPayload(interaction.user, content));
    await interaction.deleteReply();
  } catch (err) {
    console.error('[Tweet xətası]', err);
    await interaction.editReply('❌ Tweet paylaşılarkən xəta baş verdi. Kanal icazələrini yoxla.');
  }
}

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
