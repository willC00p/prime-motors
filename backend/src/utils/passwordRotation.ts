import crypto from 'crypto';

/**
 * Generates a rotating daily password based on the current date
 * The password changes daily at midnight (based on server timezone)
 * Uses HMAC-SHA256 for deterministic and secure password generation
 */
export function generateRotatingPassword(): string {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Secret seed for hashing (should be same across server instances)
  const secretSeed = process.env.PASSWORD_ROTATION_SECRET || 'PRIME_MOTORS_ROTATION_KEY';
  
  // Generate HMAC-SHA256 hash of today's date
  const hash = crypto.createHmac('sha256', secretSeed).update(today).digest('hex');
  
  // Take first 8 characters and convert to uppercase for a readable password
  // Format: XXXXXXXX (8 alphanumeric characters)
  const password = hash.substring(0, 8).toUpperCase();
  
  return password;
}

/**
 * Validates if a provided password matches today's rotating password
 */
export function validateRotatingPassword(providedPassword: string): boolean {
  const todayPassword = generateRotatingPassword();
  return providedPassword === todayPassword;
}

/**
 * Gets the current rotation password for display purposes
 * Only used internally or for authorized roles
 */
export function getCurrentRotationPassword(): string {
  return generateRotatingPassword();
}
