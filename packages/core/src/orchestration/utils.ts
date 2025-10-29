/**
 * Utility functions for orchestration module
 */

import { createHash, randomBytes } from 'crypto';

/** Number of bytes for secure random generation */
const RANDOM_BYTES_COUNT = 4;

/** Divisor for converting 32-bit integer to 0-1 range */
const UINT32_DIVISOR = 0x100000000;

/** Default probability for secure random boolean */
const DEFAULT_PROBABILITY = 0.5;

/** Hash substring length for ID generation */
const HASH_SUBSTRING_LENGTH = 16;

/**
 * Generate a cryptographically secure random number between 0 and 1
 * This replaces Math.random() for security-sensitive operations
 * @returns {number} Random number between 0 and 1
 */
export function secureRandom(): number {
  // Generate 4 bytes (32 bits) of random data
  const buffer = randomBytes(RANDOM_BYTES_COUNT);
  // Convert to unsigned 32-bit integer and divide by 2^32
  return buffer.readUInt32BE(0) / UINT32_DIVISOR;
}

/**
 * Generate a secure random boolean with specified probability
 * @param {number} probability - Probability of returning true (0-1)
 * @returns {boolean} Random boolean result
 */
export function secureRandomBoolean(probability: number = DEFAULT_PROBABILITY): boolean {
  return secureRandom() < probability;
}

/**
 * Create a deterministic hash from a string for consistent identification
 * @param {string} input - String to hash
 * @returns {string} Hexadecimal hash
 */
export function createHashId(input: string): string {
  return createHash('sha256').update(input).digest('hex').substring(0, HASH_SUBSTRING_LENGTH);
}
