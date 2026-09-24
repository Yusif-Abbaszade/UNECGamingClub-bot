const config = require('../config/config');

function hasBotExcludedRole(member) {
  if (member.user.bot) return true;

  return member.roles.cache.some((role) => {
    if (config.BOT_ROLE_ID && role.id === config.BOT_ROLE_ID) return true;
    if (!config.BOT_ROLE_NAME) return false;
    return role.name && role.name.toLowerCase() === String(config.BOT_ROLE_NAME).toLowerCase();
  });
}

async function addDefaultMemberRole(member) {
  if (hasBotExcludedRole(member)) return true;

  const role = member.guild.roles.cache.find((item) => item.name === config.DEFAULT_MEMBER_ROLE_NAME);

  if (!role) {
    console.error(`[Standart rol] ${config.DEFAULT_MEMBER_ROLE_NAME} rolu tapılmadı: ${member.guild.name}`);
    return false;
  }

  if (member.roles.cache.has(role.id)) return true;

  try {
    await member.roles.add(role, 'Standart üzv rolu');
    return true;
  } catch (err) {
    console.error(`[Standart rol] ${member.user.tag} istifadəçisinə rol verilə bilmədi:`, err.message);
    return false;
  }
}

async function addDefaultRoleToGuildMembers(guild) {
  await guild.members.fetch();

  for (const member of guild.members.cache.values()) {
    await addDefaultMemberRole(member);
  }
}

module.exports = {
  addDefaultMemberRole,
  addDefaultRoleToGuildMembers,
};
