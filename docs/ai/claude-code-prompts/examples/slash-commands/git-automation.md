# Slash Commands Examples - Git Automation

## Overview

This collection demonstrates practical slash commands for Git workflow automation. These examples showcase different complexity levels and integration patterns.

## Basic Commands

### Smart Commit

```typescript
// File: .claude/commands/commit.json
{
  "name": "commit",
  "description": "Create intelligent git commit with automated message generation",
  "template": `
    Create a git commit following this workflow:

    1. **Check Repository State**
       - Run 'git status' to see current state
       - Ensure there are staged changes
       - Verify working directory is clean (except for changes being committed)

    2. **Analyze Changes**
       - Run 'git diff --cached' to see staged changes
       - Run 'git diff' to see unstaged changes (if any)
       - Identify file types and components modified

    3. **Review Recent Commits**
       - Run 'git log --oneline -5' to understand commit message style
       - Note any ongoing feature branches or patterns

    4. **Generate Commit Message**
       - Use conventional commit format: type(scope): description
       - Types: feat, fix, docs, style, refactor, test, chore
       - Include scope when relevant (component, module, feature)
       - Keep description under 72 characters
       - Use present tense ("add" not "added")
       - Capitalize subject line

    5. **Create Commit**
       - Use the generated commit message
       - Include detailed body if {{verbose}} is true
       - Reference any related issue numbers

    {{#if verbose}}
    Commit Body Format:
    - Explain what changed and why
    - Mention any breaking changes
    - Reference issue numbers: Closes #123
    {{/if}}

    Example outputs:
    - feat(auth): add OAuth integration with Google provider
    - fix(api): resolve user profile update validation error
    - docs(readme): update installation instructions for Node 18+
  `,
  "parameters": [
    {
      "name": "message",
      "type": "string",
      "required": false,
      "description": "Optional custom commit message",
      "defaultValue": null
    },
    {
      "name": "verbose",
      "type": "boolean",
      "required": false,
      "description": "Include detailed commit body",
      "defaultValue": false
    },
    {
      "name": "amend",
      "type": "boolean",
      "required": false,
      "description": "Amend previous commit instead of creating new one",
      "defaultValue": false
    }
  ],
  "permissions": {
    "tools": ["git"],
    "operations": ["read", "write"],
    "resources": ["filesystem"]
  },
  "model": "haiku",
  "examples": [
    {
      "command": "/commit",
      "description": "Create commit with auto-generated message"
    },
    {
      "command": "/commit --verbose",
      "description": "Create commit with detailed body"
    },
    {
      "command": "/commit --message \"feat: add user authentication\"",
      "description": "Create commit with custom message"
    }
  ]
}
```

### Branch Cleanup

```typescript
// File: .claude/commands/clean-branches.json
{
  "name": "clean-branches",
  "description": "Clean up git branches that are merged or no longer needed",
  "template": `
    Clean up git branches using this process:

    1. **Fetch Latest Remote State**
       - Run 'git fetch --prune' to update remote branch information
       - Identify branches marked as '[gone]' (deleted from remote)

    2. **Analyze Local Branches**
       - List all local branches with 'git branch -v'
       - Identify branches that are:
         * Fully merged into main/master
         * Marked as '[gone]' from remote
         * Older than {{ageLimit}} days
         * Not currently checked out

    3. **Safety Checks**
       - NEVER delete the current branch
       - NEVER delete main/master/develop branches
       - Confirm branches are fully merged
       - Check for uncommitted changes

    4. **Branch Removal**
       {{#if dryRun}}
       - Show which branches would be deleted
       - Display commit status for each branch
       - Ask for confirmation before actual deletion
       {{else}}
       - Delete merged branches with 'git branch -d'
       - Force delete gone branches with 'git branch -D'
       - Clean up any associated worktrees
       {{/if}}

    5. **Report Results**
       - List branches that were removed
       - List branches that were kept (with reasons)
       - Show any warnings or errors encountered

    Options:
    - {{includeMerged}}: Include fully merged branches
    - {{includeGone}}: Include branches deleted from remote
    - {{ageLimit}}: Only consider branches older than this many days
    - {{dryRun}}: Show what would be deleted without actually deleting

    Protected branches (never deleted): main, master, develop, staging, prod*
  `,
  "parameters": [
    {
      "name": "includeMerged",
      "type": "boolean",
      "required": false,
      "description": "Include fully merged branches",
      "defaultValue": true
    },
    {
      "name": "includeGone",
      "type": "boolean",
      "required": false,
      "description": "Include branches deleted from remote",
      "defaultValue": true
    },
    {
      "name": "ageLimit",
      "type": "number",
      "required": false,
      "description": "Minimum age in days for branch deletion",
      "defaultValue": 7
    },
    {
      "name": "dryRun",
      "type": "boolean",
      "required": false,
      "description": "Show what would be deleted without actually deleting",
      "defaultValue": true
    }
  ],
  "permissions": {
    "tools": ["git"],
    "operations": ["read", "write"],
    "resources": ["filesystem"]
  },
  "model": "haiku"
}
```

## Advanced Commands

### Smart Merge

```typescript
// File: .claude/commands/merge.json
{
  "name": "merge",
  "description": "Intelligent merge with conflict resolution and validation",
  "template": `
    Perform intelligent git merge with comprehensive validation:

    1. **Pre-Merge Validation**
       - Check current branch is clean (no uncommitted changes)
       - Verify target branch exists and is up to date
       - Run 'git fetch' to ensure latest remote state
       - Check for potential merge conflicts with 'git merge-tree'

    2. **Merge Strategy Selection**
       {{#if strategy === 'auto'}}
       - Analyze branch history and divergence
       - Choose optimal merge strategy:
         * fast-forward for linear history
         * recursive for divergent branches
         * ours/theirs for conflict resolution preference
       {{else}}
       - Use specified strategy: {{strategy}}
       {{/if}}

    3. **Merge Execution**
       - Create merge commit with descriptive message
       - Include source branch and merge reason
       - Add metadata about merge strategy used
       - Handle conflicts according to {{conflictResolution}}

    4. **Conflict Resolution**
       {{#if conflictResolution === 'interactive'}}
       - Identify each conflict and present options
       - Provide context from both branches
       - Suggest resolution based on:
         * File type and language conventions
         * Recent change patterns
         * Code quality metrics
       {{/if}}

    5. **Post-Merge Validation**
       - Verify merge completed successfully
       - Run basic smoke tests if test command is available
       - Check for merge-specific issues:
         * Duplicate imports
         * Conflicting dependency versions
         * Broken imports or references

    6. **Cleanup and Reporting**
       - Remove source branch if {{deleteAfter}}
       - Push merge to remote if {{pushAfter}}
       - Generate merge summary with statistics
       - Create GitHub PR if {{createPR}}

    Conflict Resolution Options:
    - interactive: Manual resolution with AI assistance
    - ours: Always prefer current branch changes
    - theirs: Always prefer incoming branch changes
    - skip: Abort on conflicts

    Merge Strategies:
    - auto: Automatically select best strategy
    - fast-forward: Only if linear history possible
    - recursive: Standard three-way merge
    - ours: Favor current branch
    - theirs: Favor incoming branch
  `,
  "parameters": [
    {
      "name": "sourceBranch",
      "type": "string",
      "required": true,
      "description": "Source branch to merge from"
    },
    {
      "name": "strategy",
      "type": "string",
      "required": false,
      "description": "Merge strategy to use",
      "defaultValue": "auto",
      "validation": {
        "allowedValues": ["auto", "fast-forward", "recursive", "ours", "theirs"]
      }
    },
    {
      "name": "conflictResolution",
      "type": "string",
      "required": false,
      "description": "How to handle merge conflicts",
      "defaultValue": "interactive",
      "validation": {
        "allowedValues": ["interactive", "ours", "theirs", "skip"]
      }
    },
    {
      "name": "deleteAfter",
      "type": "boolean",
      "required": false,
      "description": "Delete source branch after merge",
      "defaultValue": false
    },
    {
      "name": "pushAfter",
      "type": "boolean",
      "required": false,
      "description": "Push merge to remote",
      "defaultValue": true
    },
    {
      "name": "createPR",
      "type": "boolean",
      "required": false,
      "description": "Create pull request for merge",
      "defaultValue": false
    }
  ],
  "permissions": {
    "tools": ["git", "gh"],
    "operations": ["read", "write"],
    "resources": ["filesystem", "network"]
  },
  "model": "sonnet"
}
```

### Release Automation

```typescript
// File: .claude/commands/release.json
{
  "name": "release",
  "description": "Automated release creation with version management and changelog generation",
  "template": `
    Create a comprehensive release with version management:

    1. **Pre-Release Checks**
       - Verify working directory is clean
       - Ensure main branch is up to date
       - Run tests if available: {{testCommand}}
       - Check CI/CD pipeline status

    2. **Version Management**
       {{#if bumpType === 'auto'}}
       - Analyze commits since last release
       - Determine version bump based on conventional commits:
         * breaking changes: major version (X.0.0)
         * feat: minor version (X.Y.0)
         * fix: patch version (X.Y.Z)
       {{else}}
       - Bump version using specified type: {{bumpType}}
       {{/if}}

    3. **Changelog Generation**
       - Extract changes since last release
       - Categorize by type: Features, Bug Fixes, Documentation, etc.
       - Group by scope/component when possible
       - Include breaking changes section
       - Add contributor credits
       {{#if includeCommits}}
       - Link to individual commits for reference
       {{/if}}

    4. **Release Preparation**
       - Update version files (package.json, version.ts, etc.)
       - Commit version bump with appropriate message
       - Create release tag: v{{version}}
       - Generate release notes in GitHub format

    5. **Release Publishing**
       {{#if publishToNPM}}
       - Run npm publish (if package.json detected)
       - Verify package was published successfully
       {{/if}}

       {{#if createGitHubRelease}}
       - Create GitHub release with changelog
       - Upload release assets if specified
       - Link to relevant issues and PRs
       {{/if}}

    6. **Post-Release Tasks**
       - Merge release branch if {{mergeRelease}}
       - Backport to stable branches if {{backport}}
       - Update development version if {{updateDevVersion}}
       - Notify team if {{notifyTeam}}

    7. **Validation and Reporting**
       - Verify release was created successfully
       - Check all artifacts are published
       - Generate release summary report
       - List any manual steps required

    Release Types:
    - auto: Automatically determine based on commits
    - major: X.0.0 (breaking changes)
    - minor: X.Y.0 (new features)
    - patch: X.Y.Z (bug fixes)

    Files to update for version bump:
    - package.json (version field)
    - version.ts or similar version files
    - Documentation with version references
    - CHANGELOG.md
  `,
  "parameters": [
    {
      "name": "bumpType",
      "type": "string",
      "required": false,
      "description": "Version bump type",
      "defaultValue": "auto",
      "validation": {
        "allowedValues": ["auto", "major", "minor", "patch"]
      }
    },
    {
      "name": "version",
      "type": "string",
      "required": false,
      "description": "Specific version to release (overrides bumpType)",
      "defaultValue": null
    },
    {
      "name": "testCommand",
      "type": "string",
      "required": false,
      "description": "Command to run tests before release",
      "defaultValue": "npm test"
    },
    {
      "name": "includeCommits",
      "type": "boolean",
      "required": false,
      "description": "Include individual commits in changelog",
      "defaultValue": true
    },
    {
      "name": "publishToNPM",
      "type": "boolean",
      "required": false,
      "description": "Publish to npm registry",
      "defaultValue": false
    },
    {
      "name": "createGitHubRelease",
      "type": "boolean",
      "required": false,
      "description": "Create GitHub release",
      "defaultValue": true
    },
    {
      "name": "mergeRelease",
      "type": "boolean",
      "required": false,
      "description": "Merge release branch",
      "defaultValue": false
    },
    {
      "name": "backport",
      "type": "boolean",
      "required": false,
      "description": "Backport to stable branches",
      "defaultValue": false
    },
    {
      "name": "updateDevVersion",
      "type": "boolean",
      "required": false,
      "description": "Update development version after release",
      "defaultValue": false
    },
    {
      "name": "notifyTeam",
      "type": "boolean",
      "required": false,
      "description": "Notify team about release",
      "defaultValue": false
    }
  ],
  "permissions": {
    "tools": ["git", "npm", "gh"],
    "operations": ["read", "write", "network"],
    "resources": ["filesystem", "network"]
  },
  "model": "sonnet"
}
```

## Integration Commands

### GitHub PR Creation

```typescript
// File: .claude/commands/pr.json
{
  "name": "pr",
  "description": "Create comprehensive pull request with automated description and checks",
  "template": `
    Create a comprehensive pull request with analysis:

    1. **Repository Analysis**
       - Identify current branch and changes
       - Determine target branch (main, develop, etc.)
       - Check if PR already exists for this branch
       - Analyze commit history and change patterns

    2. **Change Categorization**
       - Categorize changes by type:
         * 🚀 Features: New functionality
         * 🐛 Bug Fixes: Resolved issues
         * 📝 Documentation: Docs, READMEs
         * 💅 Style: Code formatting, linting
         * 🔄 Refactor: Code restructuring
         * ✅ Tests: Test additions/updates
         * 🚧 Chore: Maintenance tasks

    3. **Impact Assessment**
       - Identify breaking changes
       - Assess performance implications
       - Note security considerations
       - Check for backwards compatibility
       - Identify required migrations

    4. **Review Requirements**
       - Suggest reviewers based on:
         * File ownership patterns
         * Expertise areas
         * Recent activity
         * Team rotation schedule
       - Determine review complexity
       - Identify required specialist reviews (security, performance)

    5. **Testing Recommendations**
       - Analyze test coverage impact
       - Suggest specific test scenarios
         * Unit tests for new functions
         * Integration tests for API changes
         * E2E tests for user workflows
         * Performance tests for optimization
       - Identify test environment requirements

    6. **PR Description Generation**
       Generate comprehensive PR description with:

       ## Summary
       - Brief overview of changes
       - Motivation and context
       - Problem statement

       ## Changes Made
       {{#categorizedChanges}}
       ### {{category}} ({{count}})
       {{#each files}}
       - **{{path}}**: {{description}}
       {{/each}}
       {{/categorizedChanges}}

       ## Impact
       - **Breaking Changes**: {{breakingChangesCount}}
       - **Performance Impact**: {{performanceImpact}}
       - **Security Changes**: {{securityChanges}}
       - **Migration Required**: {{migrationRequired}}

       ## Testing
       - Tests Added: {{testsAdded}}
       - Coverage Impact: {{coverageImpact}}
       - Manual Testing Required: {{manualTesting}}

       ## Checklist
       - [ ] Code follows project style guidelines
       - [ ] Self-review completed
       - [ ] Tests added/updated
       - [ ] Documentation updated
       - [ ] Breaking changes documented
       - [ ] Security considerations addressed

       {{#if assignReviewers}}
       ## Suggested Reviewers
       {{#each suggestedReviewers}}
       - @{{username}} ({{reason}})
       {{/each}}
       {{/if}}

    7. **PR Creation**
       - Create draft or published PR based on {{draft}}
       - Add appropriate labels and milestones
       - Link to related issues
       - Set auto-merge settings if specified
       - Request reviews from suggested reviewers

    8. **Post-Creation Validation**
       - Verify PR was created successfully
       - Check CI/CD pipeline triggers
       - Validate all checks are running
       - Provide next steps and expectations

    Configuration Options:
    - {{draft}}: Create as draft PR instead of published
    - {{assignReviewers}}: Automatically assign suggested reviewers
    - {{autoMerge}}: Enable auto-merge if checks pass
    - {{wip}}: Mark as work in progress
  `,
  "parameters": [
    {
      "name": "targetBranch",
      "type": "string",
      "required": false,
      "description": "Target branch for PR",
      "defaultValue": "main"
    },
    {
      "name": "title",
      "type": "string",
      "required": false,
      "description": "PR title (auto-generated if not provided)",
      "defaultValue": null
    },
    {
      "name": "draft",
      "type": "boolean",
      "required": false,
      "description": "Create as draft PR",
      "defaultValue": false
    },
    {
      "name": "assignReviewers",
      "type": "boolean",
      "required": false,
      "description": "Auto-assign suggested reviewers",
      "defaultValue": false
    },
    {
      "name": "autoMerge",
      "type": "boolean",
      "required": false,
      "description": "Enable auto-merge if checks pass",
      "defaultValue": false
    },
    {
      "name": "wip",
      "type": "boolean",
      "required": false,
      "description": "Mark as work in progress",
      "defaultValue": false
    }
  ],
  "permissions": {
    "tools": ["git", "gh"],
    "operations": ["read", "write", "network"],
    "resources": ["filesystem", "network"]
  },
  "model": "sonnet",
  "examples": [
    {
      "command": "/pr",
      "description": "Create PR with auto-generated title and description"
    },
    {
      "command": "/pr --draft --assignReviewers",
      "description": "Create draft PR and assign reviewers"
    },
    {
      "command": "/pr --title \"feat: add user authentication\" --targetBranch develop",
      "description": "Create PR with custom title and target branch"
    }
  ]
}
```

## Utility Commands

### Git Health Check

```typescript
// File: .claude/commands/health.json
{
  "name": "health",
  "description": "Comprehensive repository health check and optimization suggestions",
  "template": `
    Perform comprehensive git repository health analysis:

    1. **Repository Statistics**
       - Total commits, branches, tags
       - Repository size and largest files
       - Active contributors and commit frequency
       - Branching patterns and strategies

    2. **Code Quality Metrics**
       - Analyze commit message quality
       - Check for large commits (should be < 500 lines)
       - Identify merge commit patterns
       - Assess branching strategy effectiveness

    3. **Performance Analysis**
       - Check repository size and suggest cleanup
       - Identify large binary files in history
       - Analyze .gitignore effectiveness
       - Check for unnecessary files tracked

    4. **Security Assessment**
       - Scan for exposed secrets or credentials
       - Check for sensitive file patterns
       - Verify .gitignore security rules
       - Assess access permissions

    5. **Workflow Optimization**
       - Analyze branch lifecycle
       - Identify abandoned or stale branches
       - Check merge patterns and conflicts
       - Suggest workflow improvements

    6. **Generate Health Report**
       Create comprehensive health report with:

       ## Repository Overview
       - **Age**: {{repoAge}}
       - **Total Commits**: {{totalCommits}}
       - **Active Branches**: {{activeBranches}}
       - **Contributors**: {{contributorCount}}
       - **Repository Size**: {{repoSize}}

       ## Code Quality Score: {{qualityScore}}/100
       {{#if qualityIssues}}
       ### Issues Found:
       {{#each qualityIssues}}
       - {{type}}: {{description}} ({{severity}})
       {{/each}}
       {{/if}}

       ## Performance Score: {{performanceScore}}/100
       {{#if performanceIssues}}
       ### Optimization Opportunities:
       {{#each performanceIssues}}
       - {{type}}: {{description}} (potential savings: {{savings}})
       {{/each}}
       {{/if}}

       ## Security Score: {{securityScore}}/100
       {{#if securityIssues}}
       ### Security Concerns:
       {{#each securityIssues}}
       - {{type}}: {{description}} (risk: {{risk}})
       {{/each}}
       {{/if}}

       ## Recommendations
       {{#each recommendations}}
       ### {{priority}} Priority: {{title}}
       **Description**: {{description}}
       **Impact**: {{impact}}
       **Effort**: {{effort}}
       **Steps**: {{steps}}
       {{/each}}

    7. **Actionable Suggestions**
       Provide specific commands to fix identified issues:

       {{#if hasLargeFiles}}
       **Remove Large Files:**
       \`\`\`bash
       git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch {{largeFiles}}' --prune-empty --tag-name-filter cat -- --all
       \`\`\`
       {{/if}}

       {{#if hasUntrackedFiles}}
       **Add to .gitignore:**
       \`\`\`
       {{untrackedFiles}}
       \`\`\`
       {{/if}}

       {{#if hasStaleBranches}}
       **Clean Stale Branches:**
       \`\`\`bash
       git branch -d {{staleBranches}}
       \`\`\`
       {{/if}}

    Configuration:
    - {{includeRecommendations}}: Include actionable improvement suggestions
    - {{includeCommands}}: Include specific commands for fixes
    - {{severity}}: Minimum severity level to report (low, medium, high, critical)
  `,
  "parameters": [
    {
      "name": "includeRecommendations",
      "type": "boolean",
      "required": false,
      "description": "Include actionable improvement suggestions",
      "defaultValue": true
    },
    {
      "name": "includeCommands",
      "type": "boolean",
      "required": false,
      "description": "Include specific commands for fixes",
      "defaultValue": true
    },
    {
      "name": "severity",
      "type": "string",
      "required": false,
      "description": "Minimum severity level to report",
      "defaultValue": "medium",
      "validation": {
        "allowedValues": ["low", "medium", "high", "critical"]
      }
    }
  ],
  "permissions": {
    "tools": ["git", "filesystem"],
    "operations": ["read"],
    "resources": ["filesystem"]
  },
  "model": "sonnet"
}
```

## Usage Examples

### Basic Workflow

```bash
# Create intelligent commit
/commit

# Clean up old branches
/clean-branches --ageLimit 14 --dryRun

# Create pull request
/pr --draft

# Health check
/health
```

### Advanced Workflow

```bash
# Comprehensive merge with conflict resolution
/merge feature/user-auth --strategy recursive --conflictResolution interactive

# Automated release
/release --bumpType auto --createGitHubRelease --publishToNPM

# Health check with deep analysis
/health --severity low --includeCommands
```

## Best Practices for Git Commands

1. **Safety First**: Always include safety checks and confirmations
2. **Backup Strategy**: Provide options for backup and rollback
3. **Clear Communication**: Explain what each command will do
4. **Flexible Configuration**: Allow users to customize behavior
5. **Error Handling**: Provide helpful error messages and recovery suggestions
6. **Validation**: Pre-validate actions before executing
7. **Logging**: Include detailed logs for debugging and audit trails

These examples demonstrate how to create powerful, flexible Git automation commands that enhance development workflows while maintaining safety and reliability.
