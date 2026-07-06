# Account Connections — Provider Setup Guide

This guide covers how to configure each OAuth provider for account connections on SerikaCord.

## General Setup

1. Set `FRONTEND_URL` in your `.env` to your public-facing URL (e.g. `https://serika.chat`).
2. All OAuth callback URLs follow the pattern: `https://<FRONTEND_URL>/api/auth/<provider>/callback`
3. After configuring a provider, restart the server.
4. Staff can toggle connections globally via **Admin Settings → Platform Settings → Connections**.

---

## Last.fm

Last.fm uses a custom OAuth 1.0-style flow (not standard OAuth2).

1. Go to <https://www.last.fm/api/account/create>
2. Create a new API account
3. Copy the **API key** and **Shared secret**
4. Add to `.env`:
   ```
   LASTFM_API_KEY=your-api-key
   LASTFM_API_SECRET=your-shared-secret
   ```
5. The callback URL is automatically set to `{FRONTEND_URL}/api/auth/lastfm/callback`

---

## GitHub

1. Go to <https://github.com/settings/developers>
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: SerikaCord (or your instance name)
   - **Homepage URL**: your `FRONTEND_URL`
   - **Authorization callback URL**: `{FRONTEND_URL}/api/auth/github/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it
7. Add to `.env`:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

**Scopes used**: `read:user` (read-only access to profile info)

---

## Spotify

1. Go to <https://developer.spotify.com/dashboard>
2. Click **Create app**
3. Fill in:
   - **App name**: SerikaCord (or your instance name)
   - **Redirect URI**: `{FRONTEND_URL}/api/auth/spotify/callback`
   - **Web API**: checked
4. Save and open **Settings**
5. Copy the **Client ID** and **Client Secret**
6. Add to `.env`:
   ```
   SPOTIFY_CLIENT_ID=your-client-id
   SPOTIFY_CLIENT_SECRET=your-client-secret
   ```

**Scopes used**: `user-read-private user-read-email`

---

## Twitch

1. Go to <https://dev.twitch.tv/console>
2. Click **Register Your Application**
3. Fill in:
   - **Name**: SerikaCord (or your instance name)
   - **OAuth Redirect URLs**: `{FRONTEND_URL}/api/auth/twitch/callback`
   - **Category**: Website Integration
4. Save and click **Manage**
5. Copy the **Client ID**
6. Click **New Secret** and copy the **Client Secret**
7. Add to `.env`:
   ```
   TWITCH_CLIENT_ID=your-client-id
   TWITCH_CLIENT_SECRET=your-client-secret
   ```

**Scopes used**: `user:read:email`

---

## Steam

Steam uses OpenID (not OAuth2). You only need a Web API key.

1. Go to <https://steamcommunity.com/dev/apikey>
2. Register a new API key (domain can be your `FRONTEND_URL` domain)
3. Copy the **API Key**
4. Add to `.env`:
   ```
   STEAM_API_KEY=your-api-key
   ```

The Steam flow redirects users to Steam's OpenID login page, then extracts their SteamID from the callback URL and fetches their profile via the Steam Web API.

---

## Discord (already configured)

Discord OAuth is used for the main authentication flow and is configured via:

```
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

If Discord OAuth is already set up for login, it will also work for connections.

---

## Providers Without OAuth Support

The following providers are listed in the UI but do not currently have OAuth backend implementations. Clicking "Connect" will redirect to a `not_configured` error:

- **YouTube** — requires Google OAuth2 (Google Cloud Console)
- **Xbox** — requires Microsoft Azure AD app registration
- **PlayStation** — no public OAuth API available
- **Battle.net** — requires Blizzard OAuth (https://develop.battle.net)
- **Roblox** — no public OAuth API available
- **X / Twitter** — requires Twitter API v2 OAuth (https://developer.twitter.com)
- **Instagram** — requires Meta for Developers OAuth
- **Website** — manual URL entry (no OAuth needed)

To add support for any of these, create an entry in `OAUTH2_PROVIDERS` in `src/lib/api/auth.ts` following the same pattern as the existing providers.

---

## Staff Controls

Staff members can enable or disable account connections globally:

1. Open **User Settings** (gear icon)
2. Navigate to **Admin Settings → Platform Settings**
3. Toggle **Enable Account Connections**

When disabled:
- Users see a yellow banner explaining connections are temporarily disabled
- All "Connect" buttons are greyed out and non-functional
- Existing connections can still be disconnected
- OAuth initiate endpoints return a redirect with `?error=connections_disabled`
