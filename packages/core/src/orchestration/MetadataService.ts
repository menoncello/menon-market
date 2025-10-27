/**
 * Metadata service for handling task execution metadata
 */

import { TaskExecutionMetadata, MetadataParams } from './types';
import { AgentDefinition } from '../agents/types';

export class MetadataService {
  constructor(private registeredAgents: Map<string, AgentDefinition>) {}

  /**
   * Create metadata from parameter object
   * @param params
   */
  createMetadata(params: MetadataParams): TaskExecutionMetadata {
    const basicMetadata = this.createBasicMetadata(
      params.agentId,
      params.startTime,
      params.endTime
    );
    return this.updateMetadataWithResults(
      basicMetadata,
      params.completedOnTime,
      params.toolsUsed,
      params.toolInvocations,
      params.collaborationUsed,
      params.confidence
    );
  }

  /**
   * Create basic metadata
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
   */
  private updateMetadataWithResults(
    metadata: TaskExecutionMetadata,
    completedOnTime: boolean,
    toolsUsed: string[],
    toolInvocations: number,
    collaborationUsed: boolean,
    confidence: number
  ): TaskExecutionMetadata {
    return {
      ...metadata,
      completedOnTime,
      toolsUsed,
      toolInvocations,
      collaborationUsed,
      confidence,
    };
  }
}
