// ========================
// LALA BOT – MAIN ENTRY
// ========================

import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

// Import Modules
import { addXP, userXP, userLevel } from "./xp.js";
import { getAIResponse } from "./ai.js";
import { warnUser, kickUser, banUser } from "./moderation.js";
import { checkRoleReward } from "./roles.js";
import { greetings, jokes, randomItem } from "./commands.js";
import { playTrivia, playTicTacToe } from "./games.js";
import { sendTypingDelay } from "./utils.js";

// Optional Advanced Modules (placeholders)
import { playMusic, stopMusic } from "./music.js";       // music
import { createPoll } from "./polls.js";                // polls
import { showServerStats } from "./serverStats.js";     // server stats
import { assignReactionRoles } from "./reactionRoles.js"; // reaction roles
import { welcomeMember } from "./welcome.js";           // welcome messages
import { generateImage } from "./imageGen.js";          // AI image generation

// ========================
// CREATE CLIENT
// ========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

// ========================
// BOT READY EVENT
// ========================
client.once("clientReady", () => {
  console.log(`✅ Lala Bot is online as ${client.user.tag}!`);
});

// ========================
// MESSAGE HANDLER
// ========================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // --- XP SYSTEM ---
  const newLevel = addXP(message.author.id, 5);
  if (newLevel) checkRoleReward(message.member, message.guild, newLevel);

  // --- BASIC COMMANDS ---
  if (content === "hello") return message.channel.send(randomItem(greetings));
  if (content === "joke") return message.channel.send(randomItem(jokes));

  // AI Chat
  if (content.startsWith("!ask ")) {
    const question = message.content.slice(5);
    const answer = await getAIResponse(question);
    return sendTypingDelay(message.channel, answer);
  }

  // XP Check
  if (content === "!xp") {
    const xp = userXP[message.author.id] || 0;
    const level = userLevel[message.author.id] || 0;
    return message.channel.send(`${message.author}, XP: ${xp}, Level: ${level}`);
  }

  // --- GAMES ---
  if (content === "!trivia") return playTrivia(message.channel);
  if (content === "!ttt") return playTicTacToe(message.channel);

  // --- MODERATION ---
  if (content.startsWith("!warn")) return warnUser(message, message.mentions.users.first());
  if (content.startsWith("!kick")) return kickUser(message, message.mentions.members.first());
  if (content.startsWith("!ban")) return banUser(message, message.mentions.members.first());

  // --- MUSIC (placeholder commands) ---
  if (content.startsWith("!play")) return playMusic(message);
  if (content === "!stop") return stopMusic(message);

  // --- POLLS ---
  if (content.startsWith("!poll")) return createPoll(message);

  // --- SERVER STATS ---
  if (content === "!server") return showServerStats(message);

  // --- REACTION ROLES ---
  if (content.startsWith("!reactionrole")) return assignReactionRoles(message);

  // --- WELCOME & AI IMAGE ---
  if (content.startsWith("!generate")) {
    const prompt = message.content.slice(10);
    const imageURL = await generateImage(prompt);
    return message.channel.send({ content: imageURL });
  }
});

// ========================
// MEMBER JOIN EVENT
// ========================
client.on("guildMemberAdd", (member) => {
  welcomeMember(member);
});

// ========================
// LOGIN
// ========================
client.login(process.env.DISCORD_TOKEN);
