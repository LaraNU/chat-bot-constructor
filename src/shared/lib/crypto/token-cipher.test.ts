import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken, _resetKeyCache } from './token-cipher';

const VALID_KEY = 'a'.repeat(64);

function withKey(key: string | undefined, fn: () => void) {
  const original = process.env.BOT_TOKEN_ENCRYPTION_KEY;
  if (key === undefined) {
    delete process.env.BOT_TOKEN_ENCRYPTION_KEY;
  } else {
    process.env.BOT_TOKEN_ENCRYPTION_KEY = key;
  }
  _resetKeyCache();
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env.BOT_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.BOT_TOKEN_ENCRYPTION_KEY = original;
    }
    _resetKeyCache();
  }
}

describe('encryptToken / decryptToken', () => {
  it('round-trip: decrypting an encrypted token returns the original', () => {
    withKey(VALID_KEY, () => {
      const plaintext = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ';
      const encrypted = encryptToken(plaintext);
      expect(decryptToken(encrypted)).toBe(plaintext);
    });
  });

  it('encrypted value starts with enc:v1: prefix', () => {
    withKey(VALID_KEY, () => {
      const encrypted = encryptToken('some-token');
      expect(encrypted.startsWith('enc:v1:')).toBe(true);
    });
  });

  it('two encryptions of the same value produce different ciphertexts (random nonce)', () => {
    withKey(VALID_KEY, () => {
      const a = encryptToken('token');
      const b = encryptToken('token');
      expect(a).not.toBe(b);
    });
  });

  it('throws when BOT_TOKEN_ENCRYPTION_KEY is not set', () => {
    withKey(undefined, () => {
      expect(() => encryptToken('token')).toThrow('BOT_TOKEN_ENCRYPTION_KEY');
      expect(() => decryptToken('enc:v1:abc.def')).toThrow('BOT_TOKEN_ENCRYPTION_KEY');
    });
  });

  it('throws when BOT_TOKEN_ENCRYPTION_KEY is too short', () => {
    withKey('abc123', () => {
      expect(() => encryptToken('token')).toThrow('BOT_TOKEN_ENCRYPTION_KEY');
    });
  });

  it('throws when BOT_TOKEN_ENCRYPTION_KEY contains non-hex characters', () => {
    withKey('z'.repeat(64), () => {
      expect(() => encryptToken('token')).toThrow('BOT_TOKEN_ENCRYPTION_KEY');
    });
  });

  it('decryptToken throws when prefix is missing', () => {
    withKey(VALID_KEY, () => {
      expect(() => decryptToken('plaintext-token')).toThrow('Unknown token format');
    });
  });

  it('decryptToken throws on tampered ciphertext (GCM auth tag failure)', () => {
    withKey(VALID_KEY, () => {
      const encrypted = encryptToken('my-token');
      // Flip a character in the payload portion after enc:v1:<nonce>.
      const parts = encrypted.split('.');
      const tampered = parts[0] + '.' + parts[1].slice(0, -4) + 'XXXX';
      expect(() => decryptToken(tampered)).toThrow();
    });
  });
});
