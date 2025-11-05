---
name: bunjs
description: Comprehensive Bun.js development guidance - use when working with Bun runtime, bundler, or any Bun-specific APIs. Includes server creation, file I/O, database operations, testing, and deployment patterns optimized for Bun's performance characteristics.
---

# Bun.js Development Skill

This skill provides specialized guidance for Bun.js development, covering runtime features, APIs, best practices, and performance optimization patterns. Use when creating Bun applications, migrating from Node.js, or leveraging Bun's unique capabilities.

## When to Use This Skill

- Creating web servers with `Bun.serve()`
- Building high-performance HTTP APIs and WebSocket applications
- Implementing file I/O operations with `Bun.file()` and `Bun.write()`
- Working with SQLite databases using `bun:sqlite`
- Running tests with `bun test`
- Building applications with `Bun.build()`
- Processing child processes with `Bun.spawn()`
- Using cross-platform shell commands with `Bun.$`
- Migrating Node.js applications to Bun
- Optimizing for performance and startup speed

## Core Bun.js Development Patterns

### HTTP Server with Bun.serve

Create high-performance HTTP/HTTPS servers with WebSocket support:

```typescript
import { serve } from "bun";

const server = serve({
  port: 3000,
  development: process.env.NODE_ENV !== "production",

  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (upgraded) return undefined;
    }

    // API routes
    if (url.pathname.startsWith("/api/")) {
      return handleAPI(req, url);
    }

    // Static files
    return new Response(Bun.file("./public/index.html"));
  },

  websocket: {
    open(ws) {
      ws.subscribe("chat-room");
      console.log("Client connected");
    },
    message(ws, message) {
      // Broadcast to all clients
      server.publish("chat-room", message);
    },
    close(ws) {
      console.log("Client disconnected");
    },
    error(ws, error) {
      console.error("WebSocket error:", error);
    },
  },

  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`🚀 Server: http://localhost:${server.port}`);
```

### File I/O Operations

Use Bun's optimized file APIs for maximum performance:

```typescript
import { file, write } from "bun";

// Read operations
async function readFileOperations() {
  // Read as text
  const text = await file("./data.json").text();

  // Read and parse JSON automatically
  const config = await file("./config.json").json();

  // Read as binary buffer
  const buffer = await file("./image.png").arrayBuffer();

  // Stream large files
  const largeFile = file("./video.mp4");
  const stream = largeFile.stream();

  return { text, config, buffer, stream };
}

// Write operations
async function writeFileOperations() {
  // Write string
  await write("./output.txt", "Hello Bun!");

  // Write JSON
  await write("./data.json", JSON.stringify({ key: "value" }));

  // Copy files efficiently
  await write("./backup.txt", file("./original.txt"));

  // Write with options
  await write("./logs/app.log", new Date().toISOString() + "\n", {
    createPath: true, // Create directories if needed
  });
}

// File metadata
function getFileMetadata(filePath: string) {
  const stats = file(filePath);
  return {
    size: stats.size,
    type: stats.type,
    lastModified: stats.lastModified,
  };
}
```

### SQLite Database Integration

Use Bun's built-in SQLite for high-performance data storage:

```typescript
import { Database } from "bun:sqlite";

// Initialize database
const db = new Database("app.db");

// Create tables
function setupDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      age INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

// Query operations
class UserService {
  private getUserQuery = db.query("SELECT * FROM users WHERE id = ?");
  private getAllUsersQuery = db.query("SELECT * FROM users ORDER BY created_at DESC");
  private createUserQuery = db.query("INSERT INTO users (name, email, age) VALUES (?, ?, ?)");

  getUser(id: number) {
    return this.getUserQuery.get(id);
  }

  getAllUsers() {
    return this.getAllUsersQuery.all();
  }

  createUser(name: string, email: string, age: number) {
    return this.createUserQuery.run(name, email, age);
  }
}

// Transactions
function transferData(sourceTable: string, targetTable: string) {
  const transfer = db.transaction(() => {
    // Multiple related operations
    const data = db.query(`SELECT * FROM ${sourceTable}`).all();

    for (const row of data) {
      db.query(`INSERT INTO ${targetTable} VALUES (?, ?, ?)`).run(row.id, row.name, row.value);
    }

    db.query(`DELETE FROM ${sourceTable}`).run();
  });

  transfer();
}
```

### Bun Test Framework

Write fast, Jest-compatible tests with Bun's test runner:

```typescript
import { test, expect, describe, beforeAll, afterAll, mock } from "bun:test";

describe("API Endpoints", () => {
  let server: Server;
  const baseUrl = "http://localhost:3000";

  beforeAll(async () => {
    // Start test server
    server = Bun.serve({
      port: 0,
      fetch(req) {
        return Response.json({ status: "ok", timestamp: Date.now() });
      },
    });
  });

  afterAll(() => {
    server.stop();
  });

  test("should respond with JSON", async () => {
    const response = await fetch(`${baseUrl}/`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("timestamp");
  });

  test("mocking external services", () => {
    const mockFetch = mock(() => Promise.resolve(Response.json({ data: "mocked" })));

    global.fetch = mockFetch;

    return fetchExternalData().then(data => {
      expect(data.data).toBe("mocked");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  test("snapshot testing", () => {
    const user = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      created: new Date("2024-01-01"),
    };

    expect(user).toMatchSnapshot();
  });
});
```

### Child Processes and Shell Commands

Execute external commands efficiently with Bun's shell integration:

```typescript
import { spawn, $ } from "bun";

// Asynchronous process execution
async function runGitStatus() {
  const proc = spawn({
    cmd: ["git", "status", "--porcelain"],
    stdout: "pipe",
    stderr: "pipe",
    cwd: process.cwd(),
  });

  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  return { output: output.trim(), exitCode };
}

// Cross-platform shell commands
async function shellOperations() {
  // Basic command with template literals
  const listFiles = await $`ls -la`.text();

  // Command with variable interpolation (safe escaping)
  const fileName = "my file.txt";
  const fileContent = await $`cat ${fileName}`.text();

  // Pipe operations
  const errors = await $`cat app.log | grep ERROR | tail -n 10`.text();

  // JSON output
  const packageInfo = await $`cat package.json`.json();

  return { listFiles, fileContent, errors, packageInfo };
}

// Process management
async function manageProcesses() {
  // Set environment and working directory
  $.env({ NODE_ENV: "test" });
  $.cwd("./tests");

  // Error handling
  try {
    const result = await $`npm test`;
    console.log("Tests passed:", result.exitCode === 0);
  } catch (error) {
    console.error("Tests failed:", error.exitCode);
  }

  // Quiet mode (no exceptions)
  $.nothrow();
  const result = await $`command-that-might-fail`;
  if (result.exitCode !== 0) {
    console.log("Command failed gracefully");
  }
}
```

### Application Building

Bundle and optimize applications with Bun's built-in bundler:

```typescript
const buildConfig = {
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun" as const,
  format: "esm" as const,
  minify: true,
  sourcemap: "external" as const,
  splitting: true,
  external: ["react", "react-dom"],

  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "[name]-[hash].[ext]",
    asset: "[name]-[hash].[ext]",
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.API_URL": JSON.stringify("https://api.example.com"),
  },

  plugins: [
    {
      name: "custom-loader",
      setup(build) {
        build.onLoad({ filter: /\.custom$/ }, async args => {
          const source = await Bun.file(args.path).text();
          return {
            contents: `export default ${JSON.stringify(source)};`,
            loader: "js",
          };
        });
      },
    },
  ],
};

async function buildApplication() {
  const result = await Bun.build(buildConfig);

  if (!result.success) {
    console.error("Build failed:");
    for (const log of result.logs) {
      console.error(log.message);
    }
    process.exit(1);
  }

  console.log(`✅ Built ${result.outputs.length} files:`);
  for (const output of result.outputs) {
    console.log(`  ${output.path}: ${output.size} bytes`);
  }

  return result;
}

// Development build with hot reload
async function devBuild() {
  const result = await Bun.build({
    ...buildConfig,
    minify: false,
    sourcemap: "inline",
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error("Watch build failed:", error);
        } else {
          console.log("🔄 Rebuilt successfully");
        }
      },
    },
  });

  return result;
}
```

## Performance Optimization Patterns

### Startup Speed Optimization

Minimize application startup time with Bun-specific patterns:

```typescript
// Lazy load heavy dependencies
class DatabaseService {
  private db: Database | null = null;

  private getDatabase() {
    if (!this.db) {
      this.db = new Database("app.db");
    }
    return this.db;
  }

  async query(sql: string, params: any[] = []) {
    return this.getDatabase()
      .query(sql)
      .all(...params);
  }
}

// Use Bun's built-in APIs instead of external packages
// Instead of: import fs from 'fs/promises';
// Use:
import { file } from "bun";

async function readConfig() {
  // Faster than fs.readFile
  return await file("config.json").json();
}
```

### Memory Optimization

Efficient memory usage patterns for high-concurrency applications:

```typescript
// Use streams for large files
async function processLargeFile(filePath: string) {
  const fileStream = file(filePath).stream();
  const processor = new TransformStream({
    transform(chunk, controller) {
      // Process chunk without loading entire file
      const processed = chunk.toString().toUpperCase();
      controller.enqueue(new TextEncoder().encode(processed));
    },
  });

  return fileStream.pipeThrough(processor);
}

// Reuse objects and buffers
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    return this.pool.pop() || this.createFn();
  }

  release(obj: T) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}
```

## Deployment and Production Patterns

### Single Binary Deployment

Deploy applications as standalone executables:

```typescript
// Compile to single binary
// bun build --compile --target bun ./src/index.ts --outfile ./app

// Production server with graceful shutdown
const server = serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  development: false,

  async fetch(req) {
    // Production-optimized request handling
    const url = new URL(req.url);

    // Add security headers
    const headers = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Strict-Transport-Security": "max-age=31536000",
    };

    if (url.pathname === "/api/health") {
      return Response.json(
        {
          status: "ok",
          timestamp: Date.now(),
          version: process.env.npm_package_version || "1.0.0",
        },
        { headers }
      );
    }

    return new Response("Not Found", { status: 404, headers });
  },
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  server.stop();
  process.exit(0);
});
```

### Environment Configuration

Manage different environments efficiently:

```typescript
interface Config {
  port: number;
  database: string;
  redis?: string;
  logLevel: "debug" | "info" | "warn" | "error";
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

function loadConfig(): Config {
  const env = process.env;

  return {
    port: parseInt(env.PORT || "3000"),
    database: env.DATABASE_URL || "sqlite:app.db",
    redis: env.REDIS_URL,
    logLevel: (env.LOG_LEVEL as any) || "info",
    cors: {
      origin: env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
      credentials: env.CORS_CREDENTIALS === "true",
    },
  };
}

const config = loadConfig();
```

## Migration from Node.js

Key patterns for migrating Node.js applications to Bun:

```typescript
// Replace CommonJS requires with ES modules
// Before: const express = require('express');
// After: import { serve } from 'bun';

// Replace fs operations
// Before: import { readFile } from 'fs/promises';
// After: import { file } from 'bun';

// Replace child_process
// Before: import { spawn } from 'child_process';
// After: import { $, spawn } from 'bun';

// Replace package.json scripts
// "start": "node index.js" → "start": "bun index.js"
// "test": "jest" → "test": "bun test"

// Use Bun's built-in APIs when possible
// Instead of external libraries for:
// - SQLite (use bun:sqlite)
// - WebSockets (built into Bun.serve)
// - File watching (built-in dev server)
// - HTTP server (Bun.serve)
```

This skill provides comprehensive guidance for leveraging Bun.js's unique capabilities while maintaining best practices for performance, security, and maintainability.
