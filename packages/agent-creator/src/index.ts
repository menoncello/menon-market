/**
 * Main export file for @menon-market/agent-creator package
 * Provides agent creation service, API, and supporting utilities
 */

// Export main service
export { AgentCreationService } from './AgentCreationService';

// Export API service
export { AgentCreatorAPI } from './AgentCreatorAPI';

// Export supporting services
export { TemplateEngine } from './TemplateEngine';
export { ValidationService } from './ValidationService';
export { PerformanceMonitor, type PerformanceMetrics, type CreationMetric } from './PerformanceMonitor';

// Export types for external use
export type {
  CreateAgentRequest,
  CreateAgentResponse,
  AgentDefinition,
  AgentTemplate,
  AgentRole,
  LearningMode,
  ValidationResult
} from '@menon-market/core';