/**
 * Core agent definition types for ClaudeCode SuperPlugin ecosystem
 * Defines the structure and schema for agent types and configurations
 */
/**
 * Complete agent definition interface
 * Encompasses role definition, goals, backstory, core skills, and learning mode
 */
export interface AgentDefinition {
    /** Unique identifier for the agent type */
    id: string;
    /** Human-readable name of the agent */
    name: string;
    /** Detailed description of the agent's purpose and capabilities */
    description: string;
    /** Agent role category (FrontendDev, BackendDev, QA, Architect, CLI Dev, UX Expert, SM) */
    role: AgentRole;
    /** Primary objectives this agent is designed to achieve */
    goals: string[];
    /** Agent backstory and personality traits */
    backstory: string;
    /** Core technical and domain skills this agent possesses */
    coreSkills: string[];
    /** Learning and adaptation mode for the agent */
    learningMode: LearningMode;
    /** Configuration parameters specific to this agent type */
    configuration: AgentConfiguration;
    /** Metadata about the agent */
    metadata: AgentMetadata;
}
/**
 * Predefined agent roles in the ecosystem
 */
export type AgentRole = 'FrontendDev' | 'BackendDev' | 'QA' | 'Architect' | 'CLI Dev' | 'UX Expert' | 'SM' | 'Custom';
/**
 * Learning modes supported by agents
 */
export type LearningMode = 'adaptive' | 'static' | 'collaborative' | 'autonomous';
/**
 * Agent-specific configuration parameters
 */
export interface AgentConfiguration {
    /** Performance requirements and constraints */
    performance: PerformanceConfig;
    /** Tool and capability access levels */
    capabilities: CapabilityConfig;
    /** Communication and interaction preferences */
    communication: CommunicationConfig;
    /** Custom parameters for specific agent types */
    customParams?: Record<string, unknown>;
}
/**
 * Performance configuration for agents
 */
export interface PerformanceConfig {
    /** Maximum execution time per task in seconds */
    maxExecutionTime: number;
    /** Memory usage limits in MB */
    memoryLimit: number;
    /** Concurrent task handling capacity */
    maxConcurrentTasks: number;
    /** Priority level (1-10, 10 being highest) */
    priority: number;
}
/**
 * Capability and access control configuration
 */
export interface CapabilityConfig {
    /** List of tools this agent can use */
    allowedTools: string[];
    /** File system access permissions */
    fileSystemAccess: FileSystemAccess;
    /** Network access permissions */
    networkAccess: NetworkAccess;
    /** Integration permissions with other agents */
    agentIntegration: boolean;
}
/**
 * File system access permissions
 */
export interface FileSystemAccess {
    /** Can read files */
    read: boolean;
    /** Can write files */
    write: boolean;
    /** Can execute files */
    execute: boolean;
    /** Restricted directories (if any) */
    restrictedPaths?: string[];
    /** Allowed directories (if restricted) */
    allowedPaths?: string[];
}
/**
 * Network access permissions
 */
export interface NetworkAccess {
    /** Can make HTTP requests */
    http: boolean;
    /** Can make HTTPS requests */
    https: boolean;
    /** Can access external APIs */
    externalApis: boolean;
    /** Allowed domains (if restricted) */
    allowedDomains?: string[];
}
/**
 * Communication configuration
 */
export interface CommunicationConfig {
    /** Preferred communication style */
    style: CommunicationStyle;
    /** Response format preferences */
    responseFormat: ResponseFormat;
    /** Collaboration settings */
    collaboration: CollaborationConfig;
}
/**
 * Communication style preferences
 */
export type CommunicationStyle = 'formal' | 'casual' | 'technical' | 'educational' | 'concise' | 'detailed';
/**
 * Response format preferences
 */
export type ResponseFormat = 'markdown' | 'json' | 'xml' | 'plain-text' | 'structured';
/**
 * Collaboration settings
 */
export interface CollaborationConfig {
    /** Can work with other agents */
    enabled: boolean;
    /** Preferred collaboration roles */
    roles: CollaborationRole[];
    /** Conflict resolution approach */
    conflictResolution: ConflictResolutionStyle;
}
/**
 * Collaboration roles this agent can take
 */
export type CollaborationRole = 'leader' | 'contributor' | 'reviewer' | 'implementer' | 'tester' | 'coordinator';
/**
 * Conflict resolution styles
 */
export type ConflictResolutionStyle = 'collaborative' | 'competitive' | 'compromise' | 'avoidance' | 'accommodation';
/**
 * Agent metadata
 */
export interface AgentMetadata {
    /** Creation timestamp */
    createdAt: Date;
    /** Last updated timestamp */
    updatedAt: Date;
    /** Version of the agent definition */
    version: string;
    /** Author of the agent definition */
    author: string;
    /** Tags for categorization and search */
    tags: string[];
    /** Dependencies on other agents or tools */
    dependencies: string[];
    /** Performance metrics from previous executions */
    metrics?: AgentMetrics;
}
/**
 * Performance metrics for agents
 */
export interface AgentMetrics {
    /** Average task completion time */
    avgCompletionTime: number;
    /** Success rate percentage */
    successRate: number;
    /** Total tasks completed */
    tasksCompleted: number;
    /** User satisfaction rating (1-5) */
    satisfactionRating: number;
    /** Last performance evaluation date */
    lastEvaluated: Date;
}
/**
 * Agent template for creating new agent configurations
 */
export interface AgentTemplate {
    /** Template identifier */
    id: string;
    /** Template name */
    name: string;
    /** Template description */
    description: string;
    /** Base agent role this template extends */
    baseRole: AgentRole;
    /** Template configuration with placeholders */
    template: Omit<AgentDefinition, 'id' | 'metadata'>;
    /** Customization options for this template */
    customizationOptions: CustomizationOption[];
    /** Template metadata */
    templateMetadata: TemplateMetadata;
}
/**
 * Customization options for agent templates
 */
export interface CustomizationOption {
    /** Option identifier */
    id: string;
    /** Option name */
    name: string;
    /** Option description */
    description: string;
    /** Data type for this option */
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    /** Default value */
    defaultValue: unknown;
    /** Whether this option is required */
    required: boolean;
    /** Validation rules for this option */
    validation?: ValidationRule[];
}
/**
 * Validation rules for customization options
 */
export interface ValidationRule {
    /** Rule type */
    type: 'required' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';
    /** Rule parameters */
    params: Record<string, unknown>;
    /** Error message for validation failures */
    message: string;
}
/**
 * Template metadata
 */
export interface TemplateMetadata {
    /** Template creation date */
    createdAt: Date;
    /** Template author */
    author: string;
    /** Template version */
    version: string;
    /** Usage statistics */
    usageCount: number;
    /** User ratings */
    averageRating: number;
}
/**
 * Agent creation request payload
 */
export interface CreateAgentRequest {
    /** Agent definition or template reference */
    definition: AgentDefinition | string;
    /** Customization parameters (if using template) */
    customizations?: Record<string, unknown>;
    /** Creation options */
    options: CreationOptions;
}
/**
 * Agent creation options
 */
export interface CreationOptions {
    /** Skip validation (not recommended) */
    skipValidation?: boolean;
    /** Dry run - validate without creating */
    dryRun?: boolean;
    /** Return detailed creation log */
    verbose?: boolean;
    /** Override performance defaults */
    performanceOverrides?: Partial<PerformanceConfig>;
}
/**
 * Agent creation response
 */
export interface CreateAgentResponse {
    /** Whether creation was successful */
    success: boolean;
    /** Created agent definition */
    agent?: AgentDefinition;
    /** Creation metadata */
    metadata: CreationMetadata;
    /** Errors (if any) */
    errors?: string[];
    /** Warnings (if any) */
    warnings?: string[];
}
/**
 * Creation metadata
 */
export interface CreationMetadata {
    /** Creation timestamp */
    createdAt: Date;
    /** Time taken to create in milliseconds */
    creationTime: number;
    /** Whether performance targets were met */
    performanceTargetMet: boolean;
    /** Validation results */
    validationResults: ValidationResult[];
}
/**
 * Validation result for agent creation
 */
export interface ValidationResult {
    /** Validation category */
    category: 'schema' | 'performance' | 'security' | 'compatibility' | 'custom';
    /** Whether validation passed */
    passed: boolean;
    /** Validation message */
    message: string;
    /** Validation details */
    details?: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map