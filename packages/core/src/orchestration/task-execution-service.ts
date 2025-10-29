/**
 * Task execution service for handling agent task execution logic
 *
 * This service provides simulated task execution capabilities for agents,
 * including tool selection, confidence calculation, and output generation.
 * It is designed to model the behavior of real agent execution for testing
 * and development purposes.
 *
 * @author BMAD Team
 * @version 1.0.0
 * @since 1.0.0
 */

import { AgentDefinition } from '../agents/types';
import { TaskExecutionResult, TaskDelegationRequest, TaskExecutionMetadata } from './types';

/**
 * Interface for execution parameters calculated during task execution
 */
interface ExecutionParameters {
  /** Tools selected for the task */
  toolsUsed: string[];
  /** Number of tool invocations */
  toolInvocations: number;
  /** Whether collaboration was used */
  collaborationUsed: boolean;
  /** Confidence score for the execution */
  confidence: number;
}

/**
 * Simple logging interface for task execution
 * In a production environment, this would be replaced with a proper logging framework
 */
interface Logger {
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, error?: Error) => void;
  debug: (message: string, data?: unknown) => void;
}

/**
 * No-op logger implementation for development
 * In production, replace with proper logging like Winston, Pino, etc.
 */
const noopLogger: Logger = {
  info: (_message: string, _data?: unknown) => {
    // Intentionally empty for development - replace with actual logging in production
  },
  warn: (_message: string, _data?: unknown) => {
    // Intentionally empty for development - replace with actual logging in production
  },
  error: (_message: string, _error?: Error) => {
    // Intentionally empty for development - replace with actual logging in production
  },
  debug: (_message: string, _data?: unknown) => {
    // Intentionally empty for development - replace with actual logging in production
  },
};

/** Base confidence score for task execution (0-100) */
const BASE_CONFIDENCE_SCORE = 75;

/** Maximum number of tool invocations for simulation */
const MAX_TOOL_INVOCATIONS = 5;

/** Minimum number of tool invocations for simulation */
const MIN_TOOL_INVOCATIONS = 1;

/** Collaboration threshold probability (0-1) */
const COLLABORATION_THRESHOLD = 0.7;

/** Minimum processing time in test environment (milliseconds) */
const MIN_PROCESSING_TIME_TEST = 10;

/** Minimum processing time in production environment (milliseconds) */
const MIN_PROCESSING_TIME_PROD = 500;

/** Maximum additional processing time in test environment (milliseconds) */
const MAX_ADDITIONAL_PROCESSING_TIME_TEST = 20;

/** Maximum additional processing time in production environment (milliseconds) */
const MAX_ADDITIONAL_PROCESSING_TIME_PROD = 1000;

/** Minimum simulated processing time in milliseconds */
const MIN_PROCESSING_TIME =
  process.env.NODE_ENV === 'test' ? MIN_PROCESSING_TIME_TEST : MIN_PROCESSING_TIME_PROD;

/** Maximum additional processing time in milliseconds */
const MAX_ADDITIONAL_PROCESSING_TIME =
  process.env.NODE_ENV === 'test'
    ? MAX_ADDITIONAL_PROCESSING_TIME_TEST
    : MAX_ADDITIONAL_PROCESSING_TIME_PROD;

/** Minimum confidence threshold for successful task completion (0-100) */
const SUCCESS_CONFIDENCE_THRESHOLD = 70;

/** Base success rate percentage for confidence calculation (0-100) */
const BASE_SUCCESS_RATE = 90;

/** Success rate weight factor for confidence calculation (0-1) */
const SUCCESS_RATE_WEIGHT_FACTOR = 0.5;

/** Tools score multiplier for confidence calculation */
const TOOLS_SCORE_MULTIPLIER = 10;

/** Maximum confidence score value (0-100) */
const MAX_CONFIDENCE_SCORE = 100;

/** Minimum confidence score value (0-100) */
const MIN_CONFIDENCE_SCORE = 0;

/** Maximum role-task alignment score */
const MAX_ROLE_ALIGNMENT_SCORE = 15;

/** Maximum number of core skills to display in task output */
const MAX_CORE_SKILLS_DISPLAY = 3;

/** Minimum confidence percentage for display in task output (0-100) */
const MIN_CONFIDENCE_DISPLAY = 80;

/** Confidence range for display variance in task output */
const CONFIDENCE_DISPLAY_RANGE = 20;

/**
 * Random number generator interface for task execution simulation
 */
interface RandomGenerator {
  generate: () => number;
}

/** LCG multiplier constant */
const LCG_MULTIPLIER = 1664525;

/** LCG increment constant */
const LCG_INCREMENT = 1013904223;

/** LCG modulus constant (2^32) */
const LCG_MODULUS = 4294967296;

/** Default test seed for reproducible testing */
const DEFAULT_TEST_SEED = 12345;

/**
 * Seeded random number generator for deterministic testing
 * Provides reproducible randomness for consistent test results
 */
class SeededRandomGenerator {
  private seed: number;

  /**
   * Create a new seeded random generator
   * @param {number} seed - Initial seed value
   */
  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generate next random number in sequence
   * @returns {number} Random number between 0 and 1
   */
  generate = (): number => {
    // Linear congruential generator (LCG) - simple but effective for simulation
    this.seed = (this.seed * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
    return this.seed / LCG_MODULUS;
  };
}

/**
 * Environment-based random generator selector
 */
class RandomGeneratorFactory {
  /**
   * Create appropriate random generator based on environment
   * @returns {RandomGenerator} Random generator instance
   */
  static create(): RandomGenerator {
    if (process.env.NODE_ENV === 'test') {
      // Use seeded random for testing to ensure reproducibility
      const testSeed = process.env.TEST_SEED
        ? Number.parseInt(process.env.TEST_SEED, 10)
        : DEFAULT_TEST_SEED;
      return new SeededRandomGenerator(testSeed);
    }

    // For development simulation, we can use a seeded generator with time-based seed
    // This provides better predictability than pure Math.random() while still varying
    return new SeededRandomGenerator(Date.now());
  }
}

/** Random generator instance for task execution */
const randomGenerator = RandomGeneratorFactory.create();

/**
 * Generate simulated random number for task execution
 *
 * This function uses a seeded random number generator to provide:
 * 1. Reproducible results in testing environments
 * 2. Deterministic behavior for debugging
 * 3. Consistent simulation without security implications
 *
 * @returns {number} Random number between 0 and 1
 */
function simulateRandomness(): number {
  return randomGenerator.generate();
}

/**
 * Generate simulated tool invocation count
 * @returns {number} Number of tool invocations between min and max
 */
function generateToolInvocations(): number {
  // Safe use of randomness for simulation purposes
  return Math.floor(simulateRandomness() * MAX_TOOL_INVOCATIONS) + MIN_TOOL_INVOCATIONS;
}

/**
 * Generate simulated processing time
 * @returns {number} Processing time in milliseconds
 */
function generateProcessingTime(): number {
  // Safe use of randomness for simulation purposes
  return simulateRandomness() * MAX_ADDITIONAL_PROCESSING_TIME + MIN_PROCESSING_TIME;
}

/**
 * Generate simulated confidence display percentage
 * @returns {number} Confidence percentage for display
 */
function generateConfidenceDisplay(): number {
  // Safe use of randomness for simulation purposes
  return Math.floor(simulateRandomness() * CONFIDENCE_DISPLAY_RANGE) + MIN_CONFIDENCE_DISPLAY;
}

/**
 * Task execution service for handling agent task execution logic
 *
 * This class provides simulated task execution capabilities that model
 * how agents would perform tasks in a real system. It includes:
 * - Tool selection based on task requirements and agent capabilities
 * - Confidence calculation based on agent skills and task alignment
 * - Simulated processing times and collaboration features
 * - Generated task outputs with detailed execution information
 *
 * @example
 * ```typescript
 * const service = new TaskExecutionService();
 * const result = await service.executeTask(agent, {
 *   agentId: 'frontend-dev-1',
 *   task: 'Create a React component for user profile'
 * }, metadata);
 * ```
 */
export class TaskExecutionService {
  private readonly logger: Logger;

  /**
   * Create a new TaskExecutionService instance
   * @param {Logger} logger - Logger instance for recording execution events
   */
  constructor(logger: Logger = noopLogger) {
    this.logger = logger;
  }
  /**
   * Execute a task using an agent (simulated implementation)
   * @param {AgentDefinition} agent - The agent to execute the task
   * @param {TaskDelegationRequest} request - The task delegation request
   * @param {TaskExecutionMetadata} _metadata - The task execution metadata (unused in simulation)
   * @returns {Promise<TaskExecutionResult>} The task execution result
   */
  async executeTask(
    agent: AgentDefinition,
    request: TaskDelegationRequest,
    _metadata: TaskExecutionMetadata
  ): Promise<TaskExecutionResult> {
    try {
      this.logTaskStart(agent, request);

      const executionParams = this.calculateExecutionParameters(agent, request.task);
      this.logExecutionParameters(executionParams);

      await this.simulateProcessing();
      const output = this.generateTaskOutput(agent, request.task);

      const result = this.buildTaskResult(executionParams, output);
      this.logTaskCompletion(result);

      return result;
    } catch (error) {
      this.logger.error('Error in executeTask', error as Error);
      // Return a fallback result
      return {
        success: false,
        output: `Error occurred during task execution: ${error instanceof Error ? error.message : String(error)}`,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
        errors: error instanceof Error ? [error.message] : [String(error)],
      };
    }
  }

  /**
   * Log the start of task execution
   * @param {AgentDefinition} agent - The agent executing the task
   * @param {TaskDelegationRequest} request - The task delegation request
   */
  private logTaskStart(agent: AgentDefinition, request: TaskDelegationRequest): void {
    this.logger.info('Starting task execution', {
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.role,
      task: request.task,
      priority: request.priority,
    });
  }

  /**
   * Calculate execution parameters for the task
   * @param {AgentDefinition} agent - The agent definition
   * @param {string} task - The task description
   * @returns {ExecutionParameters} Calculated execution parameters
   */
  private calculateExecutionParameters(agent: AgentDefinition, task: string): ExecutionParameters {
    const toolsUsed = this.selectToolsForTask(agent, task);
    const toolInvocations = generateToolInvocations();
    const collaborationUsed =
      agent.configuration.communication.collaboration.enabled &&
      simulateRandomness() > COLLABORATION_THRESHOLD;
    const confidence = this.calculateConfidence(agent, task, toolsUsed);

    return {
      toolsUsed,
      toolInvocations,
      collaborationUsed,
      confidence,
    };
  }

  /**
   * Log the calculated execution parameters
   * @param {ExecutionParameters} params - The execution parameters
   */
  private logExecutionParameters(params: ExecutionParameters): void {
    this.logger.debug('Task execution parameters calculated', params);
  }

  /**
   * Simulate task processing time
   * @returns {Promise<void>} Promise that resolves after simulated processing time
   */
  private async simulateProcessing(): Promise<void> {
    const processingTime = generateProcessingTime();
    this.logger.debug('Simulating processing time', { processingTime });
    await new Promise(resolve => setTimeout(resolve, processingTime));
  }

  /**
   * Build the final task result
   * @param {ExecutionParameters} params - The execution parameters
   * @param {string} output - The generated task output
   * @returns {TaskExecutionResult} The final task execution result
   */
  private buildTaskResult(params: ExecutionParameters, output: string): TaskExecutionResult {
    return {
      success: params.confidence > SUCCESS_CONFIDENCE_THRESHOLD,
      output,
      toolsUsed: params.toolsUsed,
      toolInvocations: params.toolInvocations,
      collaborationUsed: params.collaborationUsed,
      confidence: params.confidence,
    };
  }

  /**
   * Log the completion of task execution
   * @param {TaskExecutionResult} result - The task execution result
   */
  private logTaskCompletion(result: TaskExecutionResult): void {
    this.logger.info('Task execution completed', {
      success: result.success,
      confidence: result.confidence,
      toolsUsed: result.toolsUsed.length,
      toolInvocations: result.toolInvocations,
    });
  }

  /**
   * Select appropriate tools for a task based on agent capabilities
   * @param {AgentDefinition} agent - The agent definition
   * @param {string} task - The task description
   * @returns {string[]} Array of selected tool names
   */
  private selectToolsForTask(agent: AgentDefinition, task: string): string[] {
    const availableTools = agent.configuration.capabilities.allowedTools;
    const taskLower = task.toLowerCase();

    const selectedTools = this.findMatchingTools(taskLower, availableTools);

    return this.ensureDefaultTools(selectedTools, availableTools);
  }

  /**
   * Find tools that match the task keywords
   * @param {string} taskLower - Lowercase task description
   * @param {string[]} availableTools - Tools available to the agent
   * @returns {Set<string>} Set of matching tools
   */
  private findMatchingTools(taskLower: string, availableTools: string[]): Set<string> {
    const toolMapping: Record<string, string[]> = {
      file: ['Read', 'Write', 'Edit', 'Glob', 'Grep'],
      code: ['Read', 'Write', 'Edit', 'Grep'],
      test: ['Bash', 'Read', 'Write'],
      search: ['WebSearch', 'Grep', 'Glob'],
      web: ['WebFetch', 'WebSearch'],
      api: ['WebFetch', 'WebSearch'],
      fetch: ['WebFetch'],
      data: ['WebFetch', 'Read'],
      image: ['mcp__zai-mcp-server__analyze_image'],
      create: ['Write', 'Edit'],
      build: ['Bash', 'Read'],
      deploy: ['Bash', 'WebFetch'],
    };

    const selectedTools = new Set<string>();

    for (const [keyword, tools] of Object.entries(toolMapping)) {
      if (taskLower.includes(keyword)) {
        this.addAvailableTools(selectedTools, tools, availableTools);
      }
    }

    return selectedTools;
  }

  /**
   * Add available tools to the selected tools set
   * @param {Set<string>} selectedTools - Currently selected tools
   * @param {string[]} tools - Tools to check and potentially add
   * @param {string[]} availableTools - Tools available to the agent
   */
  private addAvailableTools(
    selectedTools: Set<string>,
    tools: string[],
    availableTools: string[]
  ): void {
    for (const tool of tools) {
      if (availableTools.includes(tool)) {
        selectedTools.add(tool);
      }
    }
  }

  /**
   * Ensure default tools are included if no specific tools were selected
   * @param {Set<string>} selectedTools - Currently selected tools
   * @param {string[]} availableTools - Tools available to the agent
   * @returns {string[]} Array of selected tool names
   */
  private ensureDefaultTools(selectedTools: Set<string>, availableTools: string[]): string[] {
    if (selectedTools.size === 0) {
      selectedTools.add('Read');
      if (availableTools.includes('Write')) {
        selectedTools.add('Write');
      }
    }

    return Array.from(selectedTools);
  }

  /**
   * Calculate confidence score for task execution
   * @param {AgentDefinition} agent - The agent definition
   * @param {string} task - The task description
   * @param {string[]} toolsUsed - Array of tools used for the task
   * @returns {number} The confidence score (0-100)
   */
  private calculateConfidence(agent: AgentDefinition, task: string, toolsUsed: string[]): number {
    let confidence = BASE_CONFIDENCE_SCORE;

    // Boost based on agent's success rate
    if (agent.metadata.metrics?.successRate) {
      confidence +=
        (agent.metadata.metrics.successRate - BASE_SUCCESS_RATE) * SUCCESS_RATE_WEIGHT_FACTOR;
    }

    // Boost based on tools availability
    const toolsScore =
      (toolsUsed.length / agent.configuration.capabilities.allowedTools.length) *
      TOOLS_SCORE_MULTIPLIER;
    confidence += toolsScore;

    // Boost based on role-task alignment
    const roleBoost = this.getRoleTaskAlignment(agent.role, task);
    confidence += roleBoost;

    return Math.min(MAX_CONFIDENCE_SCORE, Math.max(MIN_CONFIDENCE_SCORE, confidence));
  }

  /**
   * Get alignment score between agent role and task
   * @param {string} role - The agent role
   * @param {string} task - The task description
   * @returns {number} The alignment score (0-15)
   */
  private getRoleTaskAlignment(role: string, task: string): number {
    const taskLower = task.toLowerCase();
    const roleTaskMap: Record<string, string[]> = {
      FrontendDev: [
        'frontend',
        'ui',
        'component',
        'react',
        'css',
        'html',
        'javascript',
        'typescript',
      ],
      BackendDev: ['backend', 'api', 'server', 'database', 'node', 'express', 'microservice'],
      QA: ['test', 'testing', 'quality', 'automation', 'jest', 'cypress'],
      Architect: ['architecture', 'design', 'system', 'scalability', 'pattern'],
      'CLI Dev': ['cli', 'command', 'tool', 'script', 'automation'],
      'UX Expert': ['ux', 'user', 'experience', 'design', 'usability'],
      SM: ['scrum', 'agile', 'team', 'planning', 'retrospective'],
    };

    const keywords = roleTaskMap[role] || [];
    const matches = keywords.filter(keyword => taskLower.includes(keyword)).length;
    return (matches / Math.max(keywords.length, 1)) * MAX_ROLE_ALIGNMENT_SCORE;
  }

  /**
   * Generate task output based on agent role and task
   * @param {AgentDefinition} agent - The agent definition
   * @param {string} task - The task description
   * @returns {string} Generated task output in markdown format
   */
  private generateTaskOutput(agent: AgentDefinition, task: string): string {
    const timestamp = new Date().toISOString();

    return `# Task Execution Results

**Agent:** ${agent.name} (${agent.role})
**Task:** ${task}
**Completed:** ${timestamp}

## Summary

I have successfully completed the requested task using my expertise in ${agent.role.toLowerCase()}.
The execution leveraged my core skills in ${agent.coreSkills.slice(0, MAX_CORE_SKILLS_DISPLAY).join(', ')} and followed best practices for ${agent.role} work.

## Key Actions Taken

1. Analyzed the task requirements and identified optimal approach
2. Applied appropriate tools and methodologies
3. Executed the solution with attention to quality and standards
4. Validated results against expected outcomes

## Outcome

The task has been completed successfully with the following deliverables:
- High-quality implementation aligned with ${agent.role} standards
- Thorough testing and validation where applicable
- Documentation and best practices adherence

**Confidence:** High (${generateConfidenceDisplay()}%)
**Status:** Complete`;
  }
}
