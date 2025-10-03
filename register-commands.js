/**
 * register-commands.js
 * Usage: DISCORD_TOKEN=... node register-commands.js [GUILD_ID]
 */
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Set DISCORD_TOKEN in env to register commands.');
  process.exit(1);
}

const commands = [
  // --- Movies & TV ---
  new SlashCommandBuilder().setName('movie_recommend').setDescription('Recommend movies by mood'),
  new SlashCommandBuilder().setName('movie_trending').setDescription('Get trending movies'),
  new SlashCommandBuilder().setName('movie_search').setDescription('Search for a movie'),
  new SlashCommandBuilder().setName('movie_upcoming').setDescription('Upcoming movies'),
  new SlashCommandBuilder().setName('movie_nowplaying').setDescription('Now playing movies'),
  new SlashCommandBuilder().setName('movie_toprated').setDescription('Top rated movies'),
  new SlashCommandBuilder().setName('tv_trending').setDescription('Trending TV shows'),
  new SlashCommandBuilder().setName('tv_toprated').setDescription('Top rated TV shows'),
  new SlashCommandBuilder().setName('tv_search').setDescription('Search TV shows'),
  new SlashCommandBuilder().setName('actor_search').setDescription('Search for an actor'),

  // --- Weather & Geo ---
  new SlashCommandBuilder().setName('weather').setDescription('Get weather for a city')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),
  new SlashCommandBuilder().setName('forecast').setDescription('Get 5-day forecast')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),
  new SlashCommandBuilder().setName('air_quality').setDescription('Get air quality index for a city')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),
  new SlashCommandBuilder().setName('sunrise').setDescription('Get sunrise time for a city')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),
  new SlashCommandBuilder().setName('timezone').setDescription('Get timezone for a city')
    .addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)),

  // --- Translate & Language ---
  new SlashCommandBuilder().setName('translate').setDescription('Translate text')
    .addStringOption(o => o.setName('text').setDescription('Text to translate').setRequired(true))
    .addStringOption(o => o.setName('to').setDescription('Target language').setRequired(true)),
  new SlashCommandBuilder().setName('detect_language').setDescription('Detect language of text')
    .addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)),
  new SlashCommandBuilder().setName('define').setDescription('Define a word')
    .addStringOption(o => o.setName('word').setDescription('Word').setRequired(true)),
  new SlashCommandBuilder().setName('synonym').setDescription('Find synonyms')
    .addStringOption(o => o.setName('word').setDescription('Word').setRequired(true)),
  new SlashCommandBuilder().setName('antonym').setDescription('Find antonyms')
    .addStringOption(o => o.setName('word').setDescription('Word').setRequired(true)),

  // --- Fun & Games ---
  new SlashCommandBuilder().setName('joke').setDescription('Get a random joke'),
  new SlashCommandBuilder().setName('meme').setDescription('Get a random meme'),
  new SlashCommandBuilder().setName('trivia').setDescription('Answer a trivia question'),
  new SlashCommandBuilder().setName('dice').setDescription('Roll a dice'),
  new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin'),
  new SlashCommandBuilder().setName('roast').setDescription('Roast a user')
    .addUserOption(o => o.setName('user').setDescription('User to roast')),
  new SlashCommandBuilder().setName('compliment').setDescription('Compliment a user')
    .addUserOption(o => o.setName('user').setDescription('User to compliment')),
  new SlashCommandBuilder().setName('8ball').setDescription('Ask the magic 8-ball')
    .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),
  new SlashCommandBuilder().setName('quote').setDescription('Get a random quote'),
  new SlashCommandBuilder().setName('fact').setDescription('Get a random fact'),

  // --- Utility & Tools ---
  new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  new SlashCommandBuilder().setName('uptime').setDescription('Check bot uptime'),
  new SlashCommandBuilder().setName('about').setDescription('About this bot'),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Get server info'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Get info about a user')
    .addUserOption(o => o.setName('user').setDescription('User')),
  new SlashCommandBuilder().setName('avatar').setDescription('Get user avatar')
    .addUserOption(o => o.setName('user').setDescription('User')),
  new SlashCommandBuilder().setName('poll').setDescription('Create a poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true)),
  new SlashCommandBuilder().setName('remind').setDescription('Set a reminder')
    .addStringOption(o => o.setName('time').setDescription('Time (e.g. 10m)').setRequired(true))
    .addStringOption(o => o.setName('text').setDescription('Reminder text').setRequired(true)),
  new SlashCommandBuilder().setName('timer').setDescription('Set a timer')
    .addIntegerOption(o => o.setName('seconds').setDescription('Seconds').setRequired(true)),
  new SlashCommandBuilder().setName('calc').setDescription('Simple calculator')
    .addStringOption(o => o.setName('expression').setDescription('e.g. 2+2*3').setRequired(true)),

  // --- Music ---
  new SlashCommandBuilder().setName('lyrics').setDescription('Get lyrics for a song')
    .addStringOption(o => o.setName('song').setDescription('Song name').setRequired(true)),
  new SlashCommandBuilder().setName('song_search').setDescription('Search for a song')
    .addStringOption(o => o.setName('query').setDescription('Song/Artist').setRequired(true)),
  new SlashCommandBuilder().setName('artist_info').setDescription('Get artist info')
    .addStringOption(o => o.setName('artist').setDescription('Artist name').setRequired(true)),
  new SlashCommandBuilder().setName('top_charts').setDescription('Get top music charts'),
  new SlashCommandBuilder().setName('now_playing').setDescription('What is currently playing?'),

  // --- Crypto & Finance ---
  new SlashCommandBuilder().setName('btc').setDescription('Bitcoin price'),
  new SlashCommandBuilder().setName('eth').setDescription('Ethereum price'),
  new SlashCommandBuilder().setName('crypto_search').setDescription('Search crypto price')
    .addStringOption(o => o.setName('symbol').setDescription('Crypto symbol').setRequired(true)),
  new SlashCommandBuilder().setName('stock').setDescription('Lookup stock price')
    .addStringOption(o => o.setName('symbol').setDescription('Ticker symbol').setRequired(true)),
  new SlashCommandBuilder().setName('currency_convert').setDescription('Convert currency')
    .addStringOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
    .addStringOption(o => o.setName('from').setDescription('From currency').setRequired(true))
    .addStringOption(o => o.setName('to').setDescription('To currency').setRequired(true)),
  new SlashCommandBuilder().setName('gold_price').setDescription('Get gold price'),
  new SlashCommandBuilder().setName('silver_price').setDescription('Get silver price'),
  new SlashCommandBuilder().setName('market_news').setDescription('Latest market news'),
  new SlashCommandBuilder().setName('gas_price').setDescription('Check Ethereum gas fees'),
  new SlashCommandBuilder().setName('nft_floor').setDescription('Check NFT floor price')
    .addStringOption(o => o.setName('collection').setDescription('Collection name').setRequired(true)),

  // --- News ---
  new SlashCommandBuilder().setName('news').setDescription('Latest headlines'),
  new SlashCommandBuilder().setName('tech_news').setDescription('Latest tech news'),
  new SlashCommandBuilder().setName('sports_news').setDescription('Latest sports news'),
  new SlashCommandBuilder().setName('gaming_news').setDescription('Latest gaming news'),
  new SlashCommandBuilder().setName('science_news').setDescription('Latest science news'),
  new SlashCommandBuilder().setName('world_news').setDescription('World news'),
  new SlashCommandBuilder().setName('business_news').setDescription('Business news'),
  new SlashCommandBuilder().setName('health_news').setDescription('Health news'),
  new SlashCommandBuilder().setName('politics_news').setDescription('Politics news'),
  new SlashCommandBuilder().setName('entertainment_news').setDescription('Entertainment news'),

  // --- Moderation ---
  new SlashCommandBuilder().setName('ban').setDescription('Ban a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Mute a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
  new SlashCommandBuilder().setName('unmute').setDescription('Unmute a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('Clear messages')
    .addIntegerOption(o => o.setName('count').setDescription('Number of messages').setRequired(true)),
  new SlashCommandBuilder().setName('slowmode').setDescription('Set channel slowmode')
    .addIntegerOption(o => o.setName('seconds').setDescription('Seconds').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('Warn a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  // --- Knowledge & Misc ---
  new SlashCommandBuilder().setName('wiki').setDescription('Search Wikipedia')
    .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true)),
  new SlashCommandBuilder().setName('math').setDescription('Solve a math expression')
    .addStringOption(o => o.setName('expression').setDescription('Expression').setRequired(true)),
  new SlashCommandBuilder().setName('word_of_day').setDescription('Word of the day'),
  new SlashCommandBuilder().setName('quote_of_day').setDescription('Quote of the day'),
  new SlashCommandBuilder().setName('fact_of_day').setDescription('Fact of the day'),
  new SlashCommandBuilder().setName('history_today').setDescription('This day in history'),
  new SlashCommandBuilder().setName('space').setDescription('NASA space image of the day'),
  new SlashCommandBuilder().setName('cat').setDescription('Random cat picture'),
  new SlashCommandBuilder().setName('dog').setDescription('Random dog picture'),
  new SlashCommandBuilder().setName('bird').setDescription('Random bird picture'),
    new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask lala a question')
    .addStringOption(o =>
      o.setName('prompt')
        .setDescription('What do you want to ask?')
        .setRequired(true)
    ),

].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    const guildId = process.argv[2];
    if (guildId) {
      console.log('Registering guild commands for', guildId);
      await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APP_ID, guildId), { body: commands });
      console.log('Registered guild commands.');
    } else {
      console.log('Registering global commands');
      await rest.put(Routes.applicationCommands(process.env.DISCORD_APP_ID), { body: commands });
      console.log('Registered global commands (may take 1 hour).');
    }
  } catch (err) { console.error('Error registering commands:', err); }
})();
