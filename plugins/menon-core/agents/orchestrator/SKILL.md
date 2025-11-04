---
name: orchestrator-agent
description: Advanced orchestration agent for managing subagents, commands, MCP servers, and skills with parallel execution capabilities
category: automation
tags: [orchestration, agent-management, task-planning, parallel-execution, resource-optimization]
triggers:
  - type: keyword
    pattern: "orchestrat"
    priority: 3
  - type: keyword
    pattern: "manage agents"
    priority: 3
  - type: keyword
    pattern: "agent management"
    priority: 3
  - type: keyword
    pattern: "coordinate multiple"
    priority: 3
  - type: keyword
    pattern: "coordinate agents"
    priority: 3
  - type: keyword
    pattern: "task planning"
    priority: 2
  - type: keyword
    pattern: "workflow planning"
    priority: 2
  - type: keyword
    pattern: "parallel execution"
    priority: 2
  - type: keyword
    pattern: "simultaneous tasks"
    priority: 2
  - type: keyword
    pattern: "resource optimization"
    priority: 2
  - type: keyword
    pattern: "discover agents"
    priority: 3
  - type: keyword
    pattern: "find agents"
    priority: 3

parameters:
  - name: action
    type: string
    description: The orchestration action to perform
    required: true
    validation:
      pattern: "^(create-task|execute-task|manage-agents|optimize-resources|discover-components|plan-workflow|monitor-execution)$"
      message: "Action must be one of: create-task, execute-task, manage-agents, optimize-resources, discover-components, plan-workflow, monitor-execution"

  - name: task_description
    type: string
    description: Description of the task to orchestrate
    required: false
    validation:
      minLength: 10
      message: "Task description must be at least 10 characters long"

  - name: agents
    type: array
    description: List of agents to involve in orchestration
    required: false
    items:
      type: string

  - name: priority
    type: number
    description: Task priority (1-10)
    required: false
    default: 5
    validation:
      minimum: 1
      maximum: 10

  - name: parallel_execution
    type: boolean
    description: Enable parallel execution when possible
    required: false
    default: true

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - WebFetch
  - Task

triggers:
  - "orchestrate task execution"
  - "manage multiple agents"
  - "plan complex workflow"
  - "optimize resource allocation"
  - "coordinate parallel execution"
  - "discover available agents"
  - "monitor task progress"
  - "allocate skills to tasks"

examples:
  - input: "Create task plan for security audit with parallel execution"
    output: "Created task plan with 5 subtasks optimized for parallel execution using security-specialized agents"
  - input: "Discover all available agents and their capabilities"
    output: "Discovered 23 agents with detailed capability mapping and performance metrics"
  - input: "Execute workflow for code review with multiple agents"
    output: "Coordinated 3 agents (code-reviewer, security-analyzer, documentation-reviewer) in parallel for comprehensive review"

requirements:
  - "Node.js 18+ for agent coordination"
  - "Sufficient memory for parallel agent execution"
  - "Network connectivity for agent discovery"
  - "Write permissions for task management"

limitations:
  - "Maximum parallel agents: 10"
  - "Task timeout: 5 minutes"
  - "Maximum concurrent workflows: 5"
  - "Skill matching threshold: 0.7"
---

# Orchestrator Agent

## Overview

The Orchestrator Agent is an advanced coordination system for managing Claude Code agents, commands, MCP servers, and skills. It provides intelligent task planning, parallel execution optimization, and resource management capabilities.

## When to Use This Agent

Use this agent when you need to:

- Coordinate multiple agents for complex tasks
- Plan and execute multi-step workflows
- Optimize resource allocation and parallel execution
- Discover and analyze available agents and skills
- Monitor and manage task execution
- Allocate skills to specific tasks intelligently
- Handle complex dependency chains

## Capabilities

### Task Planning and Execution

- Create comprehensive task plans with dependencies
- Execute tasks in parallel when possible
- Handle task priorities and deadlines
- Manage task lifecycles from creation to completion
- Automatic retry and error recovery

### Agent Management

- Discover available agents dynamically
- Track agent performance and capabilities
- Coordinate agent selection for specific tasks
- Monitor agent availability and status
- Load balancing across multiple agents

### Resource Optimization

- Dynamic resource allocation based on workload
- Performance monitoring and bottleneck detection
- Automatic scaling and optimization
- Resource pool management
- Conflict resolution and prioritization

### Skill Allocation

- Intelligent skill-to-task matching
- Skill dependency analysis
- Performance-based skill selection
- Real-time skill availability tracking
- Cross-agent skill coordination

## Usage Examples

### Basic Task Orchestration

```typescript
import OrchestratorAgent from './index';

const orchestrator = new OrchestratorAgent({
  maxParallelAgents: 5,
  skillMatchingThreshold: 0.8,
});

await orchestrator.initialize();

// Create task plan
const taskId = await orchestrator.createTaskPlan('Code review project', {
  requiredSkills: ['code-review', 'security-analysis'],
  priority: 1,
  parallelExecution: true,
});

// Execute task
await orchestrator.executeTask(taskId);
```

### Advanced Workflow Management

```typescript
// Discover available agents
const agents = orchestrator.getAvailableAgents();

// Plan complex workflow
const workflowId = await orchestrator.planWorkflow({
  name: 'Feature development pipeline',
  steps: [
    { name: 'requirements-analysis', agents: ['general-purpose'] },
    { name: 'architecture-design', agents: ['feature-dev:code-architect'] },
    { name: 'implementation', agents: ['general-purpose'], parallel: true },
    { name: 'testing', agents: ['general-purpose'], parallel: true },
    { name: 'documentation', agents: ['pr-review-toolkit:comment-analyzer'] },
  ],
  dependencies: {
    'architecture-design': ['requirements-analysis'],
    implementation: ['architecture-design'],
    testing: ['implementation'],
    documentation: ['testing'],
  },
});

// Execute workflow
await orchestrator.executeWorkflow(workflowId);
```

### Resource Optimization

```typescript
// Optimize resource allocation
const optimization = await orchestrator.optimizeResources();
console.log('Optimizations applied:', optimization.optimizations);
console.log('Recommendations:', optimization.recommendations);

// Monitor performance
const status = orchestrator.getSystemStatus();
console.log('Active tasks:', status.activeTasks.length);
console.log(
  'Agent utilization:',
  status.agents.filter((a) => a.status === 'busy').length
);
```

## Configuration

### Basic Configuration

```typescript
const orchestrator = new OrchestratorAgent({
  maxParallelAgents: 10,
  taskTimeout: 300000,
  retryAttempts: 3,
  skillMatchingThreshold: 0.7,
  resourceAllocation: 'dynamic',
});
```

### Advanced Configuration

```typescript
const orchestrator = new OrchestratorAgent({
  maxParallelAgents: 15,
  taskTimeout: 600000,
  retryAttempts: 5,
  skillMatchingThreshold: 0.8,
  resourceAllocation: 'performance',
  discoveryInterval: 60000,
  optimizationStrategy: 'aggressive',
  monitoring: {
    enableMetrics: true,
    enableLogging: true,
    logLevel: 'info',
  },
});
```

## Discovery System

The orchestrator includes a dynamic discovery system that:

### Agent Discovery

- Scans for available agents automatically
- Tracks agent capabilities and performance
- Updates agent availability in real-time
- Maintains performance metrics and statistics

### Skill Discovery

- Discovers available skills across all agents
- Categorizes and indexes skills by function
- Tracks skill dependencies and compatibility
- Monitors skill performance and reliability

### MCP Server Discovery

- Identifies available MCP servers
- Tracks server capabilities and endpoints
- Monitors server health and availability
- Handles server failover and recovery

## Performance Optimization

### Parallel Execution

- Automatically identifies parallelizable tasks
- Coordinates simultaneous agent execution
- Manages resource contention and conflicts
- Optimizes execution order for maximum efficiency

### Load Balancing

- Distributes tasks across available agents
- Considers agent performance and availability
- Handles agent failures and retries
- Maintains optimal resource utilization

### Caching and Optimization

- Caches agent capabilities and performance data
- Optimizes frequently used task patterns
- Reduces discovery overhead
- Improves response times for common operations

## Monitoring and Analytics

### Task Monitoring

- Real-time task progress tracking
- Performance metrics and analytics
- Error detection and recovery
- Completion time predictions

### Agent Performance

- Success rate tracking
- Average execution time monitoring
- Resource usage analysis
- Bottleneck identification

### System Health

- Overall system status monitoring
- Resource utilization tracking
- Performance trend analysis
- Capacity planning recommendations

## Best Practices

### Task Planning

1. Break complex tasks into smaller, manageable steps
2. Define clear dependencies and requirements
3. Set appropriate priorities and deadlines
4. Consider parallel execution opportunities
5. Plan for error handling and recovery

### Resource Management

1. Monitor resource utilization regularly
2. Set appropriate concurrency limits
3. Optimize agent selection based on capabilities
4. Use performance data to inform decisions
5. Plan for peak loads and scaling

### Error Handling

1. Implement comprehensive error detection
2. Use appropriate retry strategies
3. Provide fallback mechanisms
4. Monitor and analyze error patterns
5. Continuously improve error handling

## Integration

### With Plugins

The orchestrator works seamlessly with marketplace plugins:

- Discovers plugin-provided agents automatically
- Integrates with plugin configuration systems
- Respects plugin permissions and limitations
- Supports plugin-specific optimization strategies

### With Skills

- Coordinates skill execution across agents
- Manages skill dependencies and conflicts
- Optimizes skill allocation based on performance
- Tracks skill usage and effectiveness

### With MCP Servers

- Coordinates MCP server operations
- Manages server resources and connections
- Handles server failover and recovery
- Optimizes server usage patterns

## Troubleshooting

### Common Issues

1. **Agents Not Discovered**: Check agent configurations and permissions
2. **Task Execution Failures**: Review task dependencies and requirements
3. **Performance Issues**: Monitor resource utilization and bottlenecks
4. **Parallel Execution Problems**: Verify task independence and resource availability

### Debug Information

Enable detailed logging for troubleshooting:

```typescript
const orchestrator = new OrchestratorAgent({
  monitoring: {
    enableLogging: true,
    logLevel: 'debug',
  },
});
```

### Performance Monitoring

Use built-in monitoring tools:

```typescript
// Get system status
const status = orchestrator.getSystemStatus();

// Get discovery status
const discoveryStatus = orchestrator.getDiscoveryStatus();

// Get performance metrics
const metrics = orchestrator.getPerformanceMetrics();
```

## Version History

### v1.0.0 (2025-11-03)

- Initial release with comprehensive orchestration capabilities
- Dynamic agent and skill discovery system
- Parallel execution optimization
- Resource management and monitoring
- Performance analytics and optimization

## Support and Resources

### Documentation

- Complete API reference and usage examples
- Configuration guides and best practices
- Troubleshooting guides and FAQ
- Integration documentation

### Community Resources

- GitHub repository for issues and contributions
- Community discussions and support
- Example implementations and patterns
- Performance tuning guides

---

_This orchestrator agent provides comprehensive coordination and optimization capabilities for complex multi-agent workflows in Claude Code._
