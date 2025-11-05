/**
 * Slash Commands Infrastructure
 *
 * Provides fast, parallel execution for code quality fixes
 * Uses worker threads and subprocesses for optimal performance
 */

import { spawn, $ } from "bun";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { file } from "bun";
import { join, relative } from "path";

interface WorkerTask {
  id: string;
  type: "format" | "lint" | "typecheck";
  filePath: string;
  content?: string;
}

interface WorkerResult {
  id: string;
  filePath: string;
  success: boolean;
  result: any;
  error?: string;
  duration: number;
}

interface ParallelOptions {
  maxWorkers?: number;
  batchSize?: number;
  timeout?: number;
}

/**
 * Parallel File Processor
 *
 * Processes multiple files simultaneously using worker threads
 */
export class ParallelFileProcessor {
  private readonly maxWorkers: number;
  private readonly timeout: number;
  private readonly batchSize: number;

  constructor(options: ParallelOptions = {}) {
    this.maxWorkers = options.maxWorkers || Math.min(8, navigator.hardwareConcurrency || 4);
    this.timeout = options.timeout || 30000; // 30 seconds per file
    this.batchSize = options.batchSize || 10;
  }

  /**
   * Process files in parallel using worker threads
   */
  async processFiles(
    files: string[],
    processor: "format" | "lint" | "typecheck"
  ): Promise<WorkerResult[]> {
    console.log(
      `🔄 Processing ${files.length} files with ${this.maxWorkers} workers for ${processor}`
    );

    const startTime = Date.now();
    const results: WorkerResult[] = [];
    const batches = this.createBatches(files, this.batchSize);

    // Process batches in parallel
    const batchPromises = batches.map(async (batch, batchIndex) => {
      console.log(
        `📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} files)`
      );

      // Process files within batch in parallel
      const batchPromises = batch.map(async filePath => {
        return this.processSingleFile(filePath, processor);
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Extract results from settled promises
      return batchResults.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return {
            id: `batch-${batchIndex}-file-${index}`,
            filePath: batch[index],
            success: false,
            result: null,
            error: result.reason?.message || "Unknown error",
            duration: 0,
          } as WorkerResult;
        }
      });
    });

    // Wait for all batches to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.flat());

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`✅ Completed ${processor} processing:`);
    console.log(`   📊 Total files: ${results.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   🚀 Avg per file: ${Math.round(duration / results.length)}ms`);

    return results;
  }

  /**
   * Process a single file with timeout
   */
  private async processSingleFile(
    filePath: string,
    processor: "format" | "lint" | "typecheck"
  ): Promise<WorkerResult> {
    const startTime = Date.now();
    const id = `${processor}-${relative(process.cwd(), filePath).replace(/[^a-zA-Z0-9]/g, "_")}`;

    try {
      let result: any;

      switch (processor) {
        case "format":
          result = await this.formatFile(filePath);
          break;
        case "lint":
          result = await this.lintFile(filePath);
          break;
        case "typecheck":
          result = await this.typecheckFile(filePath);
          break;
        default:
          throw new Error(`Unknown processor: ${processor}`);
      }

      return {
        id,
        filePath,
        success: true,
        result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        id,
        filePath,
        success: false,
        result: null,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Format a single file using Prettier
   */
  private async formatFile(filePath: string): Promise<{ formatted: boolean; changes?: string }> {
    try {
      // Read original content
      const originalContent = await file(filePath).text();

      // Run prettier with timeout
      const proc = spawn({
        cmd: ["bun", "run", "format", "--", filePath],
        stdout: "pipe",
        stderr: "pipe",
        cwd: process.cwd(),
      });

      const result = await Promise.race([
        new Promise((resolve, reject) => {
          proc.exited.then(resolve).catch(reject);
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Format timeout")), this.timeout / 3)
        ),
      ]);

      // Check if file was changed
      const newContent = await file(filePath).text();
      const changed = newContent !== originalContent;

      return {
        formatted: true,
        changes: changed ? "File was reformatted" : "No changes needed",
      };
    } catch (error) {
      throw new Error(`Format failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lint a single file and attempt auto-fixes
   */
  private async lintFile(
    filePath: string
  ): Promise<{ fixed: boolean; errors: string[]; warnings: string[] }> {
    try {
      // Run ESLint with auto-fix
      const proc = spawn({
        cmd: ["bun", "run", "lint", "--", "--fix", filePath],
        stdout: "pipe",
        stderr: "pipe",
        cwd: process.cwd(),
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      // Parse results
      const lines = (stdout + stderr).split("\n").filter(line => line.trim());
      const errors = lines.filter(line => line.includes("error") || line.includes("✖"));
      const warnings = lines.filter(line => line.includes("warning") || line.includes("⚠"));

      return {
        fixed: exitCode === 0 || lines.some(line => line.includes("fixed")),
        errors,
        warnings,
      };
    } catch (error) {
      throw new Error(`Lint failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Type-check a single file for TypeScript errors
   */
  private async typecheckFile(
    filePath: string
  ): Promise<{ errors: string[]; suggestions: string[] }> {
    try {
      // Run TypeScript compiler on single file
      const proc = spawn({
        cmd: ["bun", "run", "typecheck", "--", "--noEmit", filePath],
        stdout: "pipe",
        stderr: "pipe",
        cwd: process.cwd(),
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();

      // Parse TypeScript errors
      const lines = (stdout + stderr).split("\n").filter(line => line.trim());
      const errors = lines.filter(line => line.includes("error TS") && line.includes(filePath));

      // Generate suggestions based on common error patterns
      const suggestions = this.generateTypeScriptSuggestions(errors);

      return {
        errors,
        suggestions,
      };
    } catch (error) {
      throw new Error(
        `Typecheck failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate suggestions for common TypeScript errors
   */
  private generateTypeScriptSuggestions(errors: string[]): string[] {
    const suggestions: string[] = [];

    for (const error of errors) {
      if (error.includes("has no exported member")) {
        suggestions.push("Check import statements and ensure all exports exist");
      } else if (error.includes("Property does not exist")) {
        suggestions.push("Add proper type definitions or optional chaining for property access");
      } else if (error.includes("Type is not assignable")) {
        suggestions.push("Review type compatibility and consider type assertions");
      } else if (error.includes("Object is possibly 'undefined'")) {
        suggestions.push("Add null checks or non-null assertions");
      } else if (error.includes("Cannot find module")) {
        suggestions.push("Install missing dependencies or check module resolution");
      }
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Create batches of files for processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Get TypeScript and JavaScript files from directory
   */
  async getTypeScriptFiles(basePath = process.cwd()): Promise<string[]> {
    try {
      const result =
        await $`find ${basePath} -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v .git`.text();

      return result
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .sort();
    } catch (error) {
      console.warn("Could not find TypeScript files:", error);
      return [];
    }
  }

  /**
   * Get all source files (including config files that need formatting)
   */
  async getAllSourceFiles(basePath = process.cwd()): Promise<string[]> {
    try {
      const extensions = [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "md",
        "yml",
        "yaml",
        "html",
        "css",
        "scss",
        "less",
      ];

      const findCommands = extensions
        .map(ext => `find ${basePath} -name "*.${ext}" 2>/dev/null`)
        .join(" ");

      const result = await spawn({
        cmd: [
          "/bin/bash",
          "-c",
          `${findCommands} | grep -v node_modules | grep -v dist | grep -v .git | grep -v coverage | sort`,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const output = await new Response(result.stdout).text();

      return output
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } catch (error) {
      console.warn("Could not find source files:", error);
      return [];
    }
  }
}

/**
 * Command Registry
 *
 * Manages slash command registration and execution
 */
export class CommandRegistry {
  private commands = new Map<string, Function>();

  register(name: string, handler: Function) {
    this.commands.set(name, handler);
    console.log(`✅ Registered slash command: /${name}`);
  }

  async execute(name: string, args: string[]): Promise<any> {
    const handler = this.commands.get(name);
    if (!handler) {
      throw new Error(`Unknown command: /${name}`);
    }

    console.log(`🚀 Executing /${name} with args:`, args);
    return await handler(args);
  }

  listCommands(): string[] {
    return Array.from(this.commands.keys());
  }
}

// Global command registry instance
export const commandRegistry = new CommandRegistry();
