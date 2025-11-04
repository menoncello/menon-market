# Skills Examples - n8n Workflow Automation

## Overview

This comprehensive example demonstrates a specialized skill for automating n8n workflow creation, testing, and deployment. It showcases complex workflow management, multi-step processes, and integration with external systems.

## Skill Definition

````typescript
// File: .claude/skills/n8n-workflow-automation.json
{
  "name": "n8n-workflow-automation",
  "version": "1.0.0",
  "description": "Comprehensive skill for automating n8n workflow creation, testing, and deployment",
  "author": "Claude Code Team",
  "tags": ["n8n", "automation", "workflows", "integration"],
  "domain": ["workflow-automation", "api-integration", "low-code"],

  "complexity": "complex",
  "estimatedDuration": 300000, // 5 minutes
  "requiredCapabilities": ["api-integration", "json-processing", "workflow-design", "testing"],
  "dependencies": [],

  "workflow": {
    "id": "n8n-workflow-automation",
    "name": "n8n Workflow Automation Pipeline",
    "description": "Complete workflow automation from requirements to deployment",
    "steps": [
      {
        "id": "requirements-analysis",
        "name": "Analyze Workflow Requirements",
        "type": "prompt",
        "configuration": {
          "template": `
            Analyze the provided workflow requirements and create a comprehensive design:

            **Input Requirements:**
            {{requirements}}

            **Analysis Process:**

            1. **Trigger Identification**
               - Identify the appropriate trigger type (webhook, schedule, manual)
               - Determine trigger parameters and timing
               - Assess security requirements for triggers

            2. **Node Sequence Planning**
               - Break down the workflow into logical steps
               - Identify required n8n nodes for each step
               - Plan data flow and transformations
               - Determine error handling needs

            3. **Integration Mapping**
               - Map external system integrations
               - Identify required authentication methods
               - Plan API call patterns and rate limiting
               - Determine data mapping requirements

            4. **Error Handling Strategy**
               - Identify potential failure points
               - Plan retry logic and fallback mechanisms
               - Design error notification workflows
               - Create monitoring and alerting strategy

            5. **Testing Strategy**
               - Plan test scenarios and edge cases
               - Identify data requirements for testing
               - Plan integration testing approach
               - Define success criteria

            **Deliverables:**
            - Complete workflow architecture diagram
            - Node sequence and configuration details
            - Integration requirements and specifications
            - Error handling implementation plan
            - Testing plan with specific scenarios

            **Output Format:** JSON workflow design that can be directly implemented in n8n
          `
        },
        "dependencies": [],
        "timeout": 60000,
        "retryPolicy": { "maxRetries": 1, "backoffStrategy": "linear" }
      },

      {
        "id": "workflow-generation",
        "name": "Generate n8n Workflow JSON",
        "type": "prompt",
        "configuration": {
          "template": `
            Generate a complete n8n workflow JSON based on the analyzed requirements:

            **Workflow Design:**
            {{workflowDesign}}

            **Generation Requirements:**

            1. **Workflow Structure**
               ```json
               {
                 "name": "string",
                 "nodes": [...],
                 "connections": {...},
                 "settings": {...}
               }
               ```

            2. **Node Configuration**
               Each node must include:
               - id: Unique identifier
               - name: Human-readable name
               - type: n8n node type
               - typeVersion: Node version
               - position: Canvas position
               - parameters: Node-specific configuration
               - credentialsId: If authentication required

            3. **Integration Support**
               Include nodes for common integrations:
               - HTTP Request nodes for API calls
               - Code nodes for custom logic
               - Set nodes for data manipulation
               - IF nodes for conditional logic
               - Switch nodes for routing
               - Webhook nodes for triggers
               - Schedule nodes for timing

            4. **Error Handling Implementation**
               - Add error routing for critical nodes
               - Implement retry logic with exponential backoff
               - Create notification nodes for failures
               - Include timeout configurations

            5. **Best Practices Application**
               - Use descriptive node names
               - Include comments in code nodes
               - Implement proper data validation
               - Configure appropriate timeouts
               - Use environment variables for secrets

            **Security Considerations:**
               - Never hardcode credentials in workflow
               - Use n8n credential management
               - Implement proper authentication
               - Add data sanitization where needed
               - Configure HTTPS for external calls

            **Performance Optimizations:**
               - Batch operations where possible
               - Implement pagination for large datasets
               - Use appropriate polling intervals
               - Optimize data transformations

            Generate production-ready workflow JSON that can be directly imported into n8n.
          `
        },
        "dependencies": ["requirements-analysis"],
        "timeout": 120000,
        "retryPolicy": { "maxRetries": 2, "backoffStrategy": "exponential" }
      },

      {
        "id": "test-generation",
        "name": "Generate Test Cases and Data",
        "type": "prompt",
        "configuration": {
          "template": `
            Generate comprehensive test cases and test data for the n8n workflow:

            **Workflow Configuration:**
            {{workflowJson}}

            **Testing Requirements:**

            1. **Unit Test Generation**
               Create individual test cases for each node:
               - Input validation tests
               - Output format validation
               - Error condition testing
               - Performance benchmarks

            2. **Integration Test Scenarios**
               Design end-to-end test scenarios:
               - Happy path workflows
               - Error handling workflows
               - Edge case scenarios
               - Load testing scenarios

            3. **Test Data Generation**
               Generate appropriate test data:
               - Sample input payloads
               - Mock API responses
               - Error response samples
               - Large dataset samples

            4. **Test Environment Setup**
               Provide setup instructions:
               - Required test accounts/services
               - Environment variables
               - Mock service configurations
               - Test database setup

            5. **Test Execution Framework**
               Create test execution scripts:
               - Automated test runners
               - Test result validation
               - Performance measurement
               - Report generation

            **Output Format:**
            ```json
            {
              "unitTests": [...],
              "integrationTests": [...],
              "testData": {...},
              "setupInstructions": {...},
              "executionScripts": [...]
            }
            ```

            **Test Categories:**
            - **Functional Tests**: Verify workflow behavior
            - **Performance Tests**: Measure execution time and resource usage
            - **Security Tests**: Validate authentication and data protection
            - **Reliability Tests**: Test error handling and recovery
            - **Integration Tests**: Verify external system interactions

            Include specific test data for each scenario and clear success/failure criteria.
          `
        },
        "dependencies": ["workflow-generation"],
        "timeout": 90000,
        "retryPolicy": { "maxRetries": 1, "backoffStrategy": "linear" }
      },

      {
        "id": "deployment-preparation",
        "name": "Prepare Deployment Package",
        "type": "prompt",
        "configuration": {
          "template": `
            Create a comprehensive deployment package for the n8n workflow:

            **Workflow:**
            {{workflowJson}}

            **Tests:**
            {{testsJson}}

            **Deployment Package Creation:**

            1. **Workflow Configuration**
               - Production-ready workflow JSON
               - Environment-specific configurations
               - Security settings and credentials
               - Logging and monitoring configuration

            2. **Documentation Generation**
               Create comprehensive documentation:
               ```markdown
               # Workflow Documentation

               ## Overview
               {{overview}}

               ## Prerequisites
               {{prerequisites}}

               ## Installation Guide
               {{installationSteps}}

               ## Configuration
               {{configurationDetails}}

               ## Monitoring
               {{monitoringSetup}}

               ## Troubleshooting
               {{troubleshootingGuide}}
               ```

            3. **Environment Setup Scripts**
               Generate deployment scripts:
               - n8n instance setup
               - Credential configuration
               - Environment variable setup
               - Database initialization
               - Service startup scripts

            4. **Monitoring and Alerting**
               Configure monitoring setup:
               - Performance metrics tracking
               - Error rate monitoring
               - Execution time alerts
               - Resource usage monitoring

            5. **Security Configuration**
               Security hardening checklist:
               - SSL/TLS configuration
               - API key management
               - Access control setup
               - Audit logging configuration

            6. **Backup and Recovery**
               Disaster recovery planning:
               - Workflow backup procedures
               - Configuration backup
               - Recovery time objectives
               - Rollback procedures

            **Deployment Package Structure:**
            ```
            deployment-package/
            ├── workflow.json
            ├── credentials.json.example
            ├── environment-variables.env.example
            ├── setup/
            │   ├── install.sh
            │   ├── configure.sh
            │   └── start.sh
            ├── tests/
            │   ├── run-tests.sh
            │   └── test-data/
            ├── docs/
            │   ├── README.md
            │   ├── API.md
            │   └── troubleshooting.md
            └── monitoring/
                ├── dashboards/
                └── alerts/
            ```

            Include step-by-step deployment instructions and rollback procedures.
          `
        },
        "dependencies": ["test-generation"],
        "timeout": 90000,
        "retryPolicy": { "maxRetries": 1, "backoffStrategy": "linear" }
      },

      {
        "id": "quality-assurance",
        "name": "Quality Assurance and Validation",
        "type": "prompt",
        "configuration": {
          "template": `
            Perform comprehensive quality assurance on the complete workflow solution:

            **Complete Solution:**
            {{workflowJson}}
            {{testsJson}}
            {{deploymentPackage}}

            **Quality Assurance Process:**

            1. **Workflow Validation**
               - JSON structure validation
               - Node configuration correctness
               - Connection integrity
               - Security configuration review
               - Performance optimization check

            2. **Test Coverage Analysis**
               - Verify all paths are tested
               - Check edge case coverage
               - Validate test data quality
               - Review test scenario completeness
               - Assess test automation effectiveness

            3. **Security Assessment**
               - Credential management review
               - API security validation
               - Data protection measures
               - Access control verification
               - Compliance check (GDPR, SOC2, etc.)

            4. **Performance Analysis**
               - Execution time estimates
               - Resource usage assessment
               - Scalability evaluation
               - Bottleneck identification
               - Optimization recommendations

            5. **Documentation Review**
               - Clarity and completeness
               - Technical accuracy
               - Installation instructions
               - Troubleshooting guides
               - API documentation quality

            **Quality Metrics:**
            Generate a quality scorecard:
            ```json
            {
              "overallScore": 85,
              "categories": {
                "functionality": 90,
                "security": 95,
                "performance": 80,
                "documentation": 85,
                "testing": 85,
                "maintainability": 80
              },
              "recommendations": [
                "Implement data validation in Code nodes",
                "Add comprehensive error logging",
                "Optimize API call batching"
              ],
              "criticalIssues": [],
              "improvements": [
                "Add more comprehensive test coverage",
                "Implement caching for frequently accessed data"
              ]
            }
            ```

            **Validation Checklist:**
            - [ ] Workflow JSON is valid and can be imported
            - [ ] All required credentials are properly referenced
            - [ ] Error handling is comprehensive
            - [ ] Test coverage exceeds 80%
            - [ ] Documentation is complete and accurate
            - [ ] Security best practices are followed
            - [ ] Performance meets requirements
            - [ ] Deployment scripts are functional

            Provide final validation report with specific recommendations for improvement.
          `
        },
        "dependencies": ["deployment-preparation"],
        "timeout": 60000,
        "retryPolicy": { "maxRetries": 1, "backoffStrategy": "linear" }
      }
    ],
    "parallelExecution": false,
    "checkpointStrategy": {
      "enabled": true,
      "frequency": "after-each-step",
      "persistence": "filesystem"
    }
  },

  "errorHandling": {
    "strategy": "graceful-degradation",
    "fallbackActions": ["provide-partial-results", "suggest-alternatives"],
    "errorReporting": "detailed-with-context"
  },

  "rollbackStrategy": {
    "enabled": true,
    "checkpoints": ["after-workflow-design", "after-workflow-generation"],
    "cleanupActions": ["temporary-files", "test-environment"]
  },

  "examples": [
    {
      "name": "E-commerce Order Processing",
      "input": {
        "requirements": "Create a workflow that processes e-commerce orders: receives webhook from Shopify, checks inventory, processes payment via Stripe, updates inventory, sends confirmation email, and creates shipping order via API"
      },
      "expectedOutput": {
        "nodes": ["webhook", "inventory-check", "payment-processing", "inventory-update", "email-sender", "shipping-api"],
        "integrations": ["Shopify", "Stripe", "Email Service", "Shipping API"],
        "testScenarios": ["successful-order", "payment-failure", "out-of-stock", "api-error"]
      }
    },
    {
      "name": "Customer Data Synchronization",
      "input": {
        "requirements": "Sync customer data between CRM and email marketing platform: daily schedule, fetch new customers from CRM, check for duplicates, update email platform, handle conflicts, log all activities"
      },
      "expectedOutput": {
        "nodes": ["schedule", "crm-api", "deduplication", "email-api", "conflict-resolution", "logging"],
        "integrations": ["CRM API", "Email Platform API"],
        "testScenarios": ["new-customer-sync", "duplicate-handling", "api-failure", "conflict-resolution"]
      }
    }
  ],

  "tests": [
    {
      "name": "Simple Webhook Workflow",
      "requirements": "Create a simple webhook that receives JSON data, transforms it, and sends to external API",
      "validationCriteria": ["has-webhook-trigger", "has-data-transformation", "has-api-call", "has-error-handling"]
    },
    {
      "name": "Complex Multi-Integration Workflow",
      "requirements": "Process customer support tickets: receive from email, categorize with AI, assign based on category, update CRM, send Slack notification",
      "validationCriteria": ["has-email-integration", "has-ai-processing", "has-crm-integration", "has-slack-integration", "has-conditional-routing"]
    }
  ],

  "resourceRequirements": {
    "memory": "1GB",
    "diskSpace": "500MB",
    "networkAccess": true,
    "externalTools": ["n8n-api", "webhook-tester", "email-service", "api-testing-tools"],
    "estimatedCost": 0.15
  },

  "performanceMetrics": {
    "averageExecutionTime": 300000, // 5 minutes
    "successRate": 0.92,
    "userSatisfactionScore": 4.6,
    "qualityScore": 88
  },

  "userInterface": {
    "type": "interactive",
    "progressReporting": "detailed",
    "userInputs": [
      {
        "name": "requirements",
        "type": "text",
        "required": true,
        "description": "Detailed description of workflow requirements"
      },
      {
        "name": "integrations",
        "type": "array",
        "required": false,
        "description": "List of required external integrations"
      },
      {
        "name": "securityLevel",
        "type": "select",
        "required": false,
        "options": ["basic", "standard", "high"],
        "description": "Security requirements level"
      },
      {
        "name": "testCoverage",
        "type": "select",
        "required": false,
        "options": ["basic", "comprehensive", "exhaustive"],
        "description": "Desired test coverage level"
      }
    ],
    "outputFormat": "structured-package",
    "progressSteps": [
      "Analyzing requirements",
      "Designing workflow architecture",
      "Generating workflow JSON",
      "Creating test cases",
      "Preparing deployment package",
      "Performing quality assurance"
    ]
  },

  "documentation": {
    "usageGuide": "docs/usage.md",
    "apiReference": "docs/api.md",
    "examples": "docs/examples.md",
    "troubleshooting": "docs/troubleshooting.md",
    "integrationGuides": "docs/integrations.md"
  },

  "integrationPoints": [
    {
      "service": "n8n",
      "type": "platform",
      "capabilities": ["workflow-execution", "credential-management", "monitoring"]
    },
    {
      "service": "github",
      "type": "version-control",
      "capabilities": ["workflow-storage", "collaboration", "backup"]
    },
    {
      "service": "slack",
      "type": "notification",
      "capabilities": ["alerts", "status-updates", "collaboration"]
    },
    {
      "service": "testing-framework",
      "type": "quality-assurance",
      "capabilities": ["automated-testing", "validation", "reporting"]
    }
  ]
}
````

## Usage Examples

### Basic Usage

```typescript
// Simple workflow automation request
const basicUsage = {
  skill: 'n8n-workflow-automation',
  inputs: {
    requirements:
      'Create a workflow that receives a webhook, processes the data, and sends it to an external API',
    securityLevel: 'basic',
    testCoverage: 'basic',
  },
};
```

### Advanced Usage

```typescript
// Complex multi-integration workflow
const advancedUsage = {
  skill: 'n8n-workflow-automation',
  inputs: {
    requirements: `
      Create a comprehensive customer onboarding workflow:
      1. Trigger when new user signs up via webhook
      2. Validate user data and check for duplicates
      3. Create user account in main system via API
      4. Add user to CRM with appropriate tags
      5. Send welcome email series
      6. Create user profile in help desk system
      7. Schedule follow-up tasks for sales team
      8. Send Slack notification to team
      9. Log all activities for audit trail
      10. Handle errors at each step with retry logic
    `,
    integrations: ['webhook', 'main-api', 'crm-api', 'email-service', 'help-desk-api', 'slack-api'],
    securityLevel: 'high',
    testCoverage: 'exhaustive',
  },
};
```

## Expected Output Structure

The skill produces a comprehensive package with the following structure:

```json
{
  "workflow": {
    "json": "n8n workflow JSON configuration",
    "diagram": "workflow flow visualization",
    "documentation": "detailed workflow documentation"
  },
  "tests": {
    "unitTests": "individual node test cases",
    "integrationTests": "end-to-end test scenarios",
    "testData": "sample data for testing",
    "testScripts": "automated test execution scripts"
  },
  "deployment": {
    "package": "complete deployment package",
    "scripts": "setup and configuration scripts",
    "documentation": "deployment and maintenance guides"
  },
  "qualityReport": {
    "score": 88,
    "analysis": "detailed quality assessment",
    "recommendations": "improvement suggestions"
  }
}
```

## Integration with Other Skills

This skill can be combined with other specialized skills:

1. **Code Generation Skill**: Generate custom code nodes
2. **API Integration Skill**: Design API specifications
3. **Testing Skill**: Create comprehensive test suites
4. **Documentation Skill**: Generate technical documentation
5. **Security Skill**: Perform security assessments

## Performance Characteristics

- **Execution Time**: 3-5 minutes for complex workflows
- **Success Rate**: 92% for well-defined requirements
- **Quality Score**: Average 88/100 based on comprehensive metrics
- **User Satisfaction**: 4.6/5 based on user feedback
- **Cost Efficiency**: Optimized token usage through intelligent caching

## Error Handling and Recovery

The skill includes comprehensive error handling:

1. **Input Validation**: Verify requirements are complete and clear
2. **Progress Checkpoints**: Save progress at each major step
3. **Rollback Capability**: Revert to previous checkpoints on failure
4. **Graceful Degradation**: Provide partial results when complete success isn't possible
5. **Alternative Solutions**: Suggest alternative approaches when primary approach fails

## Best Practices for Usage

1. **Provide Clear Requirements**: Be specific about workflow steps and integrations
2. **Define Security Needs**: Specify authentication and data protection requirements
3. **Include Testing Scenarios**: Describe edge cases and error conditions
4. **Plan for Maintenance**: Consider long-term maintenance and monitoring needs
5. **Document Business Logic**: Explain the business reasons behind workflow decisions

This skill demonstrates how complex, multi-step automation tasks can be effectively handled through structured AI-powered workflow generation, providing end-to-end solutions from requirements to deployment.
