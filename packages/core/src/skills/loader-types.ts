/**
 * Skill Loading Types
 * Type definitions used across skill loading implementations
 */

/**
 * Base skill configuration interface
 */
export interface BaseSkillConfig {
  skillPath: string;
  name: string;
  description: string;
  category: import('./skill-types').SkillCategory;
  author: string;
  tags: string[];
  resourceUsage: {
    memory: import('./skill-types').ResourceUsageLevel;
    cpu: import('./skill-types').ResourceUsageLevel;
    network: import('./skill-types').NetworkUsageLevel;
  };
}
