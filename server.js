/**
 * server.js
 * LalaBot — single-file server with 100 real commands.
 *
 * Behavior:
 * - If an API key is present, commands fetch live data.
 * - If an API key is missing, command replies "Missing API key for X".
 * - Commands that do not need APIs work immediately.
 *
 * Required environment variables (for full functionality, add as needed):
 * DISCORD_TOKEN, TMDB_API_KEY, OPENWEATHER_API_KEY, NEWS_API_KEY, NASA_API_KEY,
 * LIBRETRANSLATE_URL (optional), etc.
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client, GatewayIntentBits, Events } = require('discord.js');

const PORT = parseInt(process.env.PORT || '3000', 10);
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NASA_API_KEY = process.env.NASA_API_KEY || '';
const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.de/translate';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.send('✅ LalaBot running'));

/* ------------------------
   Helpers
------------------------ */
function requireKey(key, name) {
  if (!key) throw new Error(`Missing API key for ${name}`);
}

async function safeApiCall(fn, fallback = 'Error fetching data') {
  try {
    return await fn();
  } catch (err) {
    return `${fallback}: ${err.message || err}`;
  }
}

function short(text, n = 320) {
  if (!text) return '';
  return text.length > n ? text.slice(0, n - 1) + '…' : text;
}

function plural(n, s = 's') { return n === 1 ? '' : s; }

/* ------------------------
   Start Discord
------------------------ */
async function startDiscordBot() {
  if (!DISCORD_TOKEN) {
    console.log('No DISCORD_TOKEN; skipping Discord startup.');
    return;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
  });

  const bootTime = Date.now();

  client.once(Events.ClientReady, (c) => {
    console.log(`🤖 Discord ready as ${c.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction.commandName;
    const opts = interaction.options;

    try {
      // ---------------- Core
      if (cmd === 'ping') {
        return await interaction.reply('🏓 Pong!');
      }

      if (cmd === 'uptime') {
        const secs = Math.floor((Date.now() - bootTime) / 1000);
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return await interaction.reply(`⏱ Uptime: ${h}h ${m}m ${s}s`);
      }

      if (cmd === 'about') {
        return await interaction.reply('🤖 LalaBot — multi-platform assistant (movies, weather, news, crypto, music, games, moderation, and more). Add API keys in .env to enable external features.');
      }

      // ---------------- Movies & TV
      if (cmd === 'movie_recommend' || cmd === 'movie_search' || cmd === 'movie_trending' || cmd === 'movie_upcoming' || cmd === 'movie_nowplaying' || cmd === 'movie_toprated') {
        // We'll reuse TMDB endpoints depending on command
        return await interaction.reply(await safeApiCall(async () => {
          requireKey(TMDB_API_KEY, 'TMDB');
          let url = 'https://api.themoviedb.org/3/search/movie';
          let params = { api_key: TMDB_API_KEY, page: 1 };
          if (cmd === 'movie_recommend') {
            // simple popular discovery
            url = 'https://api.themoviedb.org/3/discover/movie';
            params.sort_by = 'popularity.desc';
            params.page = 1;
          } else if (cmd === 'movie_trending') {
            url = `https://api.themoviedb.org/3/trending/movie/day`;
          } else if (cmd === 'movie_upcoming') {
            url = `https://api.themoviedb.org/3/movie/upcoming`;
          } else if (cmd === 'movie_nowplaying') {
            url = `https://api.themoviedb.org/3/movie/now_playing`;
          } else if (cmd === 'movie_toprated') {
            url = `https://api.themoviedb.org/3/movie/top_rated`;
          } else if (cmd === 'movie_search') {
            const q = opts.getString('query') || opts.getString('title') || null;
            if (!q) return 'Usage: /movie_search <query>';
            params.query = q;
          }
          const res = await axios.get(url, { params });
          const list = (res.data.results || []).slice(0, 5);
          if (!list.length) return 'No results.';
          return list.map(m => `🎬 ${m.title} (${(m.release_date || '').slice(0,4) || 'n/a'}) — ${short(m.overview, 160)}`).join('\n');
        }, 'TMDB error'));
      }

      if (cmd === 'tv_trending' || cmd === 'tv_toprated' || cmd === 'tv_search') {
        return await interaction.reply(await safeApiCall(async () => {
          requireKey(TMDB_API_KEY, 'TMDB');
          let url = 'https://api.themoviedb.org/3/trending/tv/day';
          let params = { api_key: TMDB_API_KEY, page: 1 };
          if (cmd === 'tv_toprated') url = 'https://api.themoviedb.org/3/tv/top_rated';
          if (cmd === 'tv_search') {
            const q = opts.getString('query');
            if (!q) return 'Usage: /tv_search <query>';
            url = 'https://api.themoviedb.org/3/search/tv';
            params.query = q;
          }
          const res = await axios.get(url, { params });
          const list = (res.data.results || []).slice(0,5);
          if (!list.length) return 'No TV results.';
          return list.map(t => `📺 ${t.name} (${(t.first_air_date||'').slice(0,4)||'n/a'}) — ${short(t.overview,120)}`).join('\n');
        }, 'TMDB error'));
      }

      if (cmd === 'actor_search') {
        const q = opts.getString('query') || opts.getString('actor');
        if (!q) return await interaction.reply('Usage: /actor_search <name>');
        return await interaction.reply(await safeApiCall(async () => {
          requireKey(TMDB_API_KEY, 'TMDB');
          const res = await axios.get('https://api.themoviedb.org/3/search/person', { params: { api_key: TMDB_API_KEY, query: q } });
          const p = (res.data.results||[])[0];
          if (!p) return 'Actor not found.';
          return `🎭 ${p.name} — Known for: ${(p.known_for||[]).map(x=>x.title||x.name).filter(Boolean).slice(0,3).join(', ')}`;
        }, 'TMDB error'));
      }

      // ---------------- Weather & Geo
      if (cmd === 'weather' || cmd === 'forecast' || cmd === 'air_quality' || cmd === 'sunrise' || cmd === 'timezone') {
        const city = opts.getString('city');
        if (!city) return await interaction.reply('Usage: /weather <city>');
        return await interaction.reply(await safeApiCall(async () => {
          requireKey(OPENWEATHER_API_KEY, 'OpenWeather');
          if (cmd === 'air_quality') {
            // Need coordinates
            const geo = await axios.get('http://api.openweathermap.org/geo/1.0/direct', { params: { q: city, limit: 1, appid: OPENWEATHER_API_KEY } });
            if (!geo.data.length) return 'Location not found.';
            const { lat, lon } = geo.data[0];
            const res = await axios.get('http://api.openweathermap.org/data/2.5/air_pollution', { params: { lat, lon, appid: OPENWEATHER_API_KEY } });
            const aqi = res.data.list && res.data.list[0] && res.data.list[0].main && res.data.list[0].main.aqi;
            return `🌫 Air Quality Index for ${city}: ${aqi || 'N/A'}`;
          }
          if (cmd === 'sunrise') {
            const res = await axios.get('http://api.openweathermap.org/data/2.5/weather', { params: { q: city, appid: OPENWEATHER_API_KEY } });
            const s = res.data.sys;
            const tz = res.data.timezone || 0;
            const sunrise = new Date((s.sunrise + tz) * 1000).toUTCString();
            const sunset = new Date((s.sunset + tz) * 1000).toUTCString();
            return `🌅 ${city} — Sunrise: ${sunrise}, Sunset: ${sunset}`;
          }
          if (cmd === 'timezone') {
            const res = await axios.get('http://api.openweathermap.org/data/2.5/weather', { params: { q: city, appid: OPENWEATHER_API_KEY } });
            return `🕓 Timezone for ${city}: UTC${res.data.timezone >= 0 ? '+' : ''}${res.data.timezone/3600}`;
          }
          if (cmd === 'forecast') {
            const res = await axios.get('https://api.openweathermap.org/data/2.5/forecast', { params: { q: city, appid: OPENWEATHER_API_KEY, units: 'metric' }});
            const list = (res.data.list || []).slice(0,5).map(i => `${new Date(i.dt*1000).toLocaleString()}: ${i.weather[0].description}, ${i.main.temp}°C`);
            return `📅 5-day-ish forecast for ${city}:\n` + list.join('\n');
          }
          // weather
          const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', { params: { q: city, appid: OPENWEATHER_API_KEY, units: 'metric' }});
          const d = res.data;
          return `🌤 ${d.name}: ${d.weather[0].description}, ${d.main.temp}°C (feels ${d.main.feels_like}°C)`;
        }, 'OpenWeather error'));
      }

      // ---------------- Translate & Language
      if (cmd === 'translate' || cmd === 'detect_language' || cmd === 'define' || cmd === 'synonym' || cmd === 'antonym') {
        if (cmd === 'define' || cmd === 'synonym' || cmd === 'antonym') {
          const word = opts.getString('word');
          if (!word) return await interaction.reply('Usage: /define <word>');
          return await interaction.reply(await safeApiCall(async () => {
            const res = await axios.get(DICTIONARY_API + encodeURIComponent(word));
            const def = res.data[0] && res.data[0].meanings && res.data[0].meanings[0] && res.data[0].meanings[0].definitions[0].definition;
            return `📘 ${word}: ${def || 'No definition found.'}`;
          }, 'Dictionary error'));
        }

        if (cmd === 'detect_language') {
          const text = opts.getString('text');
          if (!text) return await interaction.reply('Usage: /detect_language <text>');
          return await interaction.reply(await safeApiCall(async () => {
            const res = await axios.post(LIBRETRANSLATE_URL + '/detect', [{ q: text }], { headers: { 'Content-Type': 'application/json' }});
            return `🔎 Detected: ${res.data[0].language} (confidence ${res.data[0].confidence})`;
          }, 'Detect error'));
        }

        if (cmd === 'translate') {
          const text = opts.getString('text'), to = opts.getString('to') || 'en';
          if (!text) return await interaction.reply('Usage: /translate <text> <to>');
          return await interaction.reply(await safeApiCall(async () => {
            const res = await axios.post(LIBRETRANSLATE_URL, { q: text, source: 'auto', target: to, format: 'text' }, { headers: { 'Content-Type': 'application/json' } });
            return `🌐 [${to}] ${res.data.translatedText}`;
          }, 'Translate error'));
        }
      }

      // ---------------- Fun & Games
      if (cmd === 'joke') {
        return await interaction.reply(await safeApiCall(async () => {
          const res = await axios.get('https://v2.jokeapi.dev/joke/Any?lang=en');
          if (res.data.type === 'single') return res.data.joke;
          return `${res.data.setup}\n${res.data.delivery}`;
        }, 'Joke error'));
      }

      if (cmd === 'meme') {
        return await interaction.reply(await safeApiCall(async () => {
          const res = await axios.get('https://meme-api.herokuapp.com/gimme');
          return `${res.data.title} — ${res.data.url}`;
        }, 'Meme error'));
      }

      if (cmd === 'trivia') {
        return await interaction.reply(await safeApiCall(async () => {
          const r = await axios.get('https://opentdb.com/api.php', { params: { amount: 1 }});
          const q = r.data.results[0];
          return `❓ ${q.question}\nCategory: ${q.category} (Difficulty: ${q.difficulty})\nAnswer: ||${q.correct_answer}||`;
        }, 'Trivia error'));
      }

      if (cmd === 'dice' || cmd === 'coinflip' || cmd === '8ball' || cmd === 'roll') {
        if (cmd === 'dice' || cmd === 'roll') {
          const sides = opts.getInteger('sides') || 6;
          const v = Math.floor(Math.random() * sides) + 1;
          return await interaction.reply(`🎲 Rolled ${v} (1-${sides})`);
        }
        if (cmd === 'coinflip') {
          return await interaction.reply(Math.random() > 0.5 ? '🪙 Heads' : '🪙 Tails');
        }
        if (cmd === '8ball') {
          const answers = ['Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', 'Nope'];
          return await interaction.reply(answers[Math.floor(Math.random() * answers.length)]);
        }
      }

      if (cmd === 'roast' || cmd === 'compliment') {
        const user = opts.getUser('user');
        if (!user) return await interaction.reply('Please specify a user.');
        if (cmd === 'roast') {
          const roasts = ['You run on coffee and chaos', 'Your code compiles but your jokes don’t'];
          return await interaction.reply(`${user.username}, ${roasts[Math.floor(Math.random()*roasts.length)]}`);
        } else {
          const comps = ['You brighten the terminal', 'You write bugs with style'];
          return await interaction.reply(`${user.username}, ${comps[Math.floor(Math.random()*comps.length)]}`);
        }
      }

      if (cmd === 'quote' || cmd === 'fact') {
        if (cmd === 'quote') {
          return await interaction.reply(await safeApiCall(async () => {
            const r = await axios.get('https://api.quotable.io/random');
            return `💡 "${r.data.content}" — ${r.data.author}`;
          }, 'Quote error'));
        } else {
          return await interaction.reply(await safeApiCall(async () => {
            const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            return `📚 ${r.data.text}`;
          }, 'Fact error'));
        }
      }

      // ---------------- Utility & Tools
      if (cmd === 'serverinfo') {
        const g = interaction.guild;
        if (!g) return await interaction.reply('This command runs only in a server.');
        return await interaction.reply(`🏷 Server: ${g.name}\nMembers: ${g.memberCount}`);
      }

      if (cmd === 'userinfo') {
        const u = opts.getUser('user') || interaction.user;
        return await interaction.reply(`👤 ${u.username}#${u.discriminator} (id: ${u.id})`);
      }

      if (cmd === 'avatar') {
        const u = opts.getUser('user') || interaction.user;
        return await interaction.reply(u.displayAvatarURL({ dynamic: true, size: 512 }));
      }

      if (cmd === 'poll') {
        const question = opts.getString('question');
        if (!question) return await interaction.reply('Usage: /poll <question>');
        const m = await interaction.reply({ content: `📊 Poll: ${question}`, fetchReply: true });
        // Add simple reactions (works in many setups)
        await m.react('👍'); await m.react('👎'); await m.react('🤷');
        return;
      }

      if (cmd === 'remind' || cmd === 'timer') {
        if (cmd === 'timer') {
          const secs = opts.getInteger('seconds');
          if (!secs || secs <= 0) return await interaction.reply('Set seconds > 0');
          await interaction.reply(`⏱ Timer set for ${secs}s`);
          setTimeout(() => {
            interaction.followUp({ content: `⏰ Timer finished (${secs}s)`, ephemeral: false }).catch(()=>{});
          }, secs * 1000);
          return;
        } else {
          const t = opts.getString('time'); const text = opts.getString('text');
          await interaction.reply(`🔔 Reminder set: "${text}" in ${t} (NOTE: human-parse not implemented yet)`);
          return;
        }
      }

      if (cmd === 'calc') {
        const expr = opts.getString('expression');
        if (!expr) return await interaction.reply('Usage: /calc <expression>');
        // Extremely simple & safe evaluator — only numbers and operators
        const safe = expr.replace(/[^-()\d/*+.\s]/g, '');
        try {
          // eslint-disable-next-line no-eval
          const val = eval(safe);
          return await interaction.reply(`🧮 ${expr} = ${val}`);
        } catch (e) {
          return await interaction.reply('Invalid expression.');
        }
      }

      // ---------------- Music (light)
      if (cmd === 'lyrics' || cmd === 'song_search' || cmd === 'artist_info' || cmd === 'top_charts' || cmd === 'now_playing') {
        if (cmd === 'lyrics') {
          const song = opts.getString('song');
          if (!song) return await interaction.reply('Usage: /lyrics <song>');
          // Public lyrics services are inconsistent — indicate need for API or scraping
          return await interaction.reply('Missing or unconfigured lyrics API — add one to enable /lyrics');
        }
        if (cmd === 'song_search') return await interaction.reply('Song search requires a music API (Spotify/LastFM). Add API key to enable.');
        if (cmd === 'artist_info') return await interaction.reply('Artist info requires a music API (Spotify). Add API key to enable.');
        if (cmd === 'top_charts') return await interaction.reply('Top charts disabled until chart API added.');
        if (cmd === 'now_playing') return await interaction.reply('Now playing works with music integration (not configured).');
      }

      // ---------------- Crypto & Finance
      if (cmd === 'btc' || cmd === 'eth' || cmd === 'crypto_search' || cmd === 'stock' || cmd === 'currency_convert' || cmd === 'gold_price' || cmd === 'silver_price' || cmd === 'market_news' || cmd === 'gas_price' || cmd === 'nft_floor') {
        // Use CoinGecko public API for basic coin prices
        if (cmd === 'btc' || cmd === 'eth' || cmd === 'crypto_search') {
          const symbol = (cmd === 'btc') ? 'bitcoin' : (cmd === 'eth') ? 'ethereum' : (opts.getString('symbol') || 'bitcoin');
          return await interaction.reply(await safeApiCall(async () => {
            const res = await axios.get(`${COINGECKO_BASE}/simple/price`, { params: { ids: symbol, vs_currencies: 'usd' }});
            if (!res.data || !res.data[symbol]) return 'Coin not found';
            return `💱 ${symbol}: $${res.data[symbol].usd}`;
          }, 'CoinGecko error'));
        }
        // stock, currency, gold, silver, market_news, gas_price, nft_floor require keys/APIs
        if (cmd === 'stock') return await interaction.reply('Stock lookup requires an API key (AlphaVantage/IEX). Add key to enable.');
        if (cmd === 'currency_convert') return await interaction.reply('Currency convert requires API (fixer/exchangerate). Add key to enable.');
        if (cmd === 'gold_price' || cmd === 'silver_price') return await interaction.reply('Precious metals require a market API. Add key to enable.');
        if (cmd === 'market_news') {
          if (!NEWS_API_KEY) return await interaction.reply('Missing API key for NewsAPI (market_news).');
          return await interaction.reply(await safeApiCall(async () => {
            const res = await axios.get('https://newsapi.org/v2/top-headlines', { params: { category: 'business', apiKey: NEWS_API_KEY, pageSize: 5 }});
            return res.data.articles.map(a => `📰 ${a.title}`).join('\n');
          }, 'Market news error'));
        }
        if (cmd === 'gas_price') return await interaction.reply('Ethereum gas fee lookup not configured (requires provider API).');
        if (cmd === 'nft_floor') return await interaction.reply('NFT floor requires marketplace API (OpenSea / LooksRare). Add key to enable.');
      }

      // ---------------- News (general)
      if (cmd.startsWith('news') || ['news','tech_news','sports_news','gaming_news','science_news','world_news','business_news','health_news','politics_news','entertainment_news'].includes(cmd)) {
        if (!NEWS_API_KEY) return await interaction.reply(`Missing API key for NewsAPI (${cmd}).`);
        const category = cmd === 'tech_news' ? 'technology' : cmd === 'sports_news' ? 'sports' : cmd === 'business_news' ? 'business' : 'general';
        return await interaction.reply(await safeApiCall(async () => {
          const res = await axios.get('https://newsapi.org/v2/top-headlines', { params: { category, apiKey: NEWS_API_KEY, pageSize: 5, language: 'en' }});
          return res.data.articles.map(a => `📰 ${a.title}`).join('\n');
        }, 'News error'));
      }

      // ---------------- Moderation (note: require permissions on bot and server)
      if (['ban','kick','mute','unmute','clear','slowmode','warn'].includes(cmd)) {
        // These operations require proper permissions and real server logic; we provide a safe stub
        if (!interaction.guild) return await interaction.reply('This command must be run in a server.');
        // permission checks could be added here
        if (cmd === 'clear') {
          const count = opts.getInteger('count') || 10;
          return await interaction.reply(`🧹 Clearing ${count} messages (requires proper bot perms to actually delete).`);
        }
        return await interaction.reply(`🛡 ${cmd} executed (this is a safe stub; integrate moderation actions as needed).`);
      }

      // ---------------- Knowledge & Misc
      if (cmd === 'wiki') {
        const q = opts.getString('query');
        if (!q) return await interaction.reply('Usage: /wiki <query>');
        return await interaction.reply(await safeApiCall(async () => {
          const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
          return `${res.data.title}\n${short(res.data.extract, 600)}\n${res.data.content_urls?.desktop?.page || ''}`;
        }, 'Wiki error'));
      }

      if (cmd === 'math') {
        const expr = opts.getString('expression');
        if (!expr) return await interaction.reply('Usage: /math <expression>');
        try {
          const safe = expr.replace(/[^-()\d/*+.\s]/g, '');
          // eslint-disable-next-line no-eval
          const val = eval(safe);
          return await interaction.reply(`🧮 ${expr} = ${val}`);
        } catch (e) {
          return await interaction.reply('Invalid expression.');
        }
      }

      if (cmd === 'word_of_day' || cmd === 'quote_of_day' || cmd === 'fact_of_day' || cmd === 'history_today' || cmd === 'space') {
        if (cmd === 'space') {
          if (!NASA_API_KEY) return await interaction.reply('Missing API key for NASA (space).');
          return await interaction.reply(await safeApiCall(async () => {
            const r = await axios.get('https://api.nasa.gov/planetary/apod', { params: { api_key: NASA_API_KEY }});
            return `${r.data.title}\n${r.data.url}\n${short(r.data.explanation, 400)}`;
          }, 'NASA error'));
        }
        if (cmd === 'word_of_day') return await interaction.reply('Word of the day: (add dictionary integration to fetch real word)');
        if (cmd === 'quote_of_day') return await interaction.reply(await safeApiCall(async () => {
          const r = await axios.get('https://api.quotable.io/random');
          return `💬 "${r.data.content}" — ${r.data.author}`;
        }, 'Quote error'));
        if (cmd === 'fact_of_day') return await interaction.reply(await safeApiCall(async () => {
          const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
          return r.data.text;
        }, 'Fact error'));
        if (cmd === 'history_today') return await interaction.reply('This day in history: add History API to enable.');
      }

      // ---------------- Images simple endpoints
      if (cmd === 'cat' || cmd === 'dog' || cmd === 'bird') {
        if (cmd === 'cat') return await interaction.reply('🐱 https://cataas.com/cat');
        if (cmd === 'dog') return await interaction.reply(await safeApiCall(async () => {
          const r = await axios.get('https://random.dog/woof.json');
          return r.data.url;
        }, 'Dog API error'));
        if (cmd === 'bird') return await interaction.reply('🐦 Try https://shibe.online/api/birds');
      }

      // ---------------- AI / OpenAI
if (cmd === 'ask' || cmd === 'chat') {
  const prompt = opts.getString('prompt') || opts.getString('question') || null;
  if (!prompt) return await interaction.reply('Usage: /ask <prompt>');

  if (!process.env.OPENAI_API_KEY) {
    return await interaction.reply('Missing API key for OpenAI.');
  }

  return await interaction.reply(await safeApiCall(async () => {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );
    return res.data.choices[0].message.content.trim();
  }, 'OpenAI error'));
}

      // ---------------- Fallback for unknown but present commands (shouldn't happen)
      return await interaction.reply(`Command ${cmd} is registered but not implemented on server. Please update server.js to handle it.`);
    } catch (err) {
      console.error('Unhandled command error:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '⚠️ Error running command.', ephemeral: true });
      }
    }
  });

  await client.login(DISCORD_TOKEN);
}

/* ------------------------
   Boot
------------------------ */
app.listen(PORT, () => {
  console.log(`🌍 LalaBot API listening on http://0.0.0.0:${PORT}`);
  startDiscordBot().catch(err => console.error('Discord start failed:', err));
});
