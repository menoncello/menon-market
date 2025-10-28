/**
 * Setup script template for agent directories
 */

function generateScriptHeader(): string {
  return `#!/bin/bash

# Setup script for {{agentName}}
# This script prepares the development environment

set -e

echo "🚀 Setting up {{agentName}}..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"`;
}

function generateDependencySetup(): string {
  return `# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p temp
mkdir -p coverage`;
}

function generateEnvFileContent(): string {
  return `# Agent Configuration
AGENT_ID={{agentId}}
AGENT_NAME={{agentName}}
AGENT_VERSION={{version}}

# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug

# MCP Server Configuration
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost`;
}

function generateEnvFileSetup(): string {
  return `# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOL
${generateEnvFileContent()}
EOL
fi`;
}

function generateBuildAndTestSetup(): string {
  return `# Make scripts executable
echo "🔐 Making scripts executable..."
chmod +x scripts/*.sh

# Run initial build
echo "🔨 Building agent..."
bun run build

# Run tests to verify setup
echo "🧪 Running tests..."
bun test

# Check linting
echo "🔍 Checking linting..."
bun run lint`;
}

function generateScriptFooter(): string {
  return `echo "✅ Setup complete!"
echo ""
echo "🎉 {{agentName}} is ready for development!"
echo ""
echo "Next steps:"
echo "  - Run 'bun run dev' to start development"
echo "  - Run 'bun test' to run tests"
echo "  - Check README.md for more information"
echo ""
echo "Happy coding! 🚀"`;
}

export function generateSetupScriptTemplate(): string {
  return `${generateScriptHeader()}

${generateDependencySetup()}

${generateEnvFileSetup()}

${generateBuildAndTestSetup()}

${generateScriptFooter()}
`;
}
