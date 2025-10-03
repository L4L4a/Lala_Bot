import { gameEmbed } from "./embeds.js";

const triviaQuestions = [
  { question: "What does CPU stand for?", answer: "Central Processing Unit" },
  { question: "Who created JavaScript?", answer: "Brendan Eich" }
];

export async function playTrivia(channel) {
  const q = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
  channel.send({ embeds: [gameEmbed("Trivia Time! 🎉", q.question)] });

  const filter = m => !m.author.bot;
  const collector = channel.createMessageCollector({ filter, time: 15000 });

  collector.on("collect", m => {
    if (m.content.toLowerCase() === q.answer.toLowerCase()) {
      channel.send(`Correct answer, ${m.author}! 🎉`);
      collector.stop();
    }
  });

  collector.on("end", collected => {
    if (!collected.some(m => m.content.toLowerCase() === q.answer.toLowerCase())) {
      channel.send(`Time's up! Correct answer: **${q.answer}**`);
    }
  });
}

export function playTicTacToe(channel) {
  channel.send({ embeds: [gameEmbed("Tic-Tac-Toe 🟢❌", "Game board coming soon!")] });
}
