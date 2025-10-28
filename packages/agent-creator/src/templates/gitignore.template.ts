/**
 * Gitignore template for agent directories
 */

function generateDependenciesIgnore(): string {
  return `# Dependencies
node_modules/
bun.lockb`;
}

function generateBuildOutputsIgnore(): string {
  return `# Build outputs
dist/
build/
*.tsbuildinfo`;
}

function generateEnvironmentIgnore(): string {
  return `# Environment variables
.env
.env.local
.env.production`;
}

function generateIdeIgnore(): string {
  return `# IDE
.vscode/
.idea/
*.swp
*.swo`;
}

function generateOsIgnore(): string {
  return `# OS
.DS_Store
Thumbs.db`;
}

function generateLogsIgnore(): string {
  return `# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*`;
}

function generateRuntimeIgnore(): string {
  return `# Runtime data
pids
*.pid
*.seed
*.pid.lock`;
}

function generateCoverageIgnore(): string {
  return `# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output`;
}

function generatePackageIgnore(): string {
  return `# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity`;
}

function generateBuildCacheIgnore(): string {
  return `# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist`;
}

function generateFrameworkIgnore(): string {
  return `# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port`;
}

function generateTestIgnore(): string {
  return `# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# Test artifacts
test-results/
playwright-report/`;
}

export function generateGitignoreTemplate(): string {
  return `${generateDependenciesIgnore()}

${generateBuildOutputsIgnore()}

${generateEnvironmentIgnore()}

${generateIdeIgnore()}

${generateOsIgnore()}

${generateLogsIgnore()}

${generateRuntimeIgnore()}

${generateCoverageIgnore()}

${generatePackageIgnore()}

${generateBuildCacheIgnore()}

${generateFrameworkIgnore()}

${generateTestIgnore()}
`;
}
