# Marketplace Management Skill

> **Comprehensive solution for creating, managing, and maintaining Claude Code Marketplaces**

## Overview

The Marketplace skill provides complete lifecycle management for Claude Code Marketplaces, enabling you to create, validate, deploy, and maintain marketplaces with plugins and skills.

## Features

### 🏗️ Marketplace Creation

- Create marketplaces from multiple templates (standard, enterprise, community, minimal)
- Automatic directory structure generation
- Configuration file creation with validation
- Git repository initialization
- Template-based file generation

### ✅ Validation and Testing

- Comprehensive marketplace structure validation
- Plugin and skill compatibility checking
- Configuration file validation
- Dependency analysis
- Security and compliance validation

### 🚀 Deployment and Distribution

- Automated deployment workflows
- Version management and tagging
- Release note generation
- Git integration and push operations
- Multiple deployment targets support

### 📊 Health Monitoring

- Marketplace health analysis
- Performance metrics collection
- Recommendation generation
- Structure and configuration scoring
- Plugin and skill usage analytics

### 🛠️ Management Tools

- Plugin addition and removal
- Skill management and organization
- Configuration updates
- Batch operations support
- Debug and troubleshooting tools

## Quick Start

### 1. Basic Marketplace Creation

```bash
"Create a new marketplace called my-awesome-marketplace"
```

### 2. Advanced Creation with Options

```bash
"Create an enterprise marketplace at ./enterprise-marketplace with enterprise template and verbose output"
```

### 3. Validation

```bash
"Validate the marketplace at ./my-marketplace with verbose output"
```

### 4. Deployment

```bash
"Deploy plugins from marketplace ./my-marketplace to production environment"
```

### 5. Health Analysis

```bash
"Analyze marketplace health for ./my-marketplace and generate recommendations"
```

## Directory Structure

```
marketplace/
├── SKILL.md                 # Main skill definition
├── README.md               # This file
├── scripts/                # Helper scripts
│   ├── marketplace-manager.js  # Main management script
│   └── ...
├── templates/              # Marketplace templates
│   ├── standard/           # Standard template
│   ├── enterprise/         # Enterprise template
│   ├── community/          # Community template
│   └── minimal/            # Minimal template
├── tests/                  # Test suite
│   └── marketplace.test.js
├── examples/               # Usage examples
└── docs/                   # Additional documentation
```

## Usage Examples

### Creating Marketplaces

#### Standard Marketplace

```bash
"Create a standard marketplace called dev-tools"
```

#### Enterprise Marketplace

```bash
"Create an enterprise marketplace at ./company-marketplace with enterprise template and auto-validation"
```

#### Community Marketplace

```bash
"Create a community marketplace called open-source-tools with community template"
```

### Managing Marketplaces

#### Validation

```bash
"Validate marketplace structure and configuration at ./my-marketplace"
```

#### Health Analysis

```bash
"Analyze marketplace health and generate improvement recommendations for ./my-marketplace"
```

#### Plugin Management

```bash
"Add new plugin to marketplace ./my-marketplace and validate compatibility"
```

### Deployment Operations

#### Standard Deployment

```bash
"Deploy marketplace ./my-marketplace with patch version update"
```

#### Major Release

```bash
"Deploy marketplace ./my-marketplace with major version update and skip validation"
```

#### Dry Run Deployment

```bash
"Deploy marketplace ./my-marketplace with dry-run mode to preview changes"
```

## Template Types

### Standard Template

- Complete marketplace structure
- Essential configuration files
- Standard validation rules
- Community-friendly setup

**Use Case**: General purpose marketplaces with standard features

### Enterprise Template

- Advanced security configurations
- Compliance frameworks (SOC2, ISO27001)
- Multi-team support
- Advanced monitoring and analytics

**Use Case**: Corporate environments with strict security and compliance requirements

### Community Template

- Open-source friendly configurations
- Community contribution guidelines
- Simplified validation rules
- Public distribution setup

**Use Case**: Open-source projects and community-driven marketplaces

### Minimal Template

- Core marketplace structure only
- Essential configuration files
- Basic validation
- Lightweight setup

**Use Case**: Simple marketplaces with minimal requirements

## Configuration

### Skill Parameters

The marketplace skill accepts the following parameters:

#### Required Parameters

- **action**: The action to perform (create, validate, deploy, update, analyze, init, template, test, list, status)
- **target**: Target marketplace, plugin, or directory path (optional for some actions)

#### Optional Parameters

- **options**: Configuration object with the following properties:
  - **verbose** (boolean): Enable verbose output (default: false)
  - **dry_run** (boolean): Perform actions without making changes (default: false)
  - **template** (string): Template type (standard, enterprise, community, minimal)
  - **auto_validate** (boolean): Automatically validate after creation (default: true)
  - **skip_tests** (boolean): Skip test execution (default: false)
  - **force** (boolean): Force action even if validation fails (default: false)

### Example Configurations

#### Basic Creation

```bash
"Create marketplace my-tools with standard template"
```

#### Advanced Configuration

```bash
"Create enterprise marketplace ./company-tools with enterprise template, verbose output, and auto-validation enabled"
```

#### Testing and Validation

```bash
"Test marketplace ./my-marketplace with comprehensive validation and skip tests if needed"
```

## Development and Testing

### Running Tests

```bash
cd marketplace/tests
node marketplace.test.js
```

### Test Coverage

The test suite covers:

- Marketplace creation and structure validation
- Template functionality and configuration
- Validation framework and error handling
- Health analysis and metrics generation
- Deployment workflows and version management

### Development Scripts

#### Marketplace Manager

```bash
cd marketplace/scripts
node marketplace-manager.js create test-marketplace
node marketplace-manager.js validate ./test-marketplace
node marketplace-manager.js analyze ./test-marketplace
```

#### Validation Script

```bash
cd marketplace/templates/standard/scripts
node validate.js --verbose
```

#### Deployment Script

```bash
cd marketplace/templates/standard/scripts
node deploy.js --type=patch --verbose
```

## API Reference

### Main Actions

#### Create

Creates a new marketplace from a template.

**Parameters**:

- **name**: Marketplace name (required for create action)
- **template**: Template type (default: standard)
- **path**: Target directory (default: ./name)
- **auto_validate**: Validate after creation (default: true)

**Example**:

```bash
"Create marketplace my-tools with standard template at ./my-tools"
```

#### Validate

Validates marketplace structure and configuration.

**Parameters**:

- **target**: Marketplace path (required)
- **verbose**: Enable detailed output

**Example**:

```bash
"Validate marketplace at ./my-tools with verbose output"
```

#### Deploy

Deploys marketplace plugins and updates.

**Parameters**:

- **target**: Marketplace path (required)
- **type**: Release type (patch, minor, major)
- **skip_validation**: Skip pre-deployment validation
- **force**: Force deployment despite validation failures

**Example**:

```bash
"Deploy marketplace ./my-tools with minor version update"
```

#### Analyze

Analyzes marketplace health and generates recommendations.

**Parameters**:

- **target**: Marketplace path (required)

**Example**:

```bash
"Analyze marketplace health for ./my-tools and generate recommendations"
```

### Supporting Actions

#### List

Lists marketplace contents and status.

#### Status

Shows marketplace status and metrics.

#### Test

Runs marketplace test suite.

#### Template

Generates template files and configurations.

## Integration with Claude Code

### Installation

1. Copy the marketplace skill to your skills directory:

```bash
cp -r marketplace ~/.claude/skills/
```

2. Restart Claude Code to load the skill

3. The skill will be automatically available when relevant tasks are detected

### Usage Patterns

The marketplace skill automatically triggers when you use phrases like:

- "Create a marketplace"
- "Validate marketplace"
- "Deploy marketplace"
- "Analyze marketplace health"
- "Generate marketplace template"

### Configuration

Skill behavior can be configured through:

- Direct parameters in your requests
- Default options in the skill configuration
- Environment variables for automated workflows

## Troubleshooting

### Common Issues

#### Marketplace Creation Fails

```bash
"Create marketplace with verbose output to see detailed error information"
```

#### Validation Errors

```bash
"Validate marketplace with comprehensive checks and review error messages"
```

#### Deployment Issues

```bash
"Deploy marketplace with dry-run mode to preview changes before deployment"
```

### Debug Mode

Enable verbose output for detailed troubleshooting:

```bash
"Create marketplace with verbose output and detailed logging"
```

### Getting Help

1. **Check Examples**: Review the examples directory for usage patterns
2. **Run Tests**: Execute the test suite to verify functionality
3. **Review Documentation**: Check individual template documentation
4. **Enable Debug Mode**: Use verbose output for detailed information

## Best Practices

### Development

- Use appropriate templates for different use cases
- Validate marketplaces before deployment
- Test thoroughly across different environments
- Keep documentation up to date

### Security

- Review permissions and access controls
- Validate plugin sources and dependencies
- Implement proper authentication and authorization
- Follow enterprise security standards

### Performance

- Use appropriate validation levels
- Implement caching for repeated operations
- Monitor resource usage and bottlenecks
- Optimize for large marketplaces

## Contributing

To contribute to the marketplace skill:

1. **Fork the Repository**: Create a fork of the marketplace repository
2. **Create Feature Branch**: Use descriptive branch names
3. **Add Tests**: Include comprehensive tests for new features
4. **Update Documentation**: Keep documentation current
5. **Submit Pull Request**: Provide detailed descriptions of changes

### Development Guidelines

- Follow the existing code style and structure
- Add comprehensive error handling
- Include verbose logging options
- Test across different template types
- Validate all functionality

## License

This marketplace skill is licensed under the MIT License.

## Support

- **Documentation**: Review the comprehensive guides and examples
- **Issues**: Report bugs and feature requests through GitHub issues
- **Community**: Join discussions in the community forums
- **Examples**: Check the examples directory for usage patterns

---

_Generated with Claude Code Marketplace Management Skill_
