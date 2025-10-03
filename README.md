# LalaBot — Fullstack (Dev & Prod)

This repo contains a production-minded multi-platform bot server with:
- Telegram (polling/webhook)
- Discord (bot + slash commands registration)
- Slack (Bolt + slash commands)
- Optional real integrations: TMDB, OpenWeather, LibreTranslate
- Docker + docker-compose (with ngrok sidecar for dev)
- Jest unit tests and GitHub Actions CI

## Quickstart (dev with ngrok sidecar)
1. Copy `.env.example` to `.env` and add any tokens.
2. `docker compose up --build`
3. Wait ~10s and visit the ngrok dashboard at `http://localhost:4040` to get the public URL.
4. Use that public URL for Slack/Discord webhooks or Telegram webhook.

## Register Discord slash commands (optional)
Set `DISCORD_TOKEN` and `DISCORD_APP_ID` in your env, then:
```
node register-commands.js [GUILD_ID]
```

## Run locally (no Docker)
1. `npm ci`
2. `node server.js` or `npm run dev` (requires nodemon)

## Tests
`npm test`

## Environment variables
See `.env.example`

## Production notes
- For production, use HTTPS and a reverse proxy (Nginx/Cloudflare).
- Replace ngrok with a permanent domain and secure certs.
