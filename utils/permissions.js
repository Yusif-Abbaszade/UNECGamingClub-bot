const { PermissionsBitField } = require('discord.js');
const { errorEmbed } = require('./embeds');

// ============================================
//  PREFIX ƏMRLƏRİ ÜÇÜN (message əsaslı)
// ============================================

async function checkPermission(message, permissionFlag, label) {
  if (!message.member.permissions.has(permissionFlag)) {
    await message.reply({
      embeds: [errorEmbed(`Bu əmri istifadə etmək üçün **${label}** icazən yoxdur.`)],
    });
    return false;
  }
  return true;
}

async function checkBotPermission(message, permissionFlag, label) {
  if (!message.guild.members.me.permissions.has(permissionFlag)) {
    await message.reply({
      embeds: [errorEmbed(`Mənim bu əməliyyat üçün **${label}** icazəm yoxdur. Rol sıralamasını yoxla.`)],
    });
    return false;
  }
  return true;
}

async function checkRoleHierarchy(message, targetMember) {
  const executorHighest = message.member.roles.highest.position;
  const targetHighest = targetMember.roles.highest.position;

  if (targetHighest >= executorHighest && message.guild.ownerId !== message.author.id) {
    await message.reply({
      embeds: [errorEmbed('Bu istifadəçi səndən yüksək və ya bərabər rola malikdir, əməliyyat edə bilməzsən.')],
    });
    return false;
  }

  if (!targetMember.moderatable) {
    await message.reply({
      embeds: [errorEmbed('Bu istifadəçi üzərində əməliyyat apara bilmirəm (rol sıralaması botdan yüksəkdir).')],
    });
    return false;
  }

  return true;
}

// ============================================
//  SLASH ƏMRLƏRİ ÜÇÜN (interaction əsaslı)
// ============================================

async function checkPermissionInteraction(interaction, permissionFlag, label) {
  if (!interaction.member.permissions.has(permissionFlag)) {
    await interaction.reply({
      embeds: [errorEmbed(`Bu əmri istifadə etmək üçün **${label}** icazən yoxdur.`)],
      ephemeral: true,
    });
    return false;
  }
  return true;
}

async function checkBotPermissionInteraction(interaction, permissionFlag, label) {
  if (!interaction.guild.members.me.permissions.has(permissionFlag)) {
    await interaction.reply({
      embeds: [errorEmbed(`Mənim bu əməliyyat üçün **${label}** icazəm yoxdur. Rol sıralamasını yoxla.`)],
      ephemeral: true,
    });
    return false;
  }
  return true;
}

async function checkRoleHierarchyInteraction(interaction, targetMember) {
  const executorHighest = interaction.member.roles.highest.position;
  const targetHighest = targetMember.roles.highest.position;

  if (targetHighest >= executorHighest && interaction.guild.ownerId !== interaction.user.id) {
    await interaction.reply({
      embeds: [errorEmbed('Bu istifadəçi səndən yüksək və ya bərabər rola malikdir, əməliyyat edə bilməzsən.')],
      ephemeral: true,
    });
    return false;
  }

  if (!targetMember.moderatable) {
    await interaction.reply({
      embeds: [errorEmbed('Bu istifadəçi üzərində əməliyyat apara bilmirəm (rol sıralaması botdan yüksəkdir).')],
      ephemeral: true,
    });
    return false;
  }

  return true;
}

module.exports = {
  checkPermission,
  checkBotPermission,
  checkRoleHierarchy,
  checkPermissionInteraction,
  checkBotPermissionInteraction,
  checkRoleHierarchyInteraction,
};
