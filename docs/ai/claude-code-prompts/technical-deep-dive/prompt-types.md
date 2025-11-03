# Claude Code Prompt Types - Comprehensive Analysis

## Overview

Claude Code supports four distinct types of prompts, each designed for specific use cases and with unique characteristics, limitations, and optimization strategies. Understanding these types is crucial for effective prompt engineering and maximizing development productivity.

## Prompt Type Classification

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Prompt Types                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Slash     │  │   Skills    │  │     CLAUDE.md        │  │
│  │   Commands  │  │             │  │     Files           │  │
│  │   (Quick)   │  │  (Complex)  │  │   (Project)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                  ┌─────────────────────┐                    │
│                  │   Agent Prompts     │                    │
│                  │ (Orchestration)     │                    │
│                  └─────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## 1. Slash Commands

### Characteristics

| Property             | Value                                      |
| -------------------- | ------------------------------------------ |
| **Purpose**          | Quick automation and repetitive tasks      |
| **Character Limit**  | 15,000 characters                          |
| **Execution Speed**  | Fast (sub-second to few seconds)           |
| **Complexity**       | Low to moderate                            |
| **State Management** | Minimal to none                            |
| **Best For**         | Single-purpose, frequently used operations |

### Architecture

```
User Input: /command [arguments...]
    │
    ▼
┌─────────────────┐
│   Command       │
│   Parser        │ - Extract command name
│                 │ - Parse arguments
│                 │ - Validate syntax
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Route         │
│   Handler       │ - Find registered command
│                 │ - Check permissions
│                 │ - Prepare context
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Template      │
│   Expansion     │ - Load command template
│                 │ - Inject arguments
│                 │ - Build prompt
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Model         │
│   Execution     │ - Select optimal model
│                 │ - Execute prompt
│                 │ - Process response
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Response      │
│   Formatting    │ - Format output
│                 │ - Apply styling
│                 │ - Return to user
└─────────────────┘
```

### Implementation Examples

#### Basic Command Registration

```typescript
interface SlashCommand {
  name: string;
  description: string;
  template: string;
  parameters: CommandParameter[];
  permissions: PermissionScope;
  model: ModelType;
  costLimit?: number;
}

interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: ValidationRule;
}

// Example: /commit command
const commitCommand: SlashCommand = {
  name: 'commit',
  description: 'Create a git commit with automated message generation',
  template: `
    Create a git commit based on the current changes. Follow these steps:

    1. Analyze the staged changes using 'git diff --cached'
    2. Review recent commit messages using 'git log --oneline -5'
    3. Generate a concise commit message following the project's style
    4. Create the commit with the generated message

    {{#if includeScope}}
    Include the scope (affected files/modules) in the commit message.
    {{/if}}

    {{#if verbose}}
    Provide detailed explanation of changes in the commit body.
    {{/if}}
  `,
  parameters: [
    {
      name: 'includeScope',
      type: 'boolean',
      required: false,
      description: 'Include scope in commit message',
      defaultValue: true,
    },
    {
      name: 'verbose',
      type: 'boolean',
      required: false,
      description: 'Include detailed commit body',
      defaultValue: false,
    },
  ],
  permissions: {
    tools: ['git'],
    operations: ['read', 'write'],
    resources: ['filesystem'],
  },
  model: 'haiku',
  costLimit: 0.001,
};
```

#### Advanced Command with Conditional Logic

```typescript
// Example: /review-pr command
const reviewPRCommand: SlashCommand = {
  name: 'review-pr',
  description: 'Comprehensive pull request review',
  template: `
    Review pull request {{prNumber}} comprehensively. Follow this review structure:

    {{#if reviewAspects.includes('code-quality')}}
    ## Code Quality Review
    - Check for code style violations
    - Identify potential bugs or issues
    - Assess code readability and maintainability
    - Verify adherence to project conventions
    {{/if}}

    {{#if reviewAspects.includes('security')}}
    ## Security Review
    - Identify potential security vulnerabilities
    - Check for sensitive data exposure
    - Verify proper input validation
    - Assess authentication/authorization if applicable
    {{/if}}

    {{#if reviewAspects.includes('performance')}}
    ## Performance Review
    - Identify performance bottlenecks
    - Check for inefficient algorithms
    - Assess resource usage patterns
    - Suggest optimizations if needed
    {{/if}}

    {{#if reviewAspects.includes('testing')}}
    ## Testing Review
    - Evaluate test coverage
    - Check test quality and relevance
    - Identify missing edge cases
    - Verify test structure and organization
    {{/if}}

    Provide specific, actionable feedback for each identified issue.
    Include line numbers and suggested fixes where appropriate.
  `,
  parameters: [
    {
      name: 'prNumber',
      type: 'number',
      required: true,
      description: 'Pull request number to review',
    },
    {
      name: 'reviewAspects',
      type: 'array',
      required: false,
      description: 'Aspects to review',
      defaultValue: ['code-quality', 'security', 'performance', 'testing'],
      validation: {
        allowedValues: ['code-quality', 'security', 'performance', 'testing', 'documentation'],
      },
    },
  ],
  permissions: {
    tools: ['git', 'gh'],
    operations: ['read', 'write'],
    resources: ['filesystem', 'network'],
  },
  model: 'sonnet',
  costLimit: 0.01,
};
```

### Best Practices for Slash Commands

1. **Keep templates focused** on single responsibilities
2. **Use clear parameter names** with descriptive validation messages
3. **Set appropriate model types** based on task complexity
4. **Implement proper permission scoping** for security
5. **Include helpful error messages** and usage examples
6. **Test edge cases** and invalid inputs thoroughly

## 2. Skills

### Characteristics

| Property             | Value                                             |
| -------------------- | ------------------------------------------------- |
| **Purpose**          | Complex, domain-specific workflows                |
| **Character Limit**  | Flexible (typically 50,000+ characters)           |
| **Execution Speed**  | Moderate to slow (seconds to minutes)             |
| **Complexity**       | High                                              |
| **State Management** | Full state persistence                            |
| **Best For**         | Multi-step, specialized tasks requiring expertise |

### Skill Architecture

```
Skill Request
    │
    ▼
┌─────────────────┐
│   Skill         │
│   Discovery     │ - Match request to appropriate skill
│                 │ - Check availability and permissions
│                 │ - Validate prerequisites
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Context       │
│   Loading       │ - Load relevant project context
│                 │ - Initialize skill state
│                 │ - Prepare execution environment
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Workflow      │
│   Execution     │ - Execute skill workflow steps
│                 │ - Handle intermediate results
│                 │ - Manage state transitions
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Quality       │
│   Assurance     │ - Validate intermediate results
│                 │ - Apply domain-specific rules
│                 │ - Check for consistency
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Result        │
│   Consolidation │ - Consolidate workflow results
│                 │ - Format output appropriately
│                 │ - Clean up resources
└─────────────────┘
```

### Skill Implementation Structure

#### Core Skill Definition

```typescript
interface Skill {
  // Metadata
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  domain: string[];

  // Execution characteristics
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  estimatedDuration: number;
  requiredCapabilities: string[];
  dependencies: SkillDependency[];

  // Workflow definition
  workflow: SkillWorkflow;
  errorHandling: ErrorHandlingStrategy;
  rollbackStrategy: RollbackStrategy;

  // Quality assurance
  examples: SkillExample[];
  tests: SkillTest[];
  validationRules: ValidationRule[];

  // Resource management
  resourceRequirements: ResourceRequirements;
  performanceMetrics: PerformanceMetrics;

  // User experience
  userInterface: SkillUI;
  documentation: SkillDocumentation;
}

interface SkillWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  parallelExecution: boolean;
  checkpointStrategy: CheckpointStrategy;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'prompt' | 'tool' | 'condition' | 'loop' | 'subworkflow';
  configuration: StepConfiguration;
  dependencies: string[];
  timeout: number;
  retryPolicy: RetryPolicy;
}
```

#### Example: Code Architecture Skill

```typescript
// Example: feature-dev:code-architect skill
const codeArchitectSkill: Skill = {
  name: 'code-architect',
  version: '1.0.0',
  description: 'Designs feature architectures by analyzing existing codebase patterns',
  author: 'Claude Code Team',
  tags: ['architecture', 'design', 'planning'],
  domain: ['software-engineering', 'system-design'],

  complexity: 'complex',
  estimatedDuration: 300000, // 5 minutes
  requiredCapabilities: ['code-analysis', 'pattern-matching', 'system-design'],
  dependencies: [],

  workflow: {
    id: 'architecture-design',
    name: 'Feature Architecture Design',
    description: 'Comprehensive architecture design for new features',
    steps: [
      {
        id: 'analyze-codebase',
        name: 'Analyze Existing Codebase',
        type: 'prompt',
        configuration: {
          template: `
            Analyze the current codebase to understand:

            1. **Project Structure and Organization**
               - Directory layout and naming conventions
               - Module organization and dependencies
               - Configuration management approach

            2. **Architectural Patterns in Use**
               - Design patterns (MVC, Repository, Factory, etc.)
               - Architectural styles (Layered, Microservices, etc.)
               - Data flow patterns and state management

            3. **Technology Stack and Frameworks**
               - Frontend frameworks and libraries
               - Backend technologies and databases
               - Testing frameworks and tools
               - Build and deployment systems

            4. **Code Quality Standards**
               - Coding conventions and style guides
               - Testing requirements and coverage expectations
               - Documentation standards
               - Performance considerations

            Provide a comprehensive analysis that will inform the architecture design for the new feature: {{featureDescription}}
          `,
          parameters: {
            featureDescription: {
              type: 'string',
              required: true,
              description: 'Description of the feature to architect',
            },
          },
        },
        dependencies: [],
        timeout: 60000,
        retryPolicy: { maxRetries: 2, backoffStrategy: 'exponential' },
      },
      {
        id: 'design-architecture',
        name: 'Design Feature Architecture',
        type: 'prompt',
        configuration: {
          template: `
            Based on the codebase analysis, design a comprehensive architecture for the feature: {{featureDescription}}

            Your architecture design should include:

            ## 1. High-Level Architecture
            - Overall system design and component relationships
            - Data flow and interaction patterns
            - Integration points with existing systems

            ## 2. Component Design
            - New components to be created
            - Existing components to be modified
            - Interface definitions and contracts
            - Component responsibilities and boundaries

            ## 3. Data Architecture
            - Database schema changes (if any)
            - Data models and relationships
            - Data access patterns and repositories
            - Caching strategies

            ## 4. API Design
            - New endpoints or interfaces required
            - Request/response formats
            - Authentication and authorization considerations
            - Error handling and status codes

            ## 5. Implementation Plan
            - Step-by-step implementation sequence
            - Dependencies between implementation tasks
            - Testing strategy and requirements
            - Deployment considerations

            Ensure the architecture aligns with existing patterns and follows the project's established conventions.
          `,
        },
        dependencies: ['analyze-codebase'],
        timeout: 120000,
        retryPolicy: { maxRetries: 1, backoffStrategy: 'linear' },
      },
      {
        id: 'validate-design',
        name: 'Validate Architecture Design',
        type: 'prompt',
        configuration: {
          template: `
            Validate the proposed architecture design against the following criteria:

            ## Technical Validation
            - Scalability and performance implications
            - Security considerations and potential vulnerabilities
            - Maintainability and extensibility
            - Testability and debugging capabilities

            ## Business Validation
            - Alignment with business requirements
            - Cost implications and resource requirements
            - Timeline feasibility
            - Risk assessment and mitigation strategies

            ## Integration Validation
            - Compatibility with existing systems
            - Impact on current functionality
            - Migration requirements and backward compatibility
            - Performance impact on existing features

            Provide detailed feedback on any concerns and suggest improvements or alternatives where needed.
          `,
        },
        dependencies: ['design-architecture'],
        timeout: 60000,
        retryPolicy: { maxRetries: 1 },
      },
    ],
    parallelExecution: false,
    checkpointStrategy: {
      enabled: true,
      frequency: 'after-each-step',
      persistence: 'filesystem',
    },
  },

  errorHandling: {
    strategy: 'graceful-degradation',
    fallbackActions: ['provide-partial-results', 'suggest-alternatives'],
    errorReporting: 'detailed-with-context',
  },

  rollbackStrategy: {
    enabled: true,
    checkpoints: ['after-codebase-analysis', 'after-architecture-design'],
    cleanupActions: ['temporary-files', 'state-reset'],
  },

  examples: [
    {
      name: 'E-commerce Product Search Feature',
      input: {
        featureDescription:
          'Add advanced product search with filters, sorting, and faceted navigation',
      },
      expectedOutput: {
        components: ['SearchService', 'ProductFilter', 'SearchController', 'SearchIndex'],
        apis: ['/api/products/search', '/api/products/filters'],
        databaseChanges: ['products_search_index table', 'search_filters table'],
      },
    },
  ],

  tests: [
    {
      name: 'Simple Feature Architecture',
      mockCodebase: 'basic-crud-app',
      featureDescription: 'Add user authentication',
      validationCriteria: [
        'includes-auth-components',
        'defines-api-endpoints',
        'considers-security',
      ],
    },
  ],

  resourceRequirements: {
    memory: '512MB',
    diskSpace: '100MB',
    networkAccess: true,
    externalTools: ['git', 'file-system'],
  },

  performanceMetrics: {
    averageExecutionTime: 180000,
    successRate: 0.95,
    userSatisfactionScore: 4.5,
  },

  userInterface: {
    type: 'interactive',
    progressReporting: 'detailed',
    userInputs: ['featureDescription', 'constraints', 'preferences'],
    outputFormat: 'structured-markdown',
  },

  documentation: {
    usageGuide: 'docs/usage.md',
    apiReference: 'docs/api.md',
    examples: 'docs/examples.md',
    troubleshooting: 'docs/troubleshooting.md',
  },
};
```

### Skill Categories and Use Cases

#### 1. Development Skills

- **Code Generation**: Create boilerplate, implement patterns, generate components
- **Refactoring**: Improve code structure, apply design patterns, optimize performance
- **Testing**: Generate test cases, create test suites, implement mocking strategies
- **Documentation**: Generate API docs, create user guides, maintain technical documentation

#### 2. Analysis Skills

- **Code Review**: Analyze code quality, identify issues, suggest improvements
- **Security Analysis**: Identify vulnerabilities, assess security posture, recommend fixes
- **Performance Analysis**: Identify bottlenecks, analyze resource usage, optimize performance
- **Architecture Analysis**: Evaluate system design, assess scalability, identify improvements

#### 3. Domain-Specific Skills

- **Frontend Development**: React, Vue, Angular expertise and patterns
- **Backend Development**: API design, database architecture, microservices
- **DevOps**: CI/CD pipelines, infrastructure as code, deployment strategies
- **Data Science**: Data analysis, machine learning, statistical modeling

## 3. CLAUDE.md Files

### Characteristics

| Property            | Value                                                |
| ------------------- | ---------------------------------------------------- |
| **Purpose**         | Project-level configuration and conventions          |
| **Character Limit** | Flexible (project-dependent)                         |
| **Persistence**     | Permanent (version-controlled)                       |
| **Scope**           | Project-wide or team-wide                            |
| **Best For**        | Establishing standards, conventions, and preferences |

### CLAUDE.md Structure

```markdown
# Project Configuration and Preferences

## Project Information

- **Name**: [Project Name]
- **Type**: [Project Type: web-app, api, library, etc.]
- **Framework**: [Primary framework(s) used]
- **Language**: [Primary programming language(s)]

## Development Standards

### Code Style

- **Linting**: [ESLint configuration and rules]
- **Formatting**: [Prettier configuration]
- **Naming Conventions**: [Specific naming rules]
- **File Organization**: [Directory structure preferences]

### Testing Requirements

- **Framework**: [Testing framework used]
- **Coverage**: [Minimum coverage requirements]
- **Test Types**: [Unit, integration, E2E requirements]
- **Mocking Strategy**: [Approach to mocking and stubbing]

### Documentation Standards

- **API Documentation**: [Requirements and format]
- **Code Comments**: [When and how to comment]
- **README Requirements**: [Structure and content expectations]
- **Change Log**: [Format and update requirements]

## Tool and Technology Preferences

### Build Tools

- **Primary Build Tool**: [Webpack, Vite, Rollup, etc.]
- **Package Manager**: [npm, yarn, pnpm, bun]
- **Script Management**: [How to organize and run scripts]

### Development Tools

- **IDE/Editor**: [Preferred editors and configurations]
- **Version Control**: [Git workflow and conventions]
- **CI/CD**: [Pipeline tools and processes]

### External Services

- **Database**: [Database systems and ORMs]
- **Authentication**: [Auth providers and strategies]
- **Monitoring**: [Logging and monitoring tools]

## Code Quality Requirements

### Performance Standards

- **Bundle Size Limits**: [Maximum acceptable bundle sizes]
- **Load Time Targets**: [Performance benchmarks]
- **Memory Usage**: [Memory optimization requirements]

### Security Requirements

- **Input Validation**: [Security validation rules]
- **Data Handling**: [Sensitive data management]
- **Dependency Management**: [Security scanning requirements]

### Accessibility Standards

- **WCAG Compliance**: [Accessibility target level]
- **Testing Requirements**: [Accessibility testing approach]
- **Browser Support**: [Supported browser versions]

## Communication Preferences

### Commit Message Format

- **Style**: [Conventional commits, custom format, etc.]
- **Content Requirements**: [What to include in commit messages]
- **Branch Naming**: [Branch naming conventions]

### Pull Request Process

- **Template**: [PR template requirements]
- **Review Requirements**: [Who must review and what to check]
- **Merge Strategy**: [Merge method and requirements]

### Issue Tracking

- **Bug Reports**: [Bug report format and information]
- **Feature Requests**: [Feature request process]
- **Task Management**: [How tasks are organized and tracked]

## AI Assistant Preferences

### Response Format

- **Code Style**: [Preferred code formatting]
- **Explanation Style**: [Technical depth preference]
- **Example Requirements**: [When to provide examples]

### Task Preferences

- **Testing**: [Whether to always include tests]
- **Documentation**: [Documentation generation preferences]
- **Error Handling**: [Error handling approach preferences]

### Tool Usage

- **Preferred Tools**: [Which tools to use by default]
- **Tool Configuration**: [Specific tool configurations]
- **Security Settings**: [Tool permission preferences]
```

### Example CLAUDE.md Implementation

```markdown
# E-commerce Platform - Claude Configuration

## Project Overview

- **Name**: ShopHub E-commerce Platform
- **Type**: Full-stack web application
- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui components

## Development Standards

### Code Style Requirements

- **CRITICAL**: NEVER disable ESLint rules via inline comments
- **ESLint Configuration**: Strict mode with @typescript-eslint/recommended
- **Prettier Configuration**: 2-space indentation, trailing commas
- **TypeScript**: Strict mode enabled, explicit return types
- **File Naming**: PascalCase for components, camelCase for utilities

### Testing Requirements

- **Framework**: Jest with React Testing Library
- **Coverage**: Minimum 80% line coverage, 90% function coverage
- **Test Structure**: AAA pattern (Arrange, Act, Assert)
- **Mock Strategy**: Use MSW for API mocking, Jest mocks for utilities

### Documentation Standards

- **API Documentation**: OpenAPI 3.0 specification in /docs/api
- **Component Documentation**: Storybook stories with MDX documentation
- **Code Comments**: JSDoc for all public functions and complex logic
- **README**: Comprehensive setup and development guide

## Performance Standards

### Bundle Size Requirements

- **JavaScript bundles**: Max 250KB gzipped per route
- **CSS bundles**: Max 50KB gzilled per page
- **Image optimization**: WebP format with responsive loading

### Performance Metrics

- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5 seconds

## Security Requirements

### Code Security

- **Input Validation**: Zod schemas for all API inputs
- **Authentication**: NextAuth.js with session management
- **Authorization**: Role-based access control (RBAC)
- **Data Sanitization**: DOMPurify for user-generated content

### Dependency Security

- **Scanning**: npm audit for security vulnerabilities
- **Updates**: Automated Dependabot PRs for security updates
- **Licenses**: Only MIT, Apache-2.0, or BSD licenses allowed

## Testing Commands

- **Primary**: Use `bun test` for all testing operations
- **Watch Mode**: `bun test --watch` during development
- **Coverage**: `bun test --coverage` for coverage reports
- **E2E**: `bun test e2e/` for end-to-end tests

## Code Quality Standards

### Mutation Testing

- **Threshold**: Minimum 80% mutation score
- **Tool**: Stryker for mutation testing
- **Strategy**: NEVER reduce thresholds to pass tests
- **Reporting**: Detailed mutation reports in coverage/ directory

### Review Requirements

- **Code Review**: Required for all changes > 50 lines
- **Security Review**: Required for authentication/authorization changes
- **Performance Review**: Required for database query changes
- **Testing Review**: Required for test coverage below thresholds

## AI Assistant Preferences

### Response Format

- **Language**: English only for all code, comments, and documentation
- **Code Style**: Follow established ESLint and Prettier configurations
- **Type Safety**: Always prefer explicit types over inference
- **Error Handling**: Comprehensive error handling with proper typing

### Development Workflow

- **Testing**: Always include tests for new functionality
- **Documentation**: Update relevant documentation for API changes
- **Performance**: Consider performance implications of all changes
- **Security**: Follow security best practices for all user-facing features

### Tool Usage Preferences

- **Database**: Use Prisma client for all database operations
- **API Routes**: Follow RESTful conventions with proper HTTP status codes
- **State Management**: Use React Query for server state, Zustand for client state
- **Styling**: Prefer Tailwind utility classes with component composition

## Communication Standards

### Commit Message Format
```

type(scope): description

[optional body]

[optional footer]

```

**Types**: feat, fix, docs, style, refactor, test, chore
**Examples**:
- feat(auth): add OAuth integration with Google
- fix(cart): resolve price calculation bug for discounts
- docs(api): update authentication endpoint documentation

### Pull Request Template
- **Description**: Clear problem statement and solution approach
- **Testing**: How the changes were tested
- **Breaking Changes**: Any breaking changes and migration steps
- **Screenshots**: UI changes with before/after screenshots

---

*Last updated: October 2025*
*Maintained by: Development Team*
```

## 4. Agent Prompts

### Characteristics

| Property             | Value                                              |
| -------------------- | -------------------------------------------------- |
| **Purpose**          | Multi-agent orchestration and complex coordination |
| **Complexity**       | Very high                                          |
| **Execution Model**  | Distributed with coordination                      |
| **State Management** | Multi-agent state synchronization                  |
| **Best For**         | Complex workflows requiring specialized expertise  |

### Agent Orchestration Architecture

```
Complex Request
    │
    ▼
┌─────────────────┐
│   Request       │
│   Decomposition │ - Analyze request complexity
│                 │ - Identify required capabilities
│                 │ - Break down into subtasks
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Agent         │
│   Selection     │ - Match capabilities to subtasks
│                 │ - Optimize agent assignments
│                 │ - Plan execution strategy
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Execution     │
│   Planning      │ - Create execution graph
│                 │ - Identify parallelizable tasks
│                 │ - Schedule resource allocation
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Agent         │
│   Coordination  │ - Dispatch agents
│                 │ - Monitor progress
│                 │ - Handle inter-agent communication
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Result        │
│   Consolidation │ - Collect agent results
│                 │ - Resolve conflicts
│                 │ - Generate final output
└─────────────────┘
```

### Agent Types and Specializations

#### 1. Analysis Agents

- **Code Analysis Agents**: Specialize in understanding code structure, patterns, and quality
- **Security Analysis Agents**: Focus on vulnerability detection and security assessment
- **Performance Analysis Agents**: Analyze performance characteristics and optimization opportunities
- **Architecture Analysis Agents**: Evaluate system design and architectural decisions

#### 2. Development Agents

- **Code Generation Agents**: Create code following specific patterns and requirements
- **Refactoring Agents**: Improve code structure and apply design patterns
- **Testing Agents**: Generate comprehensive test suites and testing strategies
- **Documentation Agents**: Create and maintain technical documentation

#### 3. Review Agents

- **Code Review Agents**: Perform thorough code reviews with domain expertise
- **Security Review Agents**: Specialize in security-focused code reviews
- **Performance Review Agents**: Focus on performance implications and optimizations
- **Quality Review Agents**: Assess overall code quality and maintainability

#### 4. Orchestration Agents

- **Workflow Agents**: Manage complex multi-step workflows
- **Coordination Agents**: Handle inter-agent communication and coordination
- **Resource Management Agents**: Optimize resource allocation and scheduling
- **Quality Assurance Agents**: Ensure overall process quality and standards compliance

### Example Agent Orchestration

#### Comprehensive Feature Implementation

```typescript
interface FeatureImplementationRequest {
  featureDescription: string;
  requirements: Requirement[];
  constraints: Constraint[];
  qualityStandards: QualityStandard[];
}

interface AgentOrchestrationPlan {
  phases: ExecutionPhase[];
  agentAssignments: AgentAssignment[];
  dependencies: TaskDependency[];
  estimatedDuration: number;
  resourceRequirements: ResourceRequirement[];
}

// Example: Complete feature implementation orchestration
const featureImplementationPlan: AgentOrchestrationPlan = {
  phases: [
    {
      name: 'Analysis and Planning',
      agents: [
        {
          type: 'code-architect',
          tasks: ['analyze-requirements', 'design-architecture', 'plan-implementation'],
        },
        {
          type: 'security-analyst',
          tasks: ['security-requirements-analysis', 'threat-modeling'],
        },
      ],
      executionMode: 'parallel',
    },
    {
      name: 'Implementation',
      agents: [
        {
          type: 'code-generator',
          tasks: ['generate-components', 'implement-logic', 'create-tests'],
        },
        {
          type: 'documentation-generator',
          tasks: ['generate-api-docs', 'create-user-guide'],
        },
      ],
      executionMode: 'pipeline',
    },
    {
      name: 'Quality Assurance',
      agents: [
        {
          type: 'code-reviewer',
          tasks: ['review-implementation', 'check-standards-compliance'],
        },
        {
          type: 'security-reviewer',
          tasks: ['security-review', 'vulnerability-assessment'],
        },
        {
          type: 'test-analyzer',
          tasks: ['verify-test-coverage', 'analyze-test-quality'],
        },
      ],
      executionMode: 'parallel',
    },
  ],
  agentAssignments: [
    {
      agentType: 'feature-dev:code-architect',
      capabilities: ['system-design', 'pattern-analysis', 'planning'],
      model: 'opus',
      priority: 'high',
    },
    {
      agentType: 'superpowers:code-reviewer',
      capabilities: ['code-analysis', 'quality-assessment', 'standards-compliance'],
      model: 'sonnet',
      priority: 'medium',
    },
    {
      agentType: 'pr-review-toolkit:security-reviewer',
      capabilities: ['vulnerability-detection', 'security-analysis', 'compliance-checking'],
      model: 'sonnet',
      priority: 'high',
    },
  ],
  dependencies: [
    {
      from: 'analysis-and-planning',
      to: 'implementation',
      type: 'completion',
    },
    {
      from: 'implementation',
      to: 'quality-assurance',
      type: 'completion',
    },
  ],
  estimatedDuration: 900000, // 15 minutes
  resourceRequirements: {
    agents: 6,
    parallelExecutions: 3,
    memoryRequirement: '2GB',
    costEstimate: 0.5,
  },
};
```

## Prompt Type Selection Guide

### Decision Matrix

| Scenario               | Recommended Type       | Rationale                                |
| ---------------------- | ---------------------- | ---------------------------------------- |
| Quick git operations   | Slash Command          | Simple, repetitive, fast execution       |
| Complex refactoring    | Skill                  | Multi-step workflow, state management    |
| Project standards      | CLAUDE.md              | Persistent configuration, team-wide      |
| Feature implementation | Agent Orchestration    | Multiple specialized capabilities needed |
| Code generation        | Skill or Agent         | Depends on complexity and requirements   |
| Security review        | Agent or Skill         | Domain expertise required                |
| Documentation updates  | Slash Command or Skill | Based on scope and complexity            |

### Selection Criteria

#### Use Slash Commands when:

- Task is simple and well-defined
- Execution time should be under 10 seconds
- Minimal state management required
- High frequency of use
- Template-based approach is sufficient

#### Use Skills when:

- Task requires multiple steps or workflow management
- Domain-specific expertise is needed
- State persistence is important
- Task complexity is moderate to high
- Quality assurance and validation are critical

#### Use CLAUDE.md when:

- Configuration needs to be persistent
- Standards apply across the entire project
- Team collaboration is required
- Preferences need to be version-controlled
- Long-term consistency is important

#### Use Agent Orchestration when:

- Task requires multiple specialized capabilities
- Complex coordination is needed
- Different aspects require different expertise
- Parallel execution would be beneficial
- Quality assurance requires multiple perspectives

## Performance Considerations

### Cost Optimization by Prompt Type

| Prompt Type         | Average Cost     | Optimization Strategies                     |
| ------------------- | ---------------- | ------------------------------------------- |
| Slash Commands      | $0.0001 - $0.001 | Use Haiku model, minimize context           |
| Skills              | $0.005 - $0.05   | Intelligent caching, progressive disclosure |
| CLAUDE.md           | $0 (one-time)    | Careful initial design, periodic updates    |
| Agent Orchestration | $0.10 - $1.00+   | Parallel execution, optimal model selection |

### Latency Optimization

| Prompt Type         | Average Latency    | Optimization Techniques                 |
| ------------------- | ------------------ | --------------------------------------- |
| Slash Commands      | < 2 seconds        | Pre-compiled templates, minimal context |
| Skills              | 10 - 60 seconds    | Workflow optimization, checkpointing    |
| CLAUDE.md           | 0 seconds (cached) | Efficient parsing, smart caching        |
| Agent Orchestration | 30 - 300 seconds   | Parallel execution, resource pooling    |

---

_Understanding these prompt types and their optimal use cases is essential for maximizing productivity and effectiveness with Claude Code._
