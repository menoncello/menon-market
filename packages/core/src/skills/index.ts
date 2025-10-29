/**
 * Skills Module Index
 * Exports all skill-related types, interfaces, and functionality
 */

// Export core types and interfaces
export * from './types';

// Re-export key types for easier access
export type {
  SkillDomain,
  SkillCategory,
  CompatibilityLevel,
  CapabilityType,
  ResourceType,
  DifficultyLevel,
  ValidationCategory,
  CapabilityPerformance,
} from './types';

// Export skill registry and loader
export * from './registry';
export * from './loader';

// Export validation and testing with explicit exports to avoid conflicts
export type { SkillValidationRule } from './validation';
export { SkillValidator, validateSkill, checkCompatibility } from './validation';
export * from './testing';

// Export test helpers for unit testing
export * from './test-helpers';

// Re-export commonly used utilities
export { getSkillRegistry, resetSkillRegistry } from './registry';
export { testSkill, defaultSkillTester } from './testing';
