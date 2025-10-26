# Story: Core Marketplace Infrastructure

Status: Draft

## Story

As a developer,
I want a working marketplace platform with core infrastructure and plugin validation,
so that I can discover, validate, and install reliable Claude Code plugins.

## Acceptance Criteria

1. **Project Setup Complete**: Monolithic application structure created with SQLite database
2. **Database Schema Implemented**: Plugin registry, users, validation reports, and reviews tables ready
3. **Basic API Server Running**: Express.js server with authentication and plugin endpoints
4. **Plugin Validation Engine**: Single-pass validation with confidence scoring working
5. **Simplified MCP Communication**: Basic REST API for plugin execution without complex protocols
6. **User Authentication**: JWT-based auth with user registration and login
7. **Core Frontend**: Basic marketplace interface with search and plugin display

## Tasks / Subtasks

- [ ] **Task 1**: Initialize project structure and development environment (AC: 1)
  - [ ] Create monolithic app structure with src/api, src/core, src/database folders
  - [ ] Setup package.json with Node.js 22.20.0, Express 5.1.0, TypeScript 5.9.3
  - [ ] Configure development scripts (npm run dev, build, test)
  - [ ] Setup ESLint and Prettier configuration (AC: 1)

- [ ] **Task 2**: Implement database schema and models (AC: 2)
  - [ ] Setup SQLite database with migrations system
  - [ ] Create Plugin model with validation score, download count, ratings
  - [ ] Create User model with authentication fields
  - [ ] Create ValidationReport model for audit trail
  - [ ] Create Review model for user feedback (AC: 2)

- [ ] **Task 3**: Build core API server (AC: 3)
  - [ ] Setup Express.js server on port 20200
  - [ ] Implement middleware for authentication, rate limiting, error handling
  - [ ] Create plugin CRUD endpoints (/api/plugins)
  - [ ] Implement user authentication endpoints (/api/auth)
  - [ ] Add validation endpoints (/api/validation) (AC: 3)

- [ ] **Task 4**: Implement single-pass validation engine (AC: 4)
  - [ ] Create ValidationEngine class with confidence scoring
  - [ ] Implement static code analysis for security vulnerabilities
  - [ ] Add execution testing in Node.js VM sandbox
  - [ ] Build confidence scoring algorithm (0-100 scale)
  - [ ] Create validation report generation (AC: 4)

- [ ] **Task 5**: Build basic frontend interface (AC: 7)
  - [ ] Setup React 19.2.0 + Vite 7.1.12 application
  - [ ] Create plugin search and listing components
  - [ ] Implement plugin detail pages with validation reports
  - [ ] Add user authentication UI (login/register)
  - [ ] Connect frontend to API endpoints (AC: 7)

- [ ] **Task 6**: Implement user authentication system (AC: 6)
  - [ ] Setup JWT token generation and validation
  - [ ] Create user registration with email verification
  - [ ] Implement password hashing and security
  - [ ] Add user session management
  - [ ] Create user dashboard for plugin management (AC: 6)

## Dev Notes

### Technical Summary

Core infrastructure story establishes the foundation for the marketplace platform. Focus on simplicity with SQLite database, Express.js API, and React frontend. Single-pass validation engine provides the key differentiator for plugin reliability.

### Project Structure Notes

- **Files to modify**: src/api/server.ts, src/database/models/*.ts, src/core/ValidationEngine.ts, frontend/src/components/*.tsx
- **Expected test locations**: tests/unit/validation-engine.test.ts, tests/integration/api.test.ts, tests/e2e/user-journey.test.ts
- **Estimated effort**: 8 story points (6-8 days)

### References

- **Tech Spec**: See tech-spec.md for detailed implementation guide, database schema, and validation approach
- **Architecture**: Sections: Source Tree Structure, Technical Approach, Implementation Stack, Development Setup

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be populated during dev-story execution -->

### Debug Log References

<!-- Will be populated during dev-story execution -->

### Completion Notes List

<!-- Will be populated during dev-story execution -->

### File List

<!-- Will be populated during dev-story execution -->