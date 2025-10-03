export function sendTypingDelay(channel, message, delay = 1000) {
  channel.sendTyping();
  setTimeout(() => channel.send(message), delay);
}
