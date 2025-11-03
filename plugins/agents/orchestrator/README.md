# Orchestrator Agent

Advanced orchestration agent for managing subagents, commands, MCP servers, and skills with parallel execution capabilities.

## Overview

The Orchestrator Agent is a sophisticated management system designed to coordinate and optimize the execution of multiple AI agents, skills, and resources within the Claude Code ecosystem. It serves as the central hub for task planning, resource allocation, and parallel execution optimization.

## Key Features

### 🎯 **Agent Management**

- Discover and manage all available agents in the system
- Track agent performance and capabilities
- Optimal agent selection based on skills and tools
- Performance monitoring and analytics

### 📋 **Task Planning & Execution**

- Create comprehensive task plans with dependencies
- Parallel execution of compatible tasks
- Intelligent task scheduling and resource allocation
- Dependency resolution and execution ordering

### 🔧 **Skill & Command Coordination**

- Discover available skills across all agents
- Intelligent skill-to-task matching
- Command execution management
- MCP server coordination

### ⚡ **Resource Optimization**

- Dynamic resource allocation and balancing
- Performance monitoring and threshold management
- Automatic scaling and optimization
- Bottleneck detection and resolution

### 🔄 **Workflow Templates**

- Pre-built workflow templates for common scenarios
- Custom workflow creation and management
- Workflow execution monitoring
- Performance analytics and insights

## Architecture

### Core Components

1. **OrchestratorAgent**: Main orchestration engine
2. **OrchestrationManagementSkill**: Workflow and template management
3. **ResourceOptimizerSkill**: Resource allocation and optimization

### Key Interfaces

- **AgentCapability**: Defines agent skills, tools, and performance
- **TaskPlan**: Comprehensive task definition with dependencies
- **ResourcePool**: Resource allocation and management
- **WorkflowTemplate**: Reusable workflow definitions

## Usage Examples

### Basic Task Orchestration

```typescript
import OrchestratorAgent from './index';

const orchestrator = new OrchestratorAgent();
await orchestrator.initialize();

// Create a task plan
const taskId = await orchestrator.createTaskPlan('Code review task', {
  requiredSkills: ['code-review', 'security-analysis'],
  requiredTools: ['Read', 'Write', 'Bash'],
  priority: 1,
});

// Execute the task
await orchestrator.executeTask(taskId);
```

### Workflow Template Execution

```typescript
import OrchestrationManagementSkill from './skills/orchestration-management';

const orchestrationSkill = new OrchestrationManagementSkill(orchestrator);

// Execute a predefined workflow
const workflowId = await orchestrationSkill.executeWorkflow(
  'code-review-workflow',
  {
    parameters: { repo: 'my-repo', branch: 'feature-branch' },
    agentOverrides: {
      'security-analysis': 'superpowers:code-reviewer',
    },
  }
);
```

### Resource Optimization

```typescript
import ResourceOptimizerSkill from './skills/resource-optimizer';

const optimizer = new ResourceOptimizerSkill(orchestrator);

// Optimize resource allocation
const optimization = await optimizer.optimizeResources();
console.log('Optimizations applied:', optimization.optimizations);
console.log('Recommendations:', optimization.recommendations);

// Generate performance report
const report = optimizer.generatePerformanceReport();
console.log('Performance summary:', report.summary);
```

## Available Agents

The orchestrator automatically discovers and manages these agent types:

### General Purpose Agents

- `general-purpose` - General tasks and web search
- `Explore` - Fast codebase exploration
- `Plan` - Project planning and architecture

### Code Review & Quality

- `superpowers:code-reviewer` - Security and performance analysis
- `pr-review-toolkit:code-reviewer` - PR-specific reviews
- `pr-review-toolkit:code-simplifier` - Code simplification
- `feature-dev:code-reviewer` - Feature-specific reviews

### Development & Architecture

- `feature-dev:code-architect` - Solution architecture
- `feature-dev:code-explorer` - Deep codebase analysis
- `agent-creator` - Agent and skill development

### Specialized Tools

- `lint-typescript-fixer` - Advanced TypeScript fixing
- `astrojs-specialist` - Astro.js development
- `studio-cc:cc-expert` - Studio-CC expertise

## Workflow Templates

### Pre-built Templates

1. **Code Review Workflow**
   - Static analysis
   - Security review (parallel)
   - Performance review (parallel)
   - Documentation review

2. **Feature Development Workflow**
   - Requirements analysis
   - Design and planning
   - Implementation
   - Testing
   - Documentation

3. **Custom Workflows**
   - Create custom workflow templates
   - Define steps, dependencies, and agents
   - Configure parallel execution groups

## Resource Management

### Resource Pools

- **Compute**: CPU and processing resources
- **Memory**: Memory allocation and usage
- **Network**: Network bandwidth and connections
- **Agents**: Agent availability and allocation

### Optimization Strategies

- **Performance**: Maximum speed and parallelism
- **Balanced**: Optimal resource utilization
- **Conservative**: Stability and efficiency
- **Development**: Development workflow optimization
- **Testing**: Testing and validation focus

## Configuration

### Orchestration Config

```typescript
const config = {
  maxParallelAgents: 10, // Maximum parallel agent execution
  taskTimeout: 300000, // Task timeout in milliseconds (5 minutes)
  retryAttempts: 3, // Number of retry attempts
  skillMatchingThreshold: 0.7, // Minimum skill match score
  resourceAllocation: 'dynamic', // Resource allocation strategy
};
```

### Performance Thresholds

```typescript
const thresholds = {
  cpuUsage: { warning: 70, critical: 90, action: 'scale-up' },
  memoryUsage: { warning: 80, critical: 95, action: 'scale-up' },
  queueSize: { warning: 5, critical: 15, action: 'scale-up' },
  throughput: { warning: 0.3, critical: 0.1, action: 'rebalance' },
};
```

## Monitoring & Analytics

### System Status

```typescript
const status = orchestrator.getSystemStatus();
console.log('Active agents:', status.agents.length);
console.log('Active tasks:', status.activeTasks.length);
console.log('Queued tasks:', status.queuedTasks.length);
console.log('System metrics:', status.metrics);
```

### Performance Monitoring

```typescript
// Workflow execution monitoring
const monitoring =
  await orchestrationSkill.monitorWorkflowExecution(workflowId);
console.log('Progress:', monitoring.progress);
console.log('Bottlenecks:', monitoring.bottlenecks);

// Resource utilization
const utilization = optimizer.getResourceUtilization();
console.log('Overall status:', utilization.overallStatus);
```

## Development

### Building

```bash
bun run build
```

### Testing

```bash
bun test
```

### Linting

```bash
bun run lint
```

### Type Checking

```bash
bun run type-check
```

## Integration

The Orchestrator Agent integrates seamlessly with:

- **Studio-CC Plugin Manager**: Plugin lifecycle management
- **Agent Manager**: Agent discovery and configuration
- **MCP Servers**: External service coordination
- **Skill Registry**: Skill discovery and matching

## Best Practices

### Task Planning

1. Define clear task requirements and dependencies
2. Specify required skills and tools explicitly
3. Set appropriate priority levels
4. Break complex tasks into smaller, manageable steps

### Resource Management

1. Monitor resource utilization regularly
2. Set appropriate performance thresholds
3. Use optimization strategies based on workload
4. Balance between performance and resource efficiency

### Workflow Design

1. Create reusable workflow templates
2. Define parallel execution groups where possible
3. Set realistic time estimates
4. Include error handling and retry logic

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please ensure all code follows the project's ESLint rules and includes appropriate tests.
