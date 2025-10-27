import { AgentCreationService } from './packages/agent-creator/src/AgentCreationService.js';

const service = new AgentCreationService();

const validation = service.validateTemplateCustomizations('FrontendDev', {
  name: null,
});

console.log('Validation result:', validation);
console.log('Errors:', validation.errors);
console.log('Has required error:', validation.errors.some(error => error.includes('required')));