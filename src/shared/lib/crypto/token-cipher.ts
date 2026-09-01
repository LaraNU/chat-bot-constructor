import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const NONCE_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_HEX_LENGTH = 64;
const PREFIX = 'enc:v1:';

let _cachedKey: Buffer | null = null;

/** Clears the cached key. For use in tests only — call after mutating BOT_TOKEN_ENCRYPTION_KEY. */
export function _resetKeyCache(): void {
  _cachedKey = null;
}

function getKey(): Buffer {
  if (_cachedKey) return _cachedKey;

  const raw = process.env.BOT_TOKEN_ENCRYPTION_KEY;

  if (!raw || raw.length !== KEY_HEX_LENGTH || !/^[0-9a-fA-F]+$/.test(raw)) {
    throw new Error(
      'BOT_TOKEN_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes). ' +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  _cachedKey = Buffer.from(raw, 'hex');
  return _cachedKey;
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const nonce = randomBytes(NONCE_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, nonce);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload = Buffer.concat([encrypted, tag]);

  return `${PREFIX}${nonce.toString('base64')}.${payload.toString('base64')}`;
}

/**
 * Returns true when the stored value is an encrypted token produced by `encryptToken`.
 * Plaintext tokens (legacy, pre-migration) return false.
 */
export function isEncryptedToken(stored: string): boolean {
  return stored.startsWith(PREFIX);
}

export function decryptToken(stored: string): string {
  if (!stored.startsWith(PREFIX)) {
    throw new Error(`Unknown token format: expected "${PREFIX}" prefix`);
  }

  const body = stored.slice(PREFIX.length);
  const dotIndex = body.indexOf('.');

  if (dotIndex === -1) {
    throw new Error('Malformed encrypted token: missing nonce separator');
  }

  const key = getKey();
  const nonce = Buffer.from(body.slice(0, dotIndex), 'base64');
  const payload = Buffer.from(body.slice(dotIndex + 1), 'base64');

  if (payload.length <= AUTH_TAG_LENGTH) {
    throw new Error('Malformed encrypted token: payload too short');
  }

  const ciphertext = payload.subarray(0, -AUTH_TAG_LENGTH);
  const tag = payload.subarray(-AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, nonce);
  decipher.setAuthTag(tag);

  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
}
