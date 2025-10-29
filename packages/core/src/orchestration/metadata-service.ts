/**
 * Metadata service for handling task execution metadata
 */

import { AgentDefinition } from '../agents/types';
import { TaskExecutionMetadata, MetadataParams } from './types';

/**
 * Interface for execution results parameters
 */
interface ExecutionResults {
  /** Whether the task completed on time */
  completedOnTime: boolean;

  /** Array of tool names used during execution */
  toolsUsed: string[];

  /** Number of tool invocations made */
  toolInvocations: number;

  /** Whether collaboration was used */
  collaborationUsed: boolean;

  /** Confidence score of the execution (0-100) */
  confidence: number;
}

/**
 * Metadata service for handling task execution metadata
 */
export class MetadataService {
  /**
   * Create a new MetadataService instance
   * @param {Map<string, AgentDefinition>} registeredAgents - Map of registered agent definitions keyed by agent ID
   */
  constructor(private registeredAgents: Map<string, AgentDefinition>) {}

  /**
   * Create metadata from parameter object
   * @param {MetadataParams} params - Metadata parameters object
   * @returns {TaskExecutionMetadata} The created task execution metadata
   */
  createMetadata(params: MetadataParams): TaskExecutionMetadata {
    const basicMetadata = this.createBasicMetadata(
      params.agentId,
      params.startTime,
      params.endTime
    );

    const executionResults: ExecutionResults = {
      completedOnTime: params.completedOnTime,
      toolsUsed: params.toolsUsed,
      toolInvocations: params.toolInvocations,
      collaborationUsed: params.collaborationUsed,
      confidence: params.confidence,
    };

    return this.updateMetadataWithResults(basicMetadata, executionResults);
  }

  /**
   * Create basic metadata
   * @param {string} agentId - The agent identifier
   * @param {Date} startTime - The task start time
   * @param {Date} endTime - The task end time
   * @returns {TaskExecutionMetadata} The basic metadata object
   */
  private createBasicMetadata(
    agentId: string,
    startTime: Date,
    endTime: Date
  ): TaskExecutionMetadata {
    return {
      agentId,
      agentRole: this.registeredAgents.get(agentId)?.role || 'Unknown',
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      completedOnTime: false,
      toolsUsed: [],
      toolInvocations: 0,
      collaborationUsed: false,
      confidence: 0,
    };
  }

  /**
   * Update metadata with execution results
   * @param {TaskExecutionMetadata} metadata - The basic metadata to update
   * @param {ExecutionResults} results - Execution results to apply to the metadata
   * @returns {TaskExecutionMetadata} The updated metadata object
   */
  private updateMetadataWithResults(
    metadata: TaskExecutionMetadata,
    results: ExecutionResults
  ): TaskExecutionMetadata {
    return {
      ...metadata,
      completedOnTime: results.completedOnTime,
      toolsUsed: results.toolsUsed,
      toolInvocations: results.toolInvocations,
      collaborationUsed: results.collaborationUsed,
      confidence: results.confidence,
    };
  }
}
