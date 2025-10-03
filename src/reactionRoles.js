export async function assignReactionRoles(message) {
  const args = message.content.split(" ").slice(1); // "!reactionrole @Role emoji"
  if (args.length < 2) return message.channel.send("Usage: !reactionrole @Role emoji");

  const role = message.mentions.roles.first();
  const emoji = args[1];

  const reactMessage = await message.channel.send(`React to get the role: ${role.name}`);
  await reactMessage.react(emoji);

  const filter = (reaction, user) => reaction.emoji.name === emoji && !user.bot;
  const collector = reactMessage.createReactionCollector({ filter, dispose: true });

  collector.on("collect", async (reaction, user) => {
    const member = message.guild.members.cache.get(user.id);
    member.roles.add(role);
  });

  collector.on("remove", async (reaction, user) => {
    const member = message.guild.members.cache.get(user.id);
    member.roles.remove(role);
  });
}
