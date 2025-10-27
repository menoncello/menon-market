/**
 * Agent Validation Methods
 * Extracted from TestingFramework to reduce file length
 */
import { AgentDefinition, AgentTemplate } from '@menon-market/core';
import { TestResult } from './TestingFramework';
/**
 * Agent Validation Service
 */
export declare class AgentValidationService {
    /**
     * Validate agent structure
     */
    validateAgentStructure(agent: AgentDefinition): Promise<TestResult>;
    /**
     * Validate agent role
     */
    validateAgentRole(agent: AgentDefinition): Promise<TestResult>;
    /**
     * Validate agent configuration
     */
    validateAgentConfiguration(agent: AgentDefinition): Promise<TestResult>;
    /**
     * Validate agent performance
     */
    validateAgentPerformance(agent: AgentDefinition): Promise<TestResult>;
    /**
     * Validate agent generation from template
     */
    validateAgentGeneration(template: AgentTemplate): Promise<TestResult>;
    /**
     * Validate required agent fields
     */
    private validateRequiredFields;
    /**
     * Validate goals array
     */
    private validateGoalsArray;
    /**
     * Validate core skills array
     */
    private validateCoreSkillsArray;
    /**
     * Validate agent role value
     */
    private validateRoleValue;
    /**
     * Validate agent content matches role expectations
     */
    private validateRoleContentMatch;
    /**
     * Get role requirements mapping
     */
    private getRoleRequirements;
    /**
     * Get agent text for content matching
     */
    private getAgentText;
}
//# sourceMappingURL=AgentValidationService.d.ts.map