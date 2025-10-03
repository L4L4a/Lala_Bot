import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import ytdl from "ytdl-core";

const players = new Map();

export async function playMusic(message) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.channel.send("You must be in a voice channel to play music!");

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("Connect") || !permissions.has("Speak")) {
    return message.channel.send("I need permissions to join and speak in your voice channel!");
  }

  const args = message.content.split(" ");
  if (!args[1]) return message.channel.send("Provide a YouTube link!");

  const stream = ytdl(args[1], { filter: "audioonly" });
  const resource = createAudioResource(stream);
  const player = createAudioPlayer();

  player.play(resource);
  players.set(message.guild.id, player);

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
  });

  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
    players.delete(message.guild.id);
  });

  message.channel.send(`🎵 Now playing: ${args[1]}`);
}

export function stopMusic(message) {
  const player = players.get(message.guild.id);
  if (player) {
    player.stop();
    players.delete(message.guild.id);
    return message.channel.send("⏹ Music stopped!");
  }
  message.channel.send("No music is playing right now.");
}
