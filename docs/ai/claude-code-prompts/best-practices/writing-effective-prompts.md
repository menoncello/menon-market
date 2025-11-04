# Writing Effective Prompts - Best Practices Guide

## Overview

Writing effective prompts is both an art and a science. This guide provides comprehensive best practices for creating prompts that produce consistent, high-quality results across all Claude Code prompt types. Mastering these principles will significantly improve your productivity and the quality of AI-assisted development.

## Fundamental Principles

### 1. Clarity and Specificity

**Principle**: Be explicit and unambiguous in your instructions.

**Poor Example**:

```
Make the code better.
```

**Excellent Example**:

```
Refactor the user authentication module to improve maintainability by:
1. Extracting the password validation logic into a separate service class
2. Implementing the repository pattern for database operations
3. Adding comprehensive error handling with specific exception types
4. Ensuring all functions have proper TypeScript types
5. Adding unit tests with 90%+ coverage
```

**Why it works**: Specific instructions eliminate ambiguity and provide clear success criteria.

### 2. Context Provision

**Principle**: Provide all necessary context for the AI to make informed decisions.

**Poor Example**:

```
Add a new feature to handle user payments.
```

**Excellent Example**:

```
Add a payment processing feature to our e-commerce platform.

Context:
- We're a subscription-based SaaS platform using Next.js and TypeScript
- Current payment system uses Stripe with basic subscription management
- Database uses PostgreSQL with Prisma ORM
- We need to support one-time payments and payment method updates
- Current user model already has stripeCustomerId field

Requirements:
1. Add one-time payment functionality for $29.99 "Pro Plan" upgrade
2. Allow users to update their payment methods
3. Implement payment history viewing
4. Add proper error handling for failed payments
5. Ensure PCI compliance by never storing card details
6. Add webhook handling for payment events
7. Include comprehensive logging for payment operations

Please follow our existing code patterns and TypeScript conventions.
```

**Why it works**: Complete context enables the AI to make appropriate architectural decisions.

### 3. Structured Instructions

**Principle**: Organize instructions logically with clear hierarchy.

**Template Structure**:

```
# [Task Title]

## Context
[Background information about the project/system]

## Requirements
[Specific, actionable requirements]

## Constraints
[Limitations, technologies to use/avoid]

## Success Criteria
[How to determine if the task is completed successfully]

## Step-by-Step Process
[Detailed execution steps]

## Quality Standards
[Code quality, testing, documentation requirements]
```

### 4. Progressive Disclosure

**Principle**: Reveal complexity gradually to prevent overwhelming the AI.

**Example for Complex Task**:

```
Phase 1: Analysis and Planning
1. Analyze the current codebase structure
2. Identify the best approach for the new feature
3. Create a detailed implementation plan
4. Get confirmation before proceeding

Phase 2: Core Implementation
1. Implement the basic functionality
2. Add error handling
3. Write initial tests

Phase 3: Enhancement and Polish
1. Add advanced features
2. Optimize performance
3. Improve error messages
4. Complete documentation

Please complete each phase and wait for confirmation before starting the next.
```

## Prompt Type-Specific Best Practices

### Slash Commands

#### Keep Templates Focused

```typescript
// ❌ Poor: Too many responsibilities
const badCommand = {
  template: `
    Review the code, fix bugs, add tests, update docs,
    and deploy to production. Make sure everything
    follows best practices and the code is perfect.
  `,
};

// ✅ Excellent: Single responsibility
const goodCommand = {
  template: `
    Create a comprehensive git commit message following these steps:

    1. Run 'git status' to see staged changes
    2. Run 'git diff --cached' to see what will be committed
    3. Run 'git log --oneline -5' to see recent commit style
    4. Generate a commit message that:
       - Uses present tense ("add" not "added")
       - Starts with a type (feat, fix, docs, etc.)
       - Includes scope if relevant
       - Describes what was changed, not why
       - Is under 72 characters for the title
    5. Create the commit with the generated message

    {{#if verbose}}
    Include a detailed body explaining the motivation and approach.
    {{/if}}
  `,
};
```

#### Use Clear Parameter Validation

```typescript
// ✅ Excellent: Comprehensive parameter handling
const commitCommand = {
  parameters: [
    {
      name: 'messageType',
      type: 'string',
      required: false,
      description: 'Type of commit message',
      defaultValue: 'conventional',
      validation: {
        allowedValues: ['conventional', 'simple', 'detailed'],
        errorMessage: 'Message type must be: conventional, simple, or detailed',
      },
    },
    {
      name: 'includeScope',
      type: 'boolean',
      required: false,
      description: 'Include scope in commit message',
      defaultValue: true,
    },
  ],
};
```

### Skills

#### Implement Robust Error Handling

```typescript
// ✅ Excellent: Comprehensive error handling
const codeReviewSkill = {
  workflow: {
    steps: [
      {
        id: 'validate-input',
        name: 'Validate Input Parameters',
        type: 'condition',
        configuration: {
          condition: 'hasValidInput()',
          onSuccess: 'analyze-code',
          onError: 'handle-invalid-input',
        },
      },
      {
        id: 'handle-invalid-input',
        name: 'Handle Invalid Input',
        type: 'prompt',
        configuration: {
          template: `
            Input validation failed. Please provide:
            - Valid file path or PR number
            - Proper access permissions
            - Supported file formats (.js, .ts, .tsx, .jsx)

            Error details: {{error.message}}

            Suggested actions:
            1. Check file path exists and is accessible
            2. Verify you have read permissions
            3. Ensure file is a supported type
            4. Try again with corrected input
          `,
        },
      },
    ],
    errorHandling: {
      strategy: 'graceful-degradation',
      fallbackActions: ['provide-error-analysis', 'suggest-alternatives', 'enable-partial-results'],
      recoveryActions: ['retry-with-altered-parameters', 'switch-to-simpler-approach'],
    },
  },
};
```

#### Design for Reusability

```typescript
// ✅ Excellent: Modular and reusable skill design
const documentationGenerator = {
  templates: {
    apiDocumentation: `
      Generate API documentation for: {{componentName}}

      Include:
      - Endpoint descriptions with HTTP methods
      - Request/response schemas
      - Authentication requirements
      - Error response formats
      - Example requests/responses
      - Rate limiting information

      Format: OpenAPI 3.0 specification
      Style: Follow existing documentation patterns
    `,

    componentDocumentation: `
      Generate component documentation for: {{componentName}}

      Include:
      - Component purpose and usage
      - Props interface with TypeScript types
      - Default values and constraints
      - Usage examples
      - Accessibility considerations
      - Styling information

      Format: Markdown with code examples
      Style: Consistent with existing component docs
    `,
  },

  contextProviders: [
    'existing-codebase-patterns',
    'project-documentation-standards',
    'component-usage-examples',
  ],
};
```

### CLAUDE.md Files

#### Structure for Maintainability

```markdown
# Project Configuration

## Development Standards

### Code Style

### Testing Requirements

### Documentation Standards

## Tool Preferences

### Build Tools

### Development Environment

### External Services

## AI Assistant Configuration

### Response Format Preferences

### Task Execution Guidelines

### Quality Standards

## Security and Performance

### Security Requirements

### Performance Standards

### Accessibility Guidelines
```

#### Be Specific About Preferences

```markdown
## AI Assistant Preferences

### Code Style Requirements

- ALWAYS use explicit TypeScript return types
- NEVER disable ESLint rules with inline comments
- Prefer functional components over class components
- Use async/await instead of Promise chains
- Implement proper error boundaries

### Testing Requirements

- ALWAYS include tests for new functionality
- Target 90%+ code coverage for critical paths
- Use AAA pattern (Arrange, Act, Assert)
- Mock external dependencies properly
- Include edge case testing

### Documentation Requirements

- Update README.md for API changes
- Add JSDoc comments for public functions
- Include usage examples in component documentation
- Maintain changelog for breaking changes
```

### Agent Orchestration

#### Define Clear Roles and Responsibilities

```typescript
const featureImplementationOrchestration = {
  phases: [
    {
      name: 'architecture-planning',
      agents: [
        {
          type: 'code-architect',
          role: 'Lead Architect',
          responsibilities: [
            'Analyze requirements and constraints',
            'Design overall system architecture',
            'Define component boundaries and interfaces',
            'Create implementation roadmap',
          ],
          deliverables: [
            'architecture-documentation',
            'component-specifications',
            'implementation-plan',
          ],
        },
        {
          type: 'security-analyst',
          role: 'Security Consultant',
          responsibilities: [
            'Identify security requirements',
            'Perform threat modeling',
            'Define security controls',
            'Plan security testing',
          ],
          deliverables: ['security-requirements', 'threat-model', 'security-implementation-plan'],
        },
      ],
    },
  ],
};
```

#### Implement Effective Communication Protocols

```typescript
const communicationProtocol = {
  messageFormats: {
    statusUpdate: {
      structure: 'status|agent|progress|blockers|next-steps',
      frequency: 'every-30-seconds',
      detailLevel: 'concise',
    },
    handoff: {
      structure: 'handoff|from-agent|to-agent|context|deliverables|next-actions',
      conditions: 'phase-completion OR error-recovery',
      validation: 'required-fields-present',
    },
    conflict: {
      structure: 'conflict|agents|issue|proposed-resolutions|decision-needed',
      escalation: 'timeout-60-seconds OR priority-high',
      resolution: 'consensus OR tie-breaker',
    },
  },
};
```

## Advanced Prompting Techniques

### 1. Chain of Thought Prompting

**Technique**: Guide the AI through step-by-step reasoning.

```typescript
const complexAnalysisPrompt = `
Analyze this codebase for performance optimization opportunities.

Follow this analytical process:

1. **Initial Assessment**
   - What is the primary purpose of this codebase?
   - What are the main performance bottlenecks you can identify?
   - What measurement tools/approaches are available?

2. **Deep Analysis**
   - Examine database queries for optimization opportunities
   - Look for N+1 query problems
   - Identify inefficient algorithms or data structures
   - Check for memory leaks or excessive allocations

3. **Prioritization**
   - Rate each issue by impact (high/medium/low)
   - Consider implementation complexity (easy/medium/hard)
   - Create a prioritized list of optimizations

4. **Implementation Planning**
   - For the top 3 optimizations, provide:
     * Detailed implementation steps
     * Required code changes
     * Testing approach
     * Expected performance improvement

Please work through each step methodically and show your reasoning.
`;
```

### 2. Few-Shot Learning

**Technique**: Provide examples to guide the AI's responses.

```typescript
const codeGenerationWithExamples = `
Generate a React component following our established patterns.

Here are examples of our component structure:

Example 1: UserCard Component
\`\`\`typescript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  className
}) => {
  return (
    <div className={cn('user-card', className)}>
      <div className="user-card__header">
        <h3>{user.name}</h3>
        {onEdit && (
          <button onClick={() => onEdit(user)}>
            Edit
          </button>
        )}
      </div>
      <div className="user-card__content">
        <p>{user.email}</p>
        <p>{user.role}</p>
      </div>
    </div>
  );
};
\`\`\`

Example 2: ProductList Component
\`\`\`typescript
interface ProductListProps {
  products: Product[];
  loading?: boolean;
  onProductSelect?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  onProductSelect
}) => {
  if (loading) return <ProductListSkeleton />;

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductSelect?.(product)}
        />
      ))}
    </div>
  );
};
\`\`\`

Now generate a {{componentName}} component with these requirements:
{{requirements}}

Follow the same patterns:
- Use TypeScript interfaces for props
- Provide default values for optional props
- Use className prop for styling flexibility
- Follow established naming conventions
- Include proper accessibility attributes
`;
```

### 3. Role-Based Prompting

**Technique**: Assign specific roles to focus the AI's expertise.

```typescript
const roleBasedPrompts = {
  securityExpert: `
    You are a senior security engineer with 15 years of experience
    in application security, penetration testing, and secure code
    development. Review this code for security vulnerabilities:

    Focus on:
    - Input validation and sanitization
    - Authentication and authorization flaws
    - Data exposure and privacy issues
    - Injection vulnerabilities
    - Cryptographic weaknesses
    - Configuration security issues

    Provide specific, actionable recommendations with code examples.
  `,

  performanceEngineer: `
    You are a performance optimization specialist focused on
    web application performance. Analyze this code for performance
    improvements:

    Consider:
    - Algorithmic efficiency (Big O analysis)
    - Memory usage and garbage collection
    - Network request optimization
    - Rendering performance
    - Bundle size impact
    - Database query efficiency

    Prioritize recommendations by expected performance impact.
  `,

  uxDesigner: `
    You are a UX engineer focused on accessibility and user experience.
    Review this component for UX improvements:

    Evaluate:
    - Accessibility compliance (WCAG 2.1 AA)
    - Screen reader compatibility
    - Keyboard navigation
    - Error messaging and user feedback
    - Loading states and progress indicators
    - Mobile responsiveness
    - Internationalization considerations

    Provide specific improvements with user benefits.
  `,
};
```

### 4. Constraint-Based Prompting

**Technique**: Use constraints to guide the AI toward optimal solutions.

```typescript
const constraintBasedPrompt = `
Implement a user authentication system with these constraints:

Technical Constraints:
- Must use Next.js 14 with App Router
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js v5
- Styling: Tailwind CSS
- Testing: Jest + React Testing Library
- Bundle size limit: 500KB gzipped

Security Constraints:
- No sensitive data in localStorage
- All passwords must be hashed with bcrypt
- Implement rate limiting for auth endpoints
- CSRF protection on all mutations
- Input validation with Zod schemas

Performance Constraints:
- Login page must load in < 2 seconds
- Database queries must be optimized (max 100ms)
- Implement proper caching strategies
- Minimize third-party dependencies

UX Constraints:
- Support keyboard navigation
- Screen reader compatible
- Mobile-first responsive design
- Clear error messages
- Loading states for all async operations

Business Constraints:
- Must support email/password and OAuth (Google, GitHub)
- Email verification required for new accounts
- Password reset functionality
- Account deletion with data retention policy

Please implement within all these constraints and explain any trade-offs.
`;
```

## Quality Assurance Patterns

### 1. Validation Checkpoints

```typescript
const qualityCheckpoints = {
  codeGeneration: `
    Before finalizing your code, verify:

    ✅ TypeScript types are explicit and correct
    ✅ All functions have proper error handling
    ✅ Code follows established linting rules
    ✅ Performance implications are considered
    ✅ Security best practices are followed
    ✅ Accessibility requirements are met
    ✅ Tests are comprehensive and meaningful
    ✅ Documentation is clear and accurate

    If any checkpoint fails, revise the code before proceeding.
  `,
};
```

### 2. Self-Correction Prompts

```typescript
const selfCorrectionPattern = `
After generating your response, review it critically:

1. **Accuracy Check**
   - Does this address all parts of the user's request?
   - Are there any factual errors or misunderstandings?
   - Is the technical information correct?

2. **Completeness Check**
   - Have I provided all necessary context?
   - Are there missing steps or considerations?
   - Is the solution comprehensive?

3. **Quality Check**
   - Is the code well-structured and maintainable?
   - Are there better approaches I should suggest?
   - Does this follow best practices?

4. **Clarity Check**
   - Is my explanation clear and easy to understand?
   - Are there ambiguities that need clarification?
   - Is the terminology appropriate for the audience?

If you find any issues, correct them and explain your improvements.
`;
```

## Common Anti-Patterns to Avoid

### 1. Vague Instructions

```typescript
// ❌ Anti-pattern: Too vague
"Make the code better and faster."

// ✅ Better: Specific and actionable
"Optimize the database query in getUserData() by:
1. Adding appropriate indexes
2. Implementing query result caching
3. Reducing the number of JOIN operations
4. Adding query performance monitoring"
```

### 2. Insufficient Context

```typescript
// ❌ Anti-pattern: Missing context
"Add user authentication to the app."

// ✅ Better: Complete context
"Add JWT-based authentication to our Next.js e-commerce app.
Current auth system uses sessions, we need to migrate to tokens
for API access. User model already exists in prisma/schema.prisma."
```

### 3. Overly Complex Single Prompts

```typescript
// ❌ Anti-pattern: Trying to do everything at once
"Analyze the entire codebase, fix all bugs, add tests,
update documentation, deploy to production, and
optimize performance for all components."

// ✅ Better: Break into focused phases
"Phase 1: Analyze the user authentication module for bugs.
Phase 2: Fix identified issues with proper error handling.
Phase 3: Add comprehensive tests for the fixed code.
Phase 4: Update documentation for the changes made."
```

### 4. Ignoring Error Scenarios

```typescript
// ❌ Anti-pattern: No error handling
"Create an API endpoint to process payments."

// ✅ Better: Comprehensive error handling
"Create a payment processing API endpoint that handles:
- Invalid payment method errors
- Insufficient funds scenarios
- Network timeout failures
- Duplicate payment prevention
- Proper logging for all error cases
- User-friendly error messages"
```

## Testing and Validation

### 1. Prompt Testing Framework

```typescript
const promptTestSuite = {
  testCases: [
    {
      name: 'Simple Feature Request',
      input: 'Add a dark mode toggle',
      expectedElements: ['theme context', 'toggle component', 'CSS variables'],
      validationCriteria: ['accessibility support', 'persistence', 'smooth transitions'],
    },
    {
      name: 'Complex Refactoring',
      input: 'Refactor the authentication system to use OAuth',
      expectedElements: ['OAuth providers', 'token management', 'user session handling'],
      validationCriteria: [
        'security considerations',
        'backward compatibility',
        'migration strategy',
      ],
    },
  ],

  validationMetrics: [
    'completion_rate', // Did the AI complete all requested tasks?
    'quality_score', // How well does the solution meet quality standards?
    'accuracy_rating', // Are the technical details correct?
    'user_satisfaction', // Would a developer find this helpful?
    'efficiency_score', // Is the solution efficient and maintainable?
  ],
};
```

### 2. A/B Testing for Prompts

```typescript
const promptVariants = {
  variantA: {
    name: 'Direct Instructions',
    template: 'Implement X using Y technology with Z requirements.',
  },
  variantB: {
    name: 'Contextual Instructions',
    template: `
      Context: We're building a web application using Y technology.
      Requirements: Z
      Task: Implement X

      Please consider:
      - Performance implications
      - Security best practices
      - Maintainability
      - Testing requirements
    `,
  },
  variantC: {
    name: 'Step-by-Step Instructions',
    template: `
      Let's implement X step by step:

      Step 1: Analyze requirements and constraints
      Step 2: Design the implementation approach
      Step 3: Write the core functionality
      Step 4: Add error handling and validation
      Step 5: Write comprehensive tests
      Step 6: Add documentation

      Please complete each step and confirm before proceeding.
    `,
  },
};
```

## Measurement and Optimization

### 1. Prompt Performance Metrics

```typescript
interface PromptMetrics {
  // Effectiveness metrics
  taskCompletionRate: number; // % of tasks completed successfully
  qualityScore: number; // Average quality rating (1-10)
  userSatisfactionScore: number; // User satisfaction rating

  // Efficiency metrics
  averageResponseTime: number; // Average time to complete task
  tokenUsageEfficiency: number; // Results achieved per token
  costPerTask: number; // Financial cost per completed task

  // Reliability metrics
  errorRate: number; // % of tasks that failed
  retryRate: number; // % of tasks needing retries
  consistencyScore: number; // Consistency of results across runs

  // Learning metrics
  improvementOverTime: number; // Performance improvement trend
  adaptationSpeed: number; // How quickly prompt adapts to feedback
}
```

### 2. Continuous Improvement Process

```typescript
const promptImprovementCycle = {
  phases: [
    {
      name: 'Monitor',
      activities: [
        'Collect performance metrics',
        'Gather user feedback',
        'Identify failure patterns',
        'Track success criteria',
      ],
    },
    {
      name: 'Analyze',
      activities: [
        'Analyze performance data',
        'Identify improvement opportunities',
        'Correlate prompt variations with outcomes',
        'Document best practices',
      ],
    },
    {
      name: 'Optimize',
      activities: [
        'Refine prompt templates',
        'Add new validation rules',
        'Improve error handling',
        'Enhance context provision',
      ],
    },
    {
      name: 'Test',
      activities: [
        'A/B test prompt variations',
        'Validate with edge cases',
        'Measure performance improvements',
        'Document successful patterns',
      ],
    },
  ],

  frequency: 'bi-weekly',
  successCriteria: {
    qualityImprovement: '> 10%',
    efficiencyGain: '> 15%',
    errorReduction: '> 20%',
  },
};
```

## Conclusion

Writing effective prompts is a skill that improves with practice and continuous refinement. By following these best practices:

1. **Be specific and clear** in your instructions
2. **Provide complete context** for informed decisions
3. **Structure information logically** with progressive disclosure
4. **Use appropriate techniques** for different prompt types
5. **Implement quality assurance** with validation and self-correction
6. **Measure and optimize** performance continuously

Remember that prompt engineering is iterative. Start with these principles, gather feedback on what works best for your specific use cases, and continuously refine your approach based on real-world results.

---

_This guide will be updated as new prompting techniques and best practices emerge. Check back regularly for the latest recommendations._
