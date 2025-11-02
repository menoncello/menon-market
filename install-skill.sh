#!/bin/bash

# Deep Research Skill Installation Script
# This script installs the deep-research skill in Claude Code

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="deep-research"
SKILL_SOURCE_DIR="$SCRIPT_DIR/$SKILL_NAME"
CLAUDE_DIR="$HOME/.claude"
POSSIBLE_SKILL_DIRS=(
    "$CLAUDE_DIR/skills"
    "$CLAUDE_DIR/plugins/skills"
    "$HOME/claude-skills"
    "$HOME/.claude-skills"
)

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if source directory exists
check_source() {
    log_info "Checking source directory..."

    if [[ ! -d "$SKILL_SOURCE_DIR" ]]; then
        log_error "Source directory not found: $SKILL_SOURCE_DIR"
        log_info "Please ensure the deep-research directory exists in: $SCRIPT_DIR"
        exit 1
    fi

    # Check if SKILL.md exists
    if [[ ! -f "$SKILL_SOURCE_DIR/SKILL.md" ]]; then
        log_error "SKILL.md not found in: $SKILL_SOURCE_DIR"
        exit 1
    fi

    log_success "Source directory validated"
}

# Find or create Claude skills directory
find_claude_skills_dir() {
    log_info "Looking for Claude skills directory..."

    # Check existing directories
    for dir in "${POSSIBLE_SKILL_DIRS[@]}"; do
        if [[ -d "$dir" ]]; then
            log_info "Found existing skills directory: $dir"
            echo "$dir"
            return 0
        fi
    done

    # Create default directory
    local default_dir="$CLAUDE_DIR/skills"
    log_info "Creating skills directory: $default_dir"
    mkdir -p "$default_dir"
    echo "$default_dir"
}

# Install skill using copy method
install_copy() {
    local target_dir="$1"

    log_info "Installing skill using copy method..."

    # Remove existing installation
    if [[ -d "$target_dir/$SKILL_NAME" ]]; then
        log_warning "Removing existing installation..."
        rm -rf "$target_dir/$SKILL_NAME"
    fi

    # Copy skill
    cp -r "$SKILL_SOURCE_DIR" "$target_dir/"

    # Set permissions
    chmod -R 755 "$target_dir/$SKILL_NAME"

    log_success "Skill installed to: $target_dir/$SKILL_NAME"
}

# Install skill using symbolic link method
install_symlink() {
    local target_dir="$1"

    log_info "Installing skill using symbolic link method..."

    # Remove existing link or directory
    if [[ -L "$target_dir/$SKILL_NAME" ]]; then
        log_warning "Removing existing symbolic link..."
        rm -f "$target_dir/$SKILL_NAME"
    elif [[ -d "$target_dir/$SKILL_NAME" ]]; then
        log_warning "Removing existing directory..."
        rm -rf "$target_dir/$SKILL_NAME"
    fi

    # Create symbolic link
    ln -s "$SKILL_SOURCE_DIR" "$target_dir/$SKILL_NAME"

    log_success "Skill linked to: $target_dir/$SKILL_NAME"
}

# Verify installation
verify_installation() {
    local target_dir="$1"
    local skill_path="$target_dir/$SKILL_NAME"

    log_info "Verifying installation..."

    # Check if skill directory exists
    if [[ ! -d "$skill_path" ]]; then
        log_error "Skill directory not found after installation"
        return 1
    fi

    # Check critical files
    local required_files=("SKILL.md" "scripts/company-analyzer.ts" "scripts/web-researcher.ts")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$skill_path/$file" ]]; then
            log_error "Required file not found: $file"
            return 1
        fi
    done

    # Check skill name in SKILL.md
    local skill_name_in_md=$(grep "^name:" "$skill_path/SKILL.md" | cut -d: -f2 | tr -d ' ')
    if [[ "$skill_name_in_md" != "$SKILL_NAME" ]]; then
        log_warning "Skill name in SKILL.md doesn't match directory name"
        log_info "Expected: $SKILL_NAME, Found: $skill_name_in_md"
    fi

    log_success "Installation verified successfully"
}

# Show usage instructions
show_usage() {
    local target_dir="$1"
    local skill_path="$target_dir/$SKILL_NAME"

    echo
    log_success "🎉 Deep Research Skill Installation Complete!"
    echo
    echo "📁 Installation Details:"
    echo "  - Source: $SKILL_SOURCE_DIR"
    echo "  - Target: $skill_path"
    echo
    echo "🚀 Usage Instructions:"
    echo "  1. Restart Claude Code to refresh skills cache"
    echo "  2. In Claude Code, use: \"Use the deep-research skill to research [topic]\""
    echo "  3. Or run scripts directly:"
    echo "     cd $skill_path"
    echo "     bun scripts/company-analyzer.ts --company \"Apple Inc\" --focus comprehensive"
    echo
    echo "📚 Available Templates:"
    echo "  - Executive Summary: Quick decision-maker insights"
    echo "  - Comprehensive Analysis: Detailed research documentation"
    echo "  - Competitive Intelligence: Strategic competitor analysis"
    echo "  - Technical Evaluation: Software/tools assessment"
    echo
    echo "🔧 Quick Commands:"
    echo "  - Company research: bun scripts/company-analyzer.ts --company [NAME] --focus comprehensive"
    echo "  - Market research: bun scripts/web-researcher.ts --query [TOPIC] --depth comprehensive"
    echo "  - Report generation: bun scripts/report-generator.ts --template executive-summary --input data.json"
    echo
}

# Main installation function
main() {
    echo "🚀 Deep Research Skill Installation Script"
    echo "=========================================="
    echo

    # Check dependencies
    if ! command -v cp &> /dev/null; then
        log_error "cp command not found"
        exit 1
    fi

    if ! command -v chmod &> /dev/null; then
        log_error "chmod command not found"
        exit 1
    fi

    # Parse command line arguments
    local install_method="copy"
    local target_dir=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --symlink)
                install_method="symlink"
                shift
                ;;
            --target-dir)
                target_dir="$2"
                shift 2
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  --symlink        Install using symbolic link (for development)"
                echo "  --target-dir DIR  Install to specific directory"
                echo "  --help, -h       Show this help message"
                echo
                echo "Examples:"
                echo "  $0                           # Install to default location using copy"
                echo "  $0 --symlink                 # Install using symbolic link"
                echo "  $0 --target-dir ~/.claude/skills  # Install to specific directory"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Run installation
    check_source

    if [[ -z "$target_dir" ]]; then
        target_dir=$(find_claude_skills_dir)
    fi

    case $install_method in
        "copy")
            install_copy "$target_dir"
            ;;
        "symlink")
            install_symlink "$target_dir"
            ;;
        *)
            log_error "Unknown installation method: $install_method"
            exit 1
            ;;
    esac

    if verify_installation "$target_dir"; then
        show_usage "$target_dir"
    else
        log_error "Installation verification failed"
        exit 1
    fi
}

# Uninstall function
uninstall() {
    log_info "Uninstalling Deep Research skill..."

    local removed=false

    for dir in "${POSSIBLE_SKILL_DIRS[@]}"; do
        local skill_path="$dir/$SKILL_NAME"
        if [[ -L "$skill_path" ]]; then
            log_info "Removing symbolic link: $skill_path"
            rm -f "$skill_path"
            removed=true
        elif [[ -d "$skill_path" ]]; then
            log_info "Removing directory: $skill_path"
            rm -rf "$skill_path"
            removed=true
        fi
    done

    if $removed; then
        log_success "Deep Research skill uninstalled successfully"
    else
        log_warning "No installation found to uninstall"
    fi
}

# Handle uninstall command
if [[ "${1:-}" == "uninstall" ]]; then
    uninstall
    exit 0
fi

# Run main installation
main "$@"