/**
 * Skill Compatibility Validator
 * Provides validation for skill-agent compatibility checking
 */

import { SkillDefinition, AgentRole, ValidationError, CompatibilityLevel } from './types';

/**
 * Compatibility validation result
 */
export interface CompatibilityValidationResult {
  /** Whether the skill is compatible with the agent */
  compatible: boolean;

  /** Compatibility level */
  level: CompatibilityLevel;

  /** Validation issues found */
  issues: ValidationError[];
}

/**
 * Validates skill compatibility with specific agent roles
 */
export class CompatibilityValidator {
  /**
   * Validate skill compatibility with an agent role
   * @param {SkillDefinition} skill - Skill definition to validate
   * @param {AgentRole} agentRole - Agent role to check compatibility for
   * @returns {CompatibilityValidationResult} Compatibility validation result
   */
  validateCompatibility(
    skill: SkillDefinition,
    agentRole: AgentRole
  ): CompatibilityValidationResult {
    const issues: ValidationError[] = [];

    const compatibility = skill.compatibility.find(comp => comp.agentRole === agentRole);

    if (compatibility === undefined) {
      issues.push(this.createNoCompatibilityIssue(agentRole));
      return { compatible: false, level: 'limited', issues };
    }

    const levelIssues = this.validateCompatibilityLevel(compatibility, agentRole);
    const restrictionIssues = this.validateRestrictions(compatibility, agentRole);
    const enhancementIssues = this.validateEnhancements(compatibility);

    return {
      compatible: true,
      level: compatibility.level,
      issues: [...levelIssues, ...restrictionIssues, ...enhancementIssues],
    };
  }

  /**
   * Create issue for missing compatibility information
   * @param {AgentRole} agentRole - Agent role with no compatibility info
   * @returns {ValidationError} Validation error
   */
  private createNoCompatibilityIssue(agentRole: AgentRole): ValidationError {
    return {
      category: 'compatibility',
      message: `No compatibility information found for agent role: ${agentRole}`,
      severity: 'error',
      suggestion: `Add compatibility entry for ${agentRole} or use a more generic skill`,
    };
  }

  /**
   * Validate compatibility level and generate appropriate issues
   * @param {{level: CompatibilityLevel}} compatibility - Compatibility entry to validate
   * @param {CompatibilityLevel} compatibility.level - Compatibility level to validate
   * @param {AgentRole} agentRole - Agent role being validated
   * @returns {ValidationError[]} Array of validation issues
   */
  private validateCompatibilityLevel(
    compatibility: { level: CompatibilityLevel },
    agentRole: AgentRole
  ): ValidationError[] {
    const issues: ValidationError[] = [];
    const { level } = compatibility;

    if (level === 'limited') {
      issues.push({
        category: 'compatibility',
        message: `Limited compatibility for ${agentRole} - consider alternative skills`,
        severity: 'warning',
        suggestion: 'Look for skills with better compatibility or enhance this skill',
      });
    }

    if (level === 'partial') {
      issues.push({
        category: 'compatibility',
        message: `Partial compatibility for ${agentRole} - some features may be limited`,
        severity: 'warning',
        suggestion: 'Review compatibility restrictions and consider workarounds',
      });
    }

    return issues;
  }

  /**
   * Validate compatibility restrictions
   * @param {{restrictions?: string[]}} compatibility - Compatibility entry to validate
   * @param {string[]} compatibility.restrictions - Array of compatibility restrictions
   * @param {AgentRole} agentRole - Agent role being validated
   * @returns {ValidationError[]} Array of validation issues
   */
  private validateRestrictions(
    compatibility: { restrictions?: string[] },
    agentRole: AgentRole
  ): ValidationError[] {
    const issues: ValidationError[] = [];

    if (compatibility.restrictions && compatibility.restrictions.length > 0) {
      issues.push({
        category: 'compatibility',
        message: `Skill has ${compatibility.restrictions.length} restrictions for ${agentRole}`,
        severity: 'warning',
        suggestion: "Review restrictions to ensure they don't limit required functionality",
      });
    }

    return issues;
  }

  /**
   * Validate enhancements for partial/limited compatibility
   * @param {{level: CompatibilityLevel, enhancements?: string[]}} compatibility - Compatibility entry to validate
   * @param {CompatibilityLevel} compatibility.level - Compatibility level to validate
   * @param {string[]} compatibility.enhancements - Available enhancements for the compatibility level
   * @returns {ValidationError[]} Array of validation issues
   */
  private validateEnhancements(compatibility: {
    level: CompatibilityLevel;
    enhancements?: string[];
  }): ValidationError[] {
    const issues: ValidationError[] = [];
    const { level, enhancements } = compatibility;

    if (
      (level === 'partial' || level === 'limited') &&
      (!enhancements || enhancements.length === 0)
    ) {
      issues.push({
        category: 'compatibility',
        message: `${level.charAt(0).toUpperCase() + level.slice(1)} compatibility should specify available enhancements`,
        severity: 'warning',
        suggestion:
          'Document what enhancements are available even with partial/limited compatibility',
      });
    }

    return issues;
  }

  /**
   * Check if skill is compatible with any of the specified agent roles
   * @param {SkillDefinition} skill - Skill definition to check
   * @param {AgentRole[]} agentRoles - Array of agent roles to check against
   * @returns {CompatibilityValidationResult[]} Array of compatibility results for each agent role
   */
  validateMultipleCompatibility(
    skill: SkillDefinition,
    agentRoles: AgentRole[]
  ): CompatibilityValidationResult[] {
    return agentRoles.map(role => this.validateCompatibility(skill, role));
  }

  /**
   * Get all compatible agent roles for a skill
   * @param {SkillDefinition} skill - Skill definition to check
   * @param {'full'|'partial'|'limited'} minLevel - Minimum compatibility level required
   * @returns {AgentRole[]} Array of compatible agent roles
   */
  getCompatibleAgents(
    skill: SkillDefinition,
    minLevel: CompatibilityLevel = 'limited'
  ): AgentRole[] {
    const levelPriority: Record<CompatibilityLevel, number> = {
      unknown: 0,
      limited: 1,
      partial: 2,
      compatible: 3,
      optimal: 4,
      full: 5,
    };
    const minPriority = levelPriority[minLevel];

    return skill.compatibility
      .filter(comp => levelPriority[comp.level] >= minPriority)
      .map(comp => comp.agentRole);
  }

  /**
   * Check if skill has compatibility information
   * @param {SkillDefinition} skill - Skill definition to validate
   * @returns {{valid: boolean, issues: ValidationError[]}} Validation result for compatibility completeness
   */
  validateCompatibilityCompleteness(skill: SkillDefinition): {
    valid: boolean;
    issues: ValidationError[];
  } {
    const issues: ValidationError[] = [];

    if (!skill.compatibility || skill.compatibility.length === 0) {
      issues.push(this.createNoCompatibilityEntriesIssue());
      return { valid: false, issues };
    }

    const duplicateIssues = this.validateDuplicateEntries(skill.compatibility);
    const entryIssues = this.validateCompatibilityEntries(skill.compatibility);

    return {
      valid: this.hasNoErrors([...duplicateIssues, ...entryIssues]),
      issues: [...duplicateIssues, ...entryIssues],
    };
  }

  /**
   * Create issue for missing compatibility entries
   * @returns {ValidationError} Validation error
   */
  private createNoCompatibilityEntriesIssue(): ValidationError {
    return {
      category: 'compatibility',
      message: 'Skill must have at least one agent compatibility',
      severity: 'error',
      suggestion: 'Specify which agent types can use this skill',
    };
  }

  /**
   * Validate for duplicate compatibility entries
   * @param {{agentRole: string}[]} compatibility - Array of compatibility entries
   * @returns {ValidationError[]} Array of validation issues
   */
  private validateDuplicateEntries(compatibility: Array<{ agentRole: string }>): ValidationError[] {
    const issues: ValidationError[] = [];
    const agentRoles = compatibility.map(comp => comp.agentRole);
    const duplicates = agentRoles.filter((role, index) => agentRoles.indexOf(role) !== index);

    if (duplicates.length > 0) {
      issues.push({
        category: 'compatibility',
        message: `Duplicate compatibility entries found for agent roles: ${[...new Set(duplicates)].join(', ')}`,
        severity: 'error',
        suggestion: 'Remove duplicate compatibility entries',
      });
    }

    return issues;
  }

  /**
   * Validate individual compatibility entries
   * @param {{agentRole: string, level?: CompatibilityLevel}[]} compatibility - Array of compatibility entries
   * @returns {ValidationError[]} Array of validation issues
   */
  private validateCompatibilityEntries(
    compatibility: Array<{ agentRole: string; level?: CompatibilityLevel }>
  ): ValidationError[] {
    const issues: ValidationError[] = [];

    for (const comp of compatibility) {
      if (!comp.level) {
        issues.push({
          category: 'compatibility',
          message: `Compatibility level is required for agent role: ${comp.agentRole}`,
          severity: 'error',
          suggestion: 'Specify compatibility level (full, partial, or limited)',
        });
      }
    }

    return issues;
  }

  /**
   * Check if validation issues contain any errors
   * @param {ValidationError[]} issues - Array of validation issues
   * @returns {boolean} True if no error-level issues found
   */
  private hasNoErrors(issues: ValidationError[]): boolean {
    return issues.filter(issue => issue.severity === 'error').length === 0;
  }
}
