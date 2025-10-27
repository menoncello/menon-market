/**
 * Validation Service
 * Comprehensive validation framework for agent configurations
 */
import { AgentDefinition, ValidationResult } from '@menon-market/core';
import { z } from 'zod';
/**
 *
 */
export declare class ValidationService {
    /**
     * Validate complete agent definition
     * @param agent
     */
    validateAgent(agent: AgentDefinition): Promise<ValidationResult>;
    /**
     * Validate business rules
     * @param agent
     */
    private validateBusinessRules;
    /**
     * Validate performance requirements
     * @param agent
     */
    private validatePerformance;
    /**
     * Validate security requirements
     * @param agent
     */
    private validateSecurity;
    /**
     * Validate configuration consistency
     * @param agent
     */
    private validateConfigurationConsistency;
    /**
     * Validate template customization options
     * @param options
     * @param schema
     */
    validateCustomizationOptions(options: unknown, schema: z.ZodSchema): ValidationResult;
}
//# sourceMappingURL=ValidationService.d.ts.map