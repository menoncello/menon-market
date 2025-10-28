/**
 * Directory Structure Generator
 * Generates complete modular agent directory structures with templates
 * Supports all 7 agent types with MCP server integration
 */
import { AgentRole, AgentDefinition } from '@menon-market/core';
/**
 * Agent type configuration for directory generation
 */
interface AgentTypeConfig {
    role: AgentRole;
    name: string;
    packageScope: string;
    specializations: string[];
    coreSkills: string[];
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
}
/**
 * Performance metrics for directory generation
 */
interface GenerationMetrics {
    startTime: number;
    endTime: number;
    duration: number;
    filesCreated: number;
    directoriesCreated: number;
    memoryUsage: number;
}
/**
 * Directory Structure Generator Class
 * Implements AC 1 & 2: Template-based directory generation with MCP integration
 */
export declare class DirectoryStructureGenerator {
    private readonly agentsDir;
    /**
     * Agent type configurations for all 7 agent types
     */
    private readonly agentConfigs;
    /**
     * Standard directory structure for all agent types
     */
    private readonly baseDirectoryStructure;
    /**
     * Initialize the directory structure generator
     * @param projectRoot Root directory of the project
     */
    constructor(projectRoot?: string);
    /**
     * Generate complete directory structure for an agent
     * Performance target: <30 seconds per agent
     * @param agentType Type of agent to generate
     * @param agentDefinition Agent definition metadata
     * @param outputPath Custom output path (optional)
     */
    generateAgentDirectory(agentType: AgentRole, agentDefinition: AgentDefinition, outputPath?: string): Promise<{
        success: boolean;
        path: string;
        metrics: GenerationMetrics;
        errors?: string[];
    }>;
    /**
     * Generate directory name for agent
     * @param agentType Type of agent
     * @param agentId Unique agent identifier
     */
    private generateAgentDirectoryName;
    /**
     * Create directory structure recursively
     * @param basePath Base path for creation
     * @param structure Directory structure definition
     * @param templateVars Template variables
     * @param metrics Performance metrics
     */
    private createDirectoryStructure;
    /**
     * Generate file content from template
     * @param templatePath Path to template file
     * @param templateVars Template variables
     * @param additionalVars Additional template variables
     */
    private generateFileContent;
    /**
     * Get template content
     * @param templatePath Template file path
     */
    private getTemplateContent;
    /**
     * Get nested value from object using dot notation
     * @param obj Object to get value from
     * @param path Dot-separated path
     */
    private getNestedValue;
    /**
     * Validate generated directory structure
     * @param outputDir Generated directory path
     * @param agentType Agent type for validation rules
     */
    private validateGeneratedStructure;
    private generatePackageJsonTemplate;
    private generateTsconfigTemplate;
    private generatePrettierConfigTemplate;
    private generatePrettierConfigJsTemplate;
    private generateBunfigTemplate;
    /**
     * Get available agent types
     */
    getAvailableAgentTypes(): AgentRole[];
    /**
     * Get agent configuration for a specific type
     * @param agentType Agent type to get configuration for
     */
    getAgentConfig(agentType: AgentRole): AgentTypeConfig | undefined;
    /**
     * Validate agent type is supported
     * @param agentType Agent type to validate
     */
    isValidAgentType(agentType: string): agentType is AgentRole;
}
export {};
//# sourceMappingURL=DirectoryStructureGenerator.d.ts.map