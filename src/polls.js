export async function createPoll(message) {
  const args = message.content.slice(6).trim(); // "!poll your question"
  if (!args) return message.channel.send("Please provide a poll question!");

  const pollMessage = await message.channel.send(`📊 **Poll:** ${args}`);
  await pollMessage.react("✅");
  await pollMessage.react("❌");

  message.channel.send("React with ✅ or ❌ to vote!");
}
