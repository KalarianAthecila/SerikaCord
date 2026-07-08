import * as crypto from 'crypto';
import { Application, User } from '@/lib/models';
import type { IApplication } from '@/lib/models/Application';

/**
 * Generate an Ed25519 keypair for an application. The public key (raw, hex) is
 * shared with the developer so they can verify our interaction request
 * signatures — exactly like Discord's "Public Key". The private key (PKCS#8 PEM)
 * is kept server-side and used to sign outgoing interaction POSTs.
 */
export function generateAppKeyPair(): { publicKeyHex: string; privateKeyPem: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const raw = publicKey.export({ type: 'spki', format: 'der' });
  const publicKeyHex = raw.subarray(raw.length - 32).toString('hex');
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  return { publicKeyHex, privateKeyPem };
}

/** Sign a message with the app's Ed25519 private key, returning a hex signature. */
export function signInteraction(privateKeyPem: string, message: string): string {
  const key = crypto.createPrivateKey(privateKeyPem);
  const sig = crypto.sign(null, Buffer.from(message), key);
  return sig.toString('hex');
}

function generateBotToken(appId: string): string {
  return `${appId}.${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Ensure an application has a fully-provisioned bot: a backing User document
 * (isBot=true), a bot token, and an Ed25519 keypair. Idempotent — safe to call
 * on every "enable bot" / gateway IDENTIFY. Returns the saved application doc.
 */
export async function ensureBotProvisioned(app: IApplication) {
  const updates: Record<string, any> = {};

  if (!app.botToken) {
    updates.botToken = generateBotToken(app.clientId);
  }

  if (!app.publicKey || !app.privateKeyPem) {
    const { publicKeyHex, privateKeyPem } = generateAppKeyPair();
    updates.publicKey = publicKeyHex;
    updates.privateKeyPem = privateKeyPem;
  }

  if (!app.botId) {
    const base = (app.name || 'bot').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || 'bot';
    let username = base.length >= 3 ? base : `${base}bot`;
    const existing = await User.findOne({ username });
    if (existing) {
      username = `${base}${app.clientId.slice(-6)}`.slice(0, 32);
    }
    const botUser = await User.create({
      username,
      displayName: app.name || username,
      avatar: app.icon || null,
      bio: (app.description || '').slice(0, 190),
      isBot: true,
      isVerified: app.verified ?? false,
      status: 'online',
      badges: app.verified ? ['verified_bot'] : [],
    });
    updates.botId = botUser.id;
  }

  if (Object.keys(updates).length > 0) {
    const updated = await Application.updateById(app.id, updates);
    return updated || app;
  }
  return app;
}

/** Resolve an application (with private key) by its bot token. */
export async function findAppByBotToken(token: string) {
  const clean = token.startsWith('Bot ') ? token.slice(4) : token;
  if (!clean) return null;
  return Application.findOne({ botToken: clean });
}
