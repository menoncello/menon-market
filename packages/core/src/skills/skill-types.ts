/**
 * Enum-like type aliases for skill types
 * Provides centralized definition of commonly used union types
 */

/**
 * Resource usage levels for skills and capabilities
 */
export type ResourceUsageLevel = 'low' | 'medium' | 'high';

/**
 * Complexity levels for skills and capabilities
 */
export type ComplexityLevel = 'low' | 'medium' | 'high';

/**
 * Skill domains representing major technical areas
 */
export type SkillDomain =
  | 'frontend'
  | 'backend'
  | 'testing'
  | 'architecture'
  | 'cli'
  | 'ux'
  | 'project-management'
  | 'cross-cutting';

/**
 * Skill categories within domains for organization and discovery
 */
export type SkillCategory =
  // Frontend categories
  | 'ui-patterns'
  | 'component-libraries'
  | 'styling'
  | 'state-management'
  | 'frontend-frameworks'
  | 'frontend-tools'
  // Backend categories
  | 'api-design'
  | 'databases'
  | 'authentication'
  | 'microservices'
  | 'cloud-services'
  | 'backend-frameworks'
  // Testing categories
  | 'unit-testing'
  | 'integration-testing'
  | 'e2e-testing'
  | 'performance-testing'
  | 'testing-frameworks'
  // Architecture categories
  | 'system-design'
  | 'design-patterns'
  | 'scalability'
  | 'security'
  | 'architecture-patterns'
  // CLI categories
  | 'command-line-tools'
  | 'scripting'
  | 'automation'
  | 'cli-frameworks'
  // UX categories
  | 'user-research'
  | 'interaction-design'
  | 'usability-testing'
  | 'design-systems'
  // Project management categories
  | 'planning'
  | 'tracking'
  | 'coordination'
  | 'documentation'
  // Cross-cutting categories
  | 'performance'
  | 'accessibility'
  | 'monitoring'
  // Source-based categories
  | 'package'
  | 'url'
  | 'registry';

/**
 * Compatibility levels for agent-skill pairing
 */
export type CompatibilityLevel =
  | 'unknown'
  | 'limited'
  | 'partial'
  | 'compatible'
  | 'optimal'
  | 'full';

/**
 * Types of capabilities provided by skills
 */
export type CapabilityType =
  | 'action'
  | 'knowledge'
  | 'tool'
  | 'pattern'
  | 'framework'
  | 'methodology';

/**
 * Types of learning resources
 */
export type ResourceType =
  | 'documentation'
  | 'tutorial'
  | 'example'
  | 'video'
  | 'article'
  | 'book'
  | 'course';

/**
 * Difficulty levels for resources and skills
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Skill sorting options
 */
export type SkillSortOrder =
  | 'name'
  | 'domain'
  | 'category'
  | 'version'
  | 'created'
  | 'updated'
  | 'usage'
  | 'rating'
  | 'complexity';

/**
 * Validation categories
 */
export type ValidationCategory =
  | 'schema'
  | 'dependencies'
  | 'compatibility'
  | 'performance'
  | 'security'
  | 'documentation'
  | 'testing'
  | 'quality';

/**
 * Performance trend types
 */
export type PerformanceTrend = 'increasing' | 'decreasing' | 'stable';

/**
 * Overall performance health indicators
 */
export type PerformanceHealth = 'improving' | 'declining' | 'stable';

/**
 * Complexity levels for skill performance
 */
export type SkillComplexity = 'simple' | 'moderate' | 'complex' | 'expert';

/**
 * Network usage levels
 */
export type NetworkUsageLevel = 'none' | 'low' | 'medium' | 'high';

/**
 * Usage trend indicators
 */
export type UsageTrend = 'increasing' | 'stable' | 'decreasing';

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';
