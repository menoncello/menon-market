import { AgentCreationService } from './packages/agent-creator/src/AgentCreationService.js';

const service = new AgentCreationService();

console.log('=== Testing validateCustomizations ===');
const validation = service.validateTemplateCustomizations('FrontendDev', {
  name: 'Test Agent',
  maxExecutionTime: 30,
});

console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);

console.log('\n=== Testing createAgent ===');
const request = {
  definition: 'FrontendDev',
  customizations: {
    name: 'Test Frontend Developer',
    description: 'A test frontend developer agent',
    backstory: 'I am a test frontend developer',
  },
  options: {
    skipValidation: false,
    dryRun: true,
    verbose: false,
  },
};

const result = await service.createAgent(request);
console.log('Success:', result.success);
console.log('Errors:', result.errors);
if (result.metadata?.validationResults) {
  console.log('Validation Results:', result.metadata.validationResults);
}