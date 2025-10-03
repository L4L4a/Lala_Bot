
// small test helper that imports the core functions by requiring a light module copy
const axios = require('axios');
const delay = ms => new Promise(r=>setTimeout(r,ms));
function sanitizeAndHumanize(text){ if(!text) return text; let t=text.replace(/\butilize\b/gi,'use'); return t; }

async function recommendMoviesByMood(mood='neutral'){
  // simple mocked impl to keep tests fast
  await delay(10);
  const db = { neutral: [{ title: 'Inception', year: 2010 }] };
  return db[mood] || db['neutral'];
}

module.exports = { recommendMoviesByMood, sanitizeAndHumanize };
