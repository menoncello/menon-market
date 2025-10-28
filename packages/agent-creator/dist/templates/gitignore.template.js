/**
 * Gitignore template for agent directories
 */
function generateDependenciesIgnore() {
    return `# Dependencies
node_modules/
bun.lockb`;
}
function generateBuildOutputsIgnore() {
    return `# Build outputs
dist/
build/
*.tsbuildinfo`;
}
function generateEnvironmentIgnore() {
    return `# Environment variables
.env
.env.local
.env.production`;
}
function generateIdeIgnore() {
    return `# IDE
.vscode/
.idea/
*.swp
*.swo`;
}
function generateOsIgnore() {
    return `# OS
.DS_Store
Thumbs.db`;
}
function generateLogsIgnore() {
    return `# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*`;
}
function generateRuntimeIgnore() {
    return `# Runtime data
pids
*.pid
*.seed
*.pid.lock`;
}
function generateCoverageIgnore() {
    return `# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output`;
}
function generatePackageIgnore() {
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
function generateBuildCacheIgnore() {
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
function generateFrameworkIgnore() {
    return `# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port`;
}
function generateTestIgnore() {
    return `# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# Test artifacts
test-results/
playwright-report/`;
}
export function generateGitignoreTemplate() {
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
//# sourceMappingURL=gitignore.template.js.map