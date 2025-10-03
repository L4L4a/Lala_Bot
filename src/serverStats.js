export function showServerStats(message) {
  const { guild } = message;
  const stats = `
**Server Name:** ${guild.name}
**Total Members:** ${guild.memberCount}
**Channels:** ${guild.channels.cache.size}
**Roles:** ${guild.roles.cache.size}
  `;
  message.channel.send(stats);
}
