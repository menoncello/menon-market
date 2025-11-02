/**
 * Menon Marketplace Server
 * Built with Bun and TypeScript
 */

const port = process.env.PORT || 30100;

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve the main HTML file
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = await Bun.file("./index.html").text();
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // Serve static CSS
    if (url.pathname === "/static/styles.css") {
      const css = await Bun.file("./static/styles.css").text();
      return new Response(css, {
        headers: {
          "Content-Type": "text/css",
        },
      });
    }

    // Serve JavaScript
    if (url.pathname === "/simple-frontend.ts") {
      const js = await Bun.file("./simple-frontend.ts").text();
      return new Response(js, {
        headers: {
          "Content-Type": "application/typescript",
        },
      });
    }

    // API endpoints
    if (url.pathname === "/api/plugins") {
      const plugins = [
        {
          id: "code-formatter",
          name: "Code Formatter",
          version: "1.0.0",
          description: "Professional code formatting with support for multiple languages and customizable rules.",
          author: "Eduardo Menoncello",
          category: "development",
          tags: ["formatting", "code-quality", "productivity"],
          icon: "🎨",
          downloads: 1250,
          rating: 4.8,
          repository: "https://github.com/menoncello/code-formatter",
          homepage: "https://menoncello.com/code-formatter"
        },
        {
          id: "git-enhanced",
          name: "Git Enhanced",
          version: "2.1.0",
          description: "Advanced Git operations with intelligent commit suggestions and branch management.",
          author: "Dev Tools Inc",
          category: "development",
          tags: ["git", "version-control", "productivity"],
          icon: "🔧",
          downloads: 890,
          rating: 4.6
        },
        {
          id: "api-tester",
          name: "API Tester",
          version: "1.5.0",
          description: "Comprehensive API testing tool with automatic documentation generation.",
          author: "API Masters",
          category: "development",
          tags: ["api", "testing", "documentation"],
          icon: "🚀",
          downloads: 756,
          rating: 4.7
        }
      ];

      return Response.json(plugins);
    }

    if (url.pathname === "/api/skills") {
      const skills = [
        {
          id: "code-review-assistant",
          name: "Code Review Assistant",
          version: "1.0.0",
          description: "AI-powered code review with suggestions for improvements, security checks, and best practices.",
          author: "Eduardo Menoncello",
          category: "analysis",
          tags: ["code-review", "ai", "quality-assurance"],
          icon: "🔍",
          downloads: 2100,
          rating: 4.9,
          repository: "https://github.com/menoncello/code-review-assistant"
        },
        {
          id: "documentation-generator",
          name: "Documentation Generator",
          version: "2.0.0",
          description: "Automatically generate comprehensive documentation from your codebase.",
          author: "DocGen Team",
          category: "generation",
          tags: ["documentation", "automation", "productivity"],
          icon: "📚",
          downloads: 1450,
          rating: 4.5
        },
        {
          id: "performance-optimizer",
          name: "Performance Optimizer",
          version: "1.3.0",
          description: "Analyze and optimize your code for better performance and resource usage.",
          author: "Perf Masters",
          category: "optimization",
          tags: ["performance", "optimization", "analysis"],
          icon: "⚡",
          downloads: 980,
          rating: 4.4
        }
      ];

      return Response.json(skills);
    }

    if (url.pathname === "/api/stats") {
      const stats = {
        plugins: 3,
        skills: 3,
        downloads: 7426,
        categories: ["development", "analysis", "generation", "optimization"],
        lastUpdated: new Date().toISOString()
      };

      return Response.json(stats);
    }

    // 404 for unknown routes
    return new Response("Not Found", { status: 404 });
  },
  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

console.log(`🏪 Menon Marketplace is running on http://localhost:${port}`);
console.log(`📊 API endpoints:`);
console.log(`   GET /api/plugins - Get all plugins`);
console.log(`   GET /api/skills - Get all skills`);
console.log(`   GET /api/stats - Get marketplace statistics`);