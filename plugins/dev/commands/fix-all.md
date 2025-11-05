# /fix-all

**Unified Code Quality Fix Command**

## Description

Applies format, lint, and typecheck fixes to all project files in parallel using dynamic worker pool management.

## Usage

```bash
/fix-all [--max-workers <number>]
```

## Options

- `--max-workers <number>`: Maximum number of parallel workers (default: 6 or CPU cores)

## Features

- **Parallel Processing**: Dynamic worker pool with continuous task distribution
- **Smart Prioritization**: Format (fast) → Lint (medium) → Typecheck (slow)
- **Real-time Progress**: Live updates showing completion status
- **Performance Metrics**: Detailed timing and throughput statistics
- **Error Handling**: Continues processing even if individual files fail

## What It Does

1. **Scans**: Finds all relevant files (TS, JS, JSON, MD, YAML, HTML, CSS)
2. **Generates Tasks**: Creates 1-3 tasks per file based on file type
3. **Processes in Parallel**: Uses worker threads for maximum throughput
4. **Applies Fixes**:
   - Format: Prettier code formatting
   - Lint: ESLint auto-fix for rule violations
   - Typecheck: TypeScript error detection with suggestions
5. **Reports**: Detailed statistics on fixes applied and performance

## Example Output

```
🔧 Starting Unified Code Quality Fix...

📝 Generated 150 tasks for 75 files
🚀 Starting unified code quality fix with 6 workers
📊 Total tasks: 150

✅ [1%] FORMAT src/index.ts (45ms) - worker-abc123
✅ [2%] FORMAT src/utils.ts (38ms) - worker-def456
✅ [3%] LINT src/index.ts (89ms) - worker-abc123
...

🎉 Code Quality Fix Complete!
============================================================
📊 Results by type:
   FORMAT: 75/75 successful (avg: 42ms)
   LINT: 72/75 successful (avg: 95ms)
   TYPECHECK: 70/75 successful (avg: 156ms)

📈 Overall Summary:
   ✅ Total files processed: 75
   ✅ Successful fixes: 217
   ❌ Failed: 8
   ⏱️  Total duration: 3456ms
   🚀 Average per file: 46ms
   ⚡ Throughput: 21 files/sec
```

## Benefits

- **Speed**: Parallel processing reduces total time by 60-80%
- **Comprehensive**: Handles all code quality issues in one command
- **Efficient**: Workers never idle - immediate task pickup
- **Scalable**: Adapts to any project size
- **Safe**: Continues on failures, provides detailed error reports
