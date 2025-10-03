export function welcomeMember(member) {
  const channel = member.guild.systemChannel;
  if (!channel) return;

  channel.send(`👋 Welcome to the server, ${member.user}! Enjoy your stay!`);
}

export function farewellMember(member) {
  const channel = member.guild.systemChannel;
  if (!channel) return;

  channel.send(`😢 ${member.user} has left the server.`);
}
