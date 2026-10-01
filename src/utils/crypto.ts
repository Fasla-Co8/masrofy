import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Derives 32-byte key from ENCRYPTION_KEY or a secure fallback
const getSecretKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY || 'masrof-production-fallback-key-32b!';
  return crypto.createHash('sha256').update(secret).digest();
};

export function encryptToken(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err);
    throw new Error('Failed to encrypt secret reference');
  }
}

export function decryptToken(encryptedData: string): string {
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    if (!ivHex || !authTagHex || !encryptedText) {
      // In case token was stored unencrypted or invalid format
      return encryptedData;
    }
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return encryptedData; // fallback
  }
}
