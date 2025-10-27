/**
 * Task execution service for handling agent task execution logic
 */

import { AgentDefinition } from '../agents/types';
import { TaskExecutionResult, TaskDelegationRequest, TaskExecutionMetadata } from './types';

export class TaskExecutionService {
  /**
   * Execute a task using an agent (simulated implementation)
   * @param agent
   * @param request
   * @param _metadata
   */
  async executeTask(
    agent: AgentDefinition,
    request: TaskDelegationRequest,
    _metadata: TaskExecutionMetadata
  ): Promise<TaskExecutionResult> {
    // Simulate task execution based on agent role and task
    const toolsUsed = this.selectToolsForTask(agent, request.task);
    const toolInvocations = Math.floor(Math.random() * 5) + 1; // 1-5 tool invocations
    const collaborationUsed =
      agent.configuration.communication.collaboration.enabled && Math.random() > 0.7;
    const confidence = this.calculateConfidence(agent, request.task, toolsUsed);

    // Simulate processing time
    const processingTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Generate task-specific output
    const output = this.generateTaskOutput(agent, request.task);

    return {
      success: confidence > 70,
      output,
      toolsUsed,
      toolInvocations,
      collaborationUsed,
      confidence,
    };
  }

  /**
   * Select appropriate tools for a task based on agent capabilities
   * @param agent
   * @param task
   */
  private selectToolsForTask(agent: AgentDefinition, task: string): string[] {
    const availableTools = agent.configuration.capabilities.allowedTools;
    const taskLower = task.toLowerCase();

    const toolMapping: Record<string, string[]> = {
      file: ['Read', 'Write', 'Edit', 'Glob', 'Grep'],
      code: ['Read', 'Write', 'Edit', 'Grep'],
      test: ['Bash', 'Read', 'Write'],
      search: ['WebSearch', 'Grep', 'Glob'],
      web: ['WebFetch', 'WebSearch'],
      image: ['mcp__zai-mcp-server__analyze_image'],
      create: ['Write', 'Edit'],
      build: ['Bash', 'Read'],
      deploy: ['Bash', 'WebFetch'],
    };

    const selectedTools = new Set<string>();
    for (const [keyword, tools] of Object.entries(toolMapping)) {
      if (taskLower.includes(keyword)) {
        for (const tool of tools) {
          if (availableTools.includes(tool)) {
            selectedTools.add(tool);
          }
        }
      }
    }

    // Add some default tools if none selected
    if (selectedTools.size === 0) {
      selectedTools.add('Read');
      if (availableTools.includes('Write')) selectedTools.add('Write');
    }

    return Array.from(selectedTools);
  }

  /**
   * Calculate confidence score for task execution
   * @param agent
   * @param task
   * @param toolsUsed
   */
  private calculateConfidence(agent: AgentDefinition, task: string, toolsUsed: string[]): number {
    let confidence = 75; // Base confidence

    // Boost based on agent's success rate
    if (agent.metadata.metrics?.successRate) {
      confidence += (agent.metadata.metrics.successRate - 90) * 0.5;
    }

    // Boost based on tools availability
    const toolsScore =
      (toolsUsed.length / agent.configuration.capabilities.allowedTools.length) * 10;
    confidence += toolsScore;

    // Boost based on role-task alignment
    const roleBoost = this.getRoleTaskAlignment(agent.role, task);
    confidence += roleBoost;

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Get alignment score between agent role and task
   * @param role
   * @param task
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
    return (matches / Math.max(keywords.length, 1)) * 15;
  }

  /**
   * Generate task output based on agent role and task
   * @param agent
   * @param task
   */
  private generateTaskOutput(agent: AgentDefinition, task: string): string {
    const timestamp = new Date().toISOString();

    return `# Task Execution Results

**Agent:** ${agent.name} (${agent.role})
**Task:** ${task}
**Completed:** ${timestamp}

## Summary

I have successfully completed the requested task using my expertise in ${agent.role.toLowerCase()}.
The execution leveraged my core skills in ${agent.coreSkills.slice(0, 3).join(', ')} and followed best practices for ${agent.role} work.

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

**Confidence:** High (${Math.floor(Math.random() * 20) + 80}%)
**Status:** Complete`;
  }
}
