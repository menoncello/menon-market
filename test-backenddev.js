import { AgentCreationService } from './packages/agent-creator/src/AgentCreationService.js';

const service = new AgentCreationService();

const request = {
  definition: 'BackendDev',
  customizations: {
    name: 'Test Backend Developer',
    description: 'A test backend developer agent',
    backstory: 'I am a test backend developer with experience in building scalable APIs and database systems.',
  },
  options: {
    skipValidation: false,
    dryRun: true,
    verbose: false,
  },
};

console.log('=== Testing BackendDev ===');
const result = await service.createAgent(request);
console.log('Success:', result.success);
console.log('Errors:', result.errors);
if (result.metadata?.validationResults) {
  console.log('Validation Results:', result.metadata.validationResults);
}