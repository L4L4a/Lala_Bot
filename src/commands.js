export const greetings = [
  "Hello there! 👋",
  "Hey! How’s it going?",
  "Hiya! 😊",
  "Greetings, friend!"
];

export const jokes = [
  "Why did the computer go to the doctor? Because it caught a virus! 🦠",
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  "Why did the developer go broke? Because he used up all his cache! 💸"
];

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
