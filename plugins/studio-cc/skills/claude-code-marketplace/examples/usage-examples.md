# Marketplace Skill Usage Examples

> **Practical examples for using the Marketplace Management Skill**

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Advanced Scenarios](#advanced-scenarios)
3. [Enterprise Examples](#enterprise-examples)
4. [Troubleshooting Examples](#troubleshooting-examples)
5. [Integration Examples](#integration-examples)

## Basic Usage

### Example 1: Creating Your First Marketplace

**Prompt**:

```bash
"Create a new marketplace called dev-tools"
```

**Expected Output**:

```
Creating marketplace 'dev-tools' at ./dev-tools using standard template
Creating directory: ./dev-tools
Creating directory: ./dev-tools/.claude-plugin
Creating directory: ./dev-tools/plugins
Creating directory: ./dev-tools/skills
Creating directory: ./dev-tools/docs
Creating directory: ./dev-tools/scripts
Creating directory: ./dev-tools/examples
Generating marketplace configuration: ./dev-tools/.claude-plugin/marketplace.json
Copying template file: README.md
Copying template file: .claude-plugin/plugin.json
Copying template file: docs/GUIDE.md
Copying template file: scripts/validate.js
Copying template file: scripts/deploy.js
Initializing git repository in: ./dev-tools
Marketplace 'dev-tools' created successfully
```

### Example 2: Validating a Marketplace

**Prompt**:

```bash
"Validate the marketplace at ./dev-tools"
```

**Expected Output**:

```
Validating marketplace at: ./dev-tools
Validation completed: SUCCESS
Info messages:
  Required directory found: .claude-plugin
  Required file found: .claude-plugin/marketplace.json
  Optional directory found: plugins
  Optional directory found: skills
  Optional directory found: docs
  Optional directory found: scripts
  Optional directory found: examples
  Configuration file validated successfully
```

### Example 3: Analyzing Marketplace Health

**Prompt**:

```bash
"Analyze marketplace health for ./dev-tools"
```

**Expected Output**:

```
Analyzing marketplace health: ./dev-tools
Marketplace Health Analysis
Overall Score: 85/100
Structure: 100/100
Configuration: 90/100
Plugins: 70/100
Documentation: 80/100
Recommendations:
  - Add more plugins or fix existing plugin issues
  - Improve documentation by adding comprehensive guides and examples
Metrics:
  plugin_count: 0
  skill_count: 0
  total_size: 15678
  last_modified: 2025-11-02T17:45:30.123Z
```

## Advanced Scenarios

### Example 4: Creating Enterprise Marketplace

**Prompt**:

```bash
"Create an enterprise marketplace at ./company-marketplace with enterprise template, verbose output, and auto-validation"
```

**Expected Output**:

```
Creating marketplace 'company-marketplace' at ./company-marketplace using enterprise template
Creating directory: ./company-marketplace
Creating directory: ./company-marketplace/.claude-plugin
Creating directory: ./company-marketplace/plugins
Creating directory: ./company-marketplace/skills
Creating directory: ./company-marketplace/docs
Creating directory: ./company-marketplace/tests
Creating directory: ./company-marketplace/scripts
Creating directory: ./company-marketplace/examples
Generating marketplace configuration: ./company-marketplace/.claude-plugin/marketplace.json
Copying template file: README.md
Copying template file: .claude-plugin/plugin.json
Copying template file: docs/ENTERPRISE.md
Copying template file: docs/SECURITY.md
Copying template file: scripts/validate.js
Copying template file: scripts/deploy.js
Copying template file: scripts/security-scan.js
Copying template file: tests/compliance.test.js
Initializing git repository in: ./company-marketplace
Validating marketplace at: ./company-marketplace
Validation completed: SUCCESS
Marketplace 'company-marketplace' created successfully
```

### Example 5: Deployment with Version Update

**Prompt**:

```bash
"Deploy marketplace ./dev-tools with minor version update and skip validation"
```

**Expected Output**:

```
Deploying marketplace from: ./dev-tools
Current version: 1.0.0
New version: 1.1.0
Updated marketplace version to: 1.1.0
Release notes generated: ./dev-tools/RELEASE_NOTES.md
Creating git tag: v1.1.0
Git tag v1.1.0 created successfully
Pushing to remote repository...
Successfully pushed to remote repository
Deployment completed successfully
Version: 1.1.0
Release notes: ./dev-tools/RELEASE_NOTES.md
Git tag created and pushed
```

### Example 6: Community Marketplace Creation

**Prompt**:

```bash
"Create a community marketplace called open-source-tools with community template"
```

**Expected Output**:

```
Creating marketplace 'open-source-tools' at ./open-source-tools using community template
Creating directory: ./open-source-tools
Creating directory: ./open-source-tools/.claude-plugin
Creating directory: ./open-source-tools/plugins
Creating directory: ./open-source-tools/skills
Creating directory: ./open-source-tools/docs
Creating directory: ./open-source-tools/tests
Creating directory: ./open-source-tools/scripts
Creating directory: ./open-source-tools/examples
Generating marketplace configuration: ./open-source-tools/.claude-plugin/marketplace.json
Copying template file: README.md
Copying template file: .claude-plugin/plugin.json
Copying template file: docs/CONTRIBUTING.md
Copying template file: docs/COMMUNITY.md
Copying template file: scripts/validate.js
Copying template file: scripts/deploy.js
Initializing git repository in: ./open-source-tools
Validating marketplace at: ./open-source-tools
Validation completed: SUCCESS
Marketplace 'open-source-tools' created successfully
```

## Enterprise Examples

### Example 7: Enterprise Security Validation

**Prompt**:

```bash
"Validate enterprise marketplace at ./company-marketplace with comprehensive security checks"
```

**Expected Output**:

```
Validating marketplace at: ./company-marketplace
Validation completed: SUCCESS
Info messages:
  Required directory found: .claude-plugin
  Required file found: .claude-plugin/marketplace.json
  Optional directory found: plugins
  Optional directory found: skills
  Optional directory found: docs
  Optional directory found: tests
  Optional directory found: scripts
  Optional directory found: examples
  Configuration file validated successfully
  Security configuration validated
  Compliance checks passed
```

### Example 8: Batch Plugin Addition

**Prompt**:

```bash
"Add multiple plugins to enterprise marketplace ./company-marketplace: code-quality, security-scanner, deployment-tools"
```

**Expected Output**:

```
Adding plugins to marketplace: ./company-marketplace
Adding plugin: code-quality
Creating plugin directory: ./company-marketplace/plugins/code-quality
Generating plugin configuration
Validating plugin structure
Plugin validated: code-quality

Adding plugin: security-scanner
Creating plugin directory: ./company-marketplace/plugins/security-scanner
Generating plugin configuration
Validating plugin structure
Plugin validated: security-scanner

Adding plugin: deployment-tools
Creating plugin directory: ./company-marketplace/plugins/deployment-tools
Generating plugin configuration
Validating plugin structure
Plugin validated: deployment-tools

Updated marketplace configuration with 3 plugins
Validating updated marketplace
Validation completed: SUCCESS
```

## Troubleshooting Examples

### Example 9: Debug Creation Issues

**Prompt**:

```bash
"Create marketplace debug-test with verbose output to troubleshoot creation issues"
```

**Expected Output**:

```
Creating marketplace 'debug-test' at ./debug-test using standard template
Creating directory: ./debug-test
Creating directory: ./debug-test/.claude-plugin
Creating directory: ./debug-test/plugins
Creating directory: ./debug-test/skills
Creating directory: ./debug-test/docs
Creating directory: ./debug-test/tests
Creating directory: ./debug-test/scripts
Creating directory: ./debug-test/examples
Generating marketplace configuration: ./debug-test/.claude-plugin/marketplace.json
Copying template file: README.md
Copying template file: .claude-plugin/plugin.json
Copying template file: docs/GUIDE.md
Copying template file: scripts/validate.js
Copying template file: scripts/deploy.js
Initializing git repository in: ./debug-test
Validating marketplace at: ./debug-test
Validation completed: SUCCESS
Marketplace 'debug-test' created successfully
```

### Example 10: Force Deployment Despite Validation Errors

**Prompt**:

```bash
"Deploy marketplace ./problematic-marketplace with force option to override validation failures"
```

**Expected Output**:

```
Deploying marketplace from: ./problematic-marketplace
Validating marketplace before deployment...
Validation completed: FAILED
Errors found: 2
  - Required configuration field missing: description
  - Invalid version format: 1.0

Marketplace validation failed: Required configuration field missing: description
Proceeding with deployment despite validation failures (force mode)
Current version: 1.0
New version: 1.0.1
Updated marketplace version to: 1.0.1
Release notes generated: ./problematic-marketplace/RELEASE_NOTES.md
Creating git tag: v1.0.1
Git tag v1.0.1 created successfully
Pushing to remote repository...
Successfully pushed to remote repository
Deployment completed successfully
Version: 1.0.1
Release notes: ./problematic-marketplace/RELEASE_NOTES.md
Git tag created and pushed
```

## Integration Examples

### Example 11: CI/CD Pipeline Integration

**Prompt**:

```bash
"Create marketplace ./ci-cd-marketplace with minimal template for automated CI/CD pipeline deployment"
```

**Expected Output**:

```
Creating marketplace 'ci-cd-marketplace' at ./ci-cd-marketplace using minimal template
Creating directory: ./ci-cd-marketplace
Creating directory: ./ci-cd-marketplace/.claude-plugin
Creating directory: ./ci-cd-marketplace/plugins
Creating directory: ./ci-cd-marketplace/skills
Creating directory: ./ci-cd-marketplace/docs
Creating directory: ./ci-cd-marketplace/tests
Creating directory: ./ci-cd-marketplace/scripts
Creating directory: ./ci-cd-marketplace/examples
Generating marketplace configuration: ./ci-cd-marketplace/.claude-plugin/marketplace.json
Copying template file: README.md
Copying template file: .claude-plugin/plugin.json
Copying template file: scripts/validate.js
Initializing git repository in: ./ci-cd-marketplace
Validating marketplace at: ./ci-cd-marketplace
Validation completed: SUCCESS
Marketplace 'ci-cd-marketplace' created successfully
```

### Example 12: Multi-Environment Deployment

**Prompt**:

```bash
"Deploy marketplace ./production-marketplace to production environment with major version update and comprehensive validation"
```

**Expected Output**:

```
Deploying marketplace from: ./production-marketplace
Validating marketplace before deployment...
Validation completed: SUCCESS
Current version: 2.1.0
New version: 3.0.0
Updated marketplace version to: 3.0.0
Release notes generated: ./production-marketplace/RELEASE_NOTES.md
Creating git tag: v3.0.0
Git tag v3.0.0 created successfully
Pushing to remote repository...
Successfully pushed to remote repository
Deployment completed successfully
Version: 3.0.0
Release notes: ./production-marketplace/RELEASE_NOTES.md
Git tag created and pushed
```

## Complex Workflow Examples

### Example 13: Complete Marketplace Lifecycle

**Step 1: Creation**

```bash
"Create marketplace full-lifecycle-demo with enterprise template"
```

**Step 2: Adding Content**

```bash
"Add plugins code-formatter and test-runner to marketplace ./full-lifecycle-demo"
```

**Step 3: Validation**

```bash
"Validate marketplace ./full-lifecycle-demo with comprehensive checks"
```

**Step 4: Health Analysis**

```bash
"Analyze marketplace health for ./full-lifecycle-demo and generate improvement recommendations"
```

**Step 5: Deployment**

```bash
"Deploy marketplace ./full-lifecycle-demo with minor version update"
```

### Example 14: Template Customization

**Prompt**:

```bash
"Create marketplace custom-template-demo with standard template and then customize validation rules to be more strict"
```

**Expected Output**:

```
Creating marketplace 'custom-template-demo' at ./custom-template-demo using standard template
[... directory creation and file copying ...]
Marketplace 'custom-template-demo' created successfully

Customizing validation rules for marketplace ./custom-template-demo...
Updated validation configuration:
{
  "level": "strict",
  "strict": true,
  "checks": ["structure", "metadata", "plugins", "security", "documentation", "performance"]
}

Validation with custom rules completed: SUCCESS
```

## Error Handling Examples

### Example 15: Invalid Marketplace Name

**Prompt**:

```bash
"Create marketplace with invalid name containing special characters!@#$"
```

**Expected Output**:

```
Error: Invalid marketplace name. Names should only contain letters, numbers, hyphens, and underscores.
Please use a valid name like: my-marketplace or my_marketplace
```

### Example 16: Non-Existent Marketplace Validation

**Prompt**:

```bash
"Validate marketplace at ./non-existent-marketplace with verbose output"
```

**Expected Output**:

```
Validating marketplace at: ./non-existent-marketplace
Validation completed: FAILED
Errors found: 1
  - Marketplace directory does not exist
```

### Example 17: Permission Issues

**Prompt**:

```bash
"Create marketplace in restricted directory /root/protected-marketplace"
```

**Expected Output**:

```
Error: Permission denied when creating directory /root/protected-marketplace
Please choose a different directory or check permissions.
```

## Performance and Scaling Examples

### Example 18: Large Marketplace Analysis

**Prompt**:

```bash
"Analyze performance of large marketplace ./large-enterprise-marketplace with 50+ plugins"
```

**Expected Output**:

```
Analyzing marketplace health: ./large-enterprise-marketplace
Scanning 52 plugins...
Analyzing plugin configurations...
Validating plugin dependencies...
Checking skill compatibility...
Marketplace Health Analysis
Overall Score: 78/100
Structure: 95/100
Configuration: 85/100
Plugins: 72/100
Documentation: 60/100
Recommendations:
  - Improve documentation by adding comprehensive guides and examples
  - Optimize plugin loading order for better performance
  - Consider grouping related plugins into categories
Metrics:
  plugin_count: 52
  skill_count: 15
  total_size: 157890
  last_modified: 2025-11-02T17:45:30.123Z
  performance_score: 72
```

---

_These examples demonstrate practical usage patterns for the Marketplace Management Skill. Adapt them to your specific needs and requirements._
