import crypto from 'crypto';

/**
 * Generates a rotating daily password based on the current date
 * The password changes daily at midnight (based on server timezone)
 * Uses HMAC-SHA256 for deterministic and secure password generation
 */
export function generateRotatingPassword(): string {
  const today = new Date().toISOString().split('T')[0];
  const secretSeed = process.env.PASSWORD_ROTATION_SECRET || 'PRIME_MOTORS_ROTATION_KEY';
  const hash = crypto.createHmac('sha256', secretSeed).update(today).digest('hex');
  return hash.substring(0, 8).toUpperCase();
}

/**
 * Gets the current rotation password for display purposes
 * Only used internally or for authorized roles
 */
export function getCurrentRotationPassword(): string {
  return generateRotatingPassword();
}
