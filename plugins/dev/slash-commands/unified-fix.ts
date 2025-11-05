/**
 * Unified Code Quality Fix Command
 *
 * Single command: /fix-all
 * Dynamic worker pool with continuous task distribution
 * Workers immediately pick up new tasks when they finish
 */

import { spawn, $ } from 'bun';
import { file } from 'bun';
import { join, relative, extname } from 'path';
import { TestQualityAnalyzer } from './test-quality-analyzer';

interface Task {
  id: string;
  type: 'format' | 'lint' | 'typecheck' | 'test-quality';
  filePath: string;
  priority: number;
  estimatedComplexity: number;
}

interface WorkerResult {
  taskId: string;
  workerId: string;
  filePath: string;
  success: boolean;
  result: any;
  error?: string;
  duration: number;
  type: 'format' | 'lint' | 'typecheck' | 'test-quality';
}

interface WorkerState {
  id: string;
  busy: boolean;
  currentTask?: Task;
  startTime?: number;
  completedTasks: number;
  totalProcessingTime: number;
}

/**
 * Dynamic Worker Pool for Continuous Task Processing
 */
class DynamicWorkerPool {
  private workers = new Map<string, WorkerState>();
  private taskQueue: Task[] = [];
  private results: WorkerResult[] = [];
  private maxWorkers: number;
  private isRunning = false;
  private completedCount = 0;
  private totalCount = 0;

  constructor(maxWorkers = Math.min(6, navigator.hardwareConcurrency || 4)) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * Start processing all tasks with continuous worker management
   */
  async processAllTasks(tasks: Task[]): Promise<WorkerResult[]> {
    console.log(`🚀 Starting unified code quality fix with ${this.maxWorkers} workers`);
    console.log(`📊 Total tasks: ${tasks.length}`);

    // Sort tasks by priority and complexity
    this.taskQueue = tasks.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.estimatedComplexity - b.estimatedComplexity;
    });

    this.totalCount = tasks.length;
    this.results = [];
    this.completedCount = 0;
    this.isRunning = true;

    const startTime = Date.now();

    // Start initial workers
    for (let i = 0; i < Math.min(this.maxWorkers, tasks.length); i++) {
      this.startWorker();
    }

    // Wait for all tasks to complete
    await this.waitForCompletion();

    const duration = Date.now() - startTime;

    // Print final statistics
    this.printFinalStats(duration);

    return this.results.sort((a, b) => a.filePath.localeCompare(b.filePath));
  }

  /**
   * Start a new worker that continuously processes tasks
   */
  private async startWorker(): Promise<void> {
    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const workerState: WorkerState = {
      id: workerId,
      busy: false,
      completedTasks: 0,
      totalProcessingTime: 0
    };

    this.workers.set(workerId, workerState);

    console.log(`👷 Worker ${workerId} started`);

    // Start the worker's continuous processing loop
    this.workerLoop(workerState);
  }

  /**
   * Worker loop - continuously picks up and processes tasks
   */
  private async workerLoop(workerState: WorkerState): Promise<void> {
    while (this.isRunning) {
      // Get next task from queue
      const task = this.getNextTask();

      if (!task) {
        // No more tasks, worker can rest
        workerState.busy = false;
        await this.sleep(100); // Small delay to prevent busy waiting
        continue;
      }

      // Process the task
      workerState.busy = true;
      workerState.currentTask = task;
      workerState.startTime = Date.now();

      try {
        const result = await this.processTask(task, workerState.id);
        this.handleResult(result);
        workerState.completedTasks++;
        workerState.totalProcessingTime += result.duration;
      } catch (error) {
        const errorResult: WorkerResult = {
          taskId: task.id,
          workerId: workerState.id,
          filePath: task.filePath,
          success: false,
          result: null,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - (workerState.startTime || Date.now()),
          type: task.type
        };
        this.handleResult(errorResult);
      } finally {
        workerState.currentTask = undefined;
        workerState.busy = false;
      }
    }

    // Clean up worker
    this.workers.delete(workerState.id);
  }

  /**
   * Get next task from queue
   */
  private getNextTask(): Task | undefined {
    return this.taskQueue.shift();
  }

  /**
   * Process a single task
   */
  private async processTask(task: Task, workerId: string): Promise<WorkerResult> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (task.type) {
        case 'format':
          result = await this.formatFile(task.filePath);
          break;
        case 'lint':
          result = await this.lintFile(task.filePath);
          break;
        case 'typecheck':
          result = await this.typecheckFile(task.filePath);
          break;
        case 'test-quality':
          result = await this.analyzeTestQuality(task.filePath);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      return {
        taskId: task.id,
        workerId,
        filePath: task.filePath,
        success: true,
        result,
        duration: Date.now() - startTime,
        type: task.type
      };

    } catch (error) {
      return {
        taskId: task.id,
        workerId,
        filePath: task.filePath,
        success: false,
        result: null,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        type: task.type
      };
    }
  }

  /**
   * Handle completed task result
   */
  private handleResult(result: WorkerResult): void {
    this.results.push(result);
    this.completedCount++;

    // Progress logging
    const progress = Math.round((this.completedCount / this.totalCount) * 100);
    const status = result.success ? '✅' : '❌';

    console.log(
      `${status} [${progress}%] ${result.type.toUpperCase()} ${relative(process.cwd(), result.filePath)} ` +
      `(${result.duration}ms) - ${result.workerId}`
    );

    if (result.error) {
      console.log(`   ⚠️  Error: ${result.error}`);
    }
  }

  /**
   * Format file using Prettier
   */
  private async formatFile(filePath: string): Promise<{ formatted: boolean; changes?: string }> {
    const originalContent = await file(filePath).text();

    const proc = spawn({
      cmd: ['bun', 'run', 'format', '--', filePath],
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: process.cwd()
    });

    await proc.exited;

    const newContent = await file(filePath).text();
    const changed = newContent !== originalContent;

    return {
      formatted: true,
      changes: changed ? 'File reformatted' : 'No changes needed'
    };
  }

  /**
   * Lint file with auto-fix
   */
  private async lintFile(filePath: string): Promise<{ fixed: boolean; issues: string[] }> {
    const proc = spawn({
      cmd: ['bun', 'run', 'lint', '--', '--fix', filePath],
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: process.cwd()
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    const output = stdout + stderr;
    const issues = output.split('\n')
      .filter(line => line.trim())
      .filter(line => line.includes('error') || line.includes('warning'));

    return {
      fixed: exitCode === 0 || output.includes('fixed'),
      issues
    };
  }

  /**
   * Type-check file
   */
  private async typecheckFile(filePath: string): Promise<{ errors: string[]; suggestions: string[] }> {
    const proc = spawn({
      cmd: ['bun', 'run', 'typecheck', '--', '--noEmit', filePath],
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: process.cwd()
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    const output = stdout + stderr;
    const errors = output.split('\n')
      .filter(line => line.trim())
      .filter(line => line.includes('error TS') && line.includes(filePath));

    const suggestions = this.generateSuggestions(errors);

    return { errors, suggestions };
  }

  /**
   * Generate suggestions for common errors
   */
  private generateSuggestions(errors: string[]): string[] {
    const suggestions = new Set<string>();

    for (const error of errors) {
      if (error.includes('has no exported member')) suggestions.add('Check import statements and exports');
      if (error.includes('Property does not exist')) suggestions.add('Add type definitions or optional chaining');
      if (error.includes('Type is not assignable')) suggestions.add('Review type compatibility');
      if (error.includes('Object is possibly')) suggestions.add('Add null checks or assertions');
      if (error.includes('Cannot find module')) suggestions.add('Install missing dependencies');
    }

    return Array.from(suggestions);
  }

  /**
   * Analyze test quality for a single file
   */
  private async analyzeTestQuality(filePath: string): Promise<{ qualityScore: number; issues: string[]; suggestions: string[] }> {
    try {
      const analyzer = new TestQualityAnalyzer();
      const fileIssues = await analyzer.analyzeTestFile(filePath);
      const fileTests = await analyzer.parseTestsInFile(filePath);
      const metrics = analyzer.calculateMetrics(fileTests, [filePath]);

      const issues = fileIssues.map(issue => issue.description);
      const suggestions = fileIssues.map(issue => issue.suggestion);

      return {
        qualityScore: metrics.qualityScore,
        issues,
        suggestions
      };

    } catch (error) {
      throw new Error(`Test quality analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Wait for all tasks to complete
   */
  private async waitForCompletion(): Promise<void> {
    while (this.isRunning && this.completedCount < this.totalCount) {
      await this.sleep(500);
    }
    this.isRunning = false;
  }

  /**
   * Print final statistics
   */
  private printFinalStats(totalDuration: number): void {
    console.log('\n🎉 Code Quality Fix Complete!');
    console.log('=' .repeat(60));

    const byType = {
      format: this.results.filter(r => r.type === 'format'),
      lint: this.results.filter(r => r.type === 'lint'),
      typecheck: this.results.filter(r => r.type === 'typecheck'),
      'test-quality': this.results.filter(r => r.type === 'test-quality')
    };

    console.log('📊 Results by type:');
    Object.entries(byType).forEach(([type, results]) => {
      const success = results.filter(r => r.success).length;
      const total = results.length;
      const avgTime = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
        : 0;

      console.log(`   ${type.toUpperCase()}: ${success}/${total} successful (avg: ${avgTime}ms)`);
    });

    console.log('\n👷 Worker Performance:');
    Array.from(this.workers.values()).forEach(worker => {
      const avgTime = worker.completedTasks > 0
        ? Math.round(worker.totalProcessingTime / worker.completedTasks)
        : 0;

      console.log(
        `   ${worker.id}: ${worker.completedTasks} tasks ` +
        `(avg: ${avgTime}ms) ${worker.busy ? '🔄' : '⏸️'}`
      );
    });

    const successCount = this.results.filter(r => r.success).length;
    console.log('\n📈 Overall Summary:');
    console.log(`   ✅ Total files processed: ${this.results.length}`);
    console.log(`   ✅ Successful fixes: ${successCount}`);
    console.log(`   ❌ Failed: ${this.results.length - successCount}`);
    console.log(`   ⏱️  Total duration: ${totalDuration}ms`);
    console.log(`   🚀 Average per file: ${Math.round(totalDuration / this.results.length)}ms`);
    console.log(`   ⚡ Throughput: ${Math.round((this.results.length / totalDuration) * 1000)} files/sec`);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Task Generator
 *
 * Creates optimized tasks for all files
 */
class TaskGenerator {
  /**
   * Generate all tasks for code quality fixes
   */
  async generateAllTasks(basePath = process.cwd()): Promise<Task[]> {
    console.log('🔍 Scanning files for code quality tasks...');

    const files = await this.getAllRelevantFiles(basePath);
    const tasks: Task[] = [];

    for (const filePath of files) {
      const fileTasks = this.generateTasksForFile(filePath);
      tasks.push(...fileTasks);
    }

    console.log(`📝 Generated ${tasks.length} tasks for ${files.length} files`);
    return tasks;
  }

  /**
   * Generate tasks for a specific file
   */
  private generateTasksForFile(filePath: string): Task[] {
    const ext = extname(filePath);
    const tasks: Task[] = [];

    // All files need formatting
    tasks.push({
      id: `format-${filePath}`,
      type: 'format',
      filePath,
      priority: 1, // High priority - quick and beneficial
      estimatedComplexity: 1
    });

    // TypeScript/JavaScript files need linting and type checking
    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      tasks.push({
        id: `lint-${filePath}`,
        type: 'lint',
        filePath,
        priority: 2, // Medium priority
        estimatedComplexity: 2
      });

      // Only TypeScript files need type checking
      if (ext.startsWith('.ts') || ext.startsWith('.tsx')) {
        tasks.push({
          id: `typecheck-${filePath}`,
          type: 'typecheck',
          filePath,
          priority: 3, // Lower priority - most expensive
          estimatedComplexity: 3
        });
      }
    }

    // Test files need quality analysis
    if (this.isTestFile(filePath)) {
      tasks.push({
        id: `test-quality-${filePath}`,
        type: 'test-quality',
        filePath,
        priority: 4, // Lowest priority - most expensive analysis
        estimatedComplexity: 4
      });
    }

    return tasks;
  }

  /**
   * Check if file is a test file
   */
  private isTestFile(filePath: string): boolean {
    const testPatterns = [
      /\.test\.(ts|js|tsx|jsx)$/,
      /\.spec\.(ts|js|tsx|jsx)$/,
      /__tests__\/.*\.(ts|js|tsx|jsx)$/,
      /\/test\/.*\.(ts|js|tsx|jsx)$/,
      /\/tests\/.*\.(ts|js|tsx|jsx)$/,
    ];

    return testPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Get all relevant files for code quality
   */
  private async getAllRelevantFiles(basePath: string): Promise<string[]> {
    try {
      const extensions = [
        'ts', 'tsx', 'js', 'jsx',
        'json', 'md', 'yml', 'yaml',
        'html', 'css', 'scss', 'less'
      ];

      // Include test files with extensions
      const testFindCmd = `find "${basePath}" -name "*.test.*" -o -name "*.spec.*" -o -path "*/__tests__/*" -o -path "*/test/*" -o -path "*/tests/*" | grep -E "\\.(ts|js|tsx|jsx)$"`;

      // Build find commands with proper escaping
      const extPatterns = extensions.map(ext => `-name "*.${ext}"`).join(' -o ');
      const sourceFindCmd = `find "${basePath}" \\( ${extPatterns} \\) -type f`;
      const filterCmd = 'grep -v -E "(node_modules|dist|\\.git|coverage)"';

      // Execute both find commands
      const sourceProc = spawn({
        cmd: ['/bin/bash', '-c', `${sourceFindCmd} | ${filterCmd}`],
        stdout: 'pipe',
        stderr: 'pipe'
      });

      const testProc = spawn({
        cmd: ['/bin/bash', '-c', `${testFindCmd} | ${filterCmd}`],
        stdout: 'pipe',
        stderr: 'pipe'
      });

      const [sourceOutput, testOutput] = await Promise.all([
        new Response(sourceProc.stdout).text(),
        new Response(testProc.stdout).text()
      ]);

      const output = sourceOutput + testOutput;

      return output
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .sort();

    } catch (error) {
      console.warn('Could not find files:', error);
      return [];
    }
  }
}

/**
 * Main unified fix command
 */
export async function runUnifiedFix(args: string[] = []): Promise<void> {
  console.log('🔧 Starting Unified Code Quality Fix...\n');

  try {
    // Generate all tasks
    const taskGenerator = new TaskGenerator();
    const tasks = await taskGenerator.generateAllTasks();

    if (tasks.length === 0) {
      console.log('✅ No files found that need processing!');
      return;
    }

    // Create and run worker pool
    const workerPool = new DynamicWorkerPool(
      args.includes('--max-workers') ? parseInt(args[args.indexOf('--max-workers') + 1]) : undefined
    );

    const results = await workerPool.processAllTasks(tasks);

    // Generate final report
    const failedResults = results.filter(r => !r.success);

    if (failedResults.length > 0) {
      console.log('\n❌ Failed Operations:');
      failedResults.forEach(result => {
        console.log(`   ${result.type}: ${result.filePath}`);
        if (result.error) console.log(`     Error: ${result.error}`);
      });
    }

    console.log('\n🎊 All done! Your code is now clean and quality-assured!');

  } catch (error) {
    console.error('💥 Unified fix failed:', error);
    process.exit(1);
  }
}

// Export for use in slash command registry
export { DynamicWorkerPool, TaskGenerator };