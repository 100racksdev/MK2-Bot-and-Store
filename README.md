# MK2 Ticket Bot + Store (one project)

Your ticket bot (panel, categories, /close, MongoDB) now also runs the website.
Customer flow: **Store -> Cart -> Checkout -> Login with Discord -> a private "Store Support"
ticket opens (same category/roles/welcome message as the panel button) with their order -> they land in it.**
Tickets created from the site are normal tickets, so `/close` and the database work as usual.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill it in. You already have DISCORD_TOKEN, CLIENT_ID, GUILD_ID,
   MONGO_URI. New ones:
   - `CLIENT_SECRET`: Developer Portal > your app > OAuth2 > Client Secret
   - `BASE_URL`: `http://localhost:3000` for testing, your real https domain when live
   - `SESSION_SECRET`: any long random text
3. Developer Portal > OAuth2 > **Redirects** > Add `BASE_URL/auth/callback`
   (e.g. `http://localhost:3000/auth/callback`). It must match exactly.
4. The bot needs the **Create Instant Invite** permission (this lets the site add customers to your server).
5. `npm run deploy` (registers /panel and /close, only needed once), then `npm start`.
6. Open **http://localhost:3000** in your browser. Don't double-click the .html files:
   login only works through the running server.

## Notes
- The "Store Support" ticket uses the category with id `store` in `config.json`. Keep that id.
- Prices live in `public/js/products.js` and are re-checked on the server at checkout.
- Payment isn't processed on the site. Staff take payment inside the ticket.
- To go live, host this on a VPS/Railway/Render etc. and set `BASE_URL` to your https domain
  (and add that redirect URL in the Developer Portal).
- Keep `.env` private. Never share your bot token or Mongo string.
