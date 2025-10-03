export async function warnUser(message, user) {
  if (!user) return message.channel.send("Please mention a user to warn.");
  // Logic to add warnings
  message.channel.send(`${user.username} has been warned! ⚠️`);
}

export async function kickUser(message, member) {
  if (!member) return message.channel.send("Please mention a member to kick.");
  try { await member.kick(); message.channel.send(`${member.user.username} was kicked!`); } 
  catch { message.channel.send("Failed to kick member."); }
}

export async function banUser(message, member) {
  if (!member) return message.channel.send("Please mention a member to ban.");
  try { await member.ban(); message.channel.send(`${member.user.username} was banned!`); } 
  catch { message.channel.send("Failed to ban member."); }
}
