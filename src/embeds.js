import { EmbedBuilder } from "discord.js";

export function xpEmbed(user, xp, level) {
  return new EmbedBuilder()
    .setTitle(`${user.username}'s XP & Level`)
    .setColor(0x00ff00)
    .addFields(
      { name: "XP", value: `${xp}`, inline: true },
      { name: "Level", value: `${level}`, inline: true }
    )
    .setTimestamp();
}

export function gameEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x00bfff)
    .setTimestamp();
}
