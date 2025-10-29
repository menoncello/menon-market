/**
 * Skill Loader Cache Management
 * Handles caching functionality for loaded skills
 */

import { DEFAULT_CACHE_TTL, DEFAULT_MAX_CACHE_SIZE, MAX_CACHE_SIZE_LIMIT } from './loader-config';
import { DEFAULT_CACHE_HIT_RATE } from './loader-validation';
import { SkillDefinition } from './types';

/**
 * Cache manager for skill definitions
 */
export class SkillCache {
  private cache = new Map<string, { skill: SkillDefinition; expiresAt: Date }>();
  private maxSize: number;
  private ttl: number;

  /**
   * Create a new skill cache
   * @param {number} maxSize - Maximum cache size
   * @param {number} ttl - Time to live in milliseconds
   */
  constructor(maxSize: number = DEFAULT_MAX_CACHE_SIZE, ttl: number = DEFAULT_CACHE_TTL) {
    this.maxSize = Math.min(maxSize, MAX_CACHE_SIZE_LIMIT);
    this.ttl = ttl;
  }

  /**
   * Get cached skill if valid
   * @param {string} key - Cache key
   * @returns {SkillDefinition|null} Cached skill or null if expired/not found
   */
  get(key: string): SkillDefinition | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, cached);
    return cached.skill;
  }

  /**
   * Set skill in cache
   * @param {string} key - Cache key
   * @param {SkillDefinition} skill - Skill to cache
   */
  set(key: string, skill: SkillDefinition): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Handle both direct skill input and cache entry format (for testing)
    let cacheEntry: { skill: SkillDefinition; expiresAt: Date };

    // Check if the input is already in cache entry format (has skill and expiresAt properties)
    if (skill && typeof skill === 'object' && 'skill' in skill && 'expiresAt' in skill) {
      // Input is already in cache entry format
      cacheEntry = skill as { skill: SkillDefinition; expiresAt: Date };
    } else {
      // Input is a skill definition, create cache entry
      // If TTL is 0 or less, cache entry should be immediately expired
      const expiresAt =
        this.ttl <= 0
          ? new Date(Date.now() - 1) // Set to 1ms in the past to ensure immediate expiration
          : new Date(Date.now() + this.ttl);

      cacheEntry = {
        skill,
        expiresAt,
      };
    }

    this.cache.set(key, cacheEntry);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (number of entries)
   * @returns {number} Current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   * @returns {{size: number; maxSize: number; hitRate: number}} Cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: DEFAULT_CACHE_HIT_RATE, // Placeholder - would need tracking for real hit rate
    };
  }

  /**
   * Check if cache contains key
   * @param {string} key - Cache key to check
   * @returns {boolean} True if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key from cache
   * @param {string} key - Cache key to delete
   * @returns {boolean} True if key was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}
