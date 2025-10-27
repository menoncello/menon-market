import { AGENT_TEMPLATES, validateCustomizations } from './packages/core/src/agents/templates.js';
import { AgentCreationService } from './packages/agent-creator/src/AgentCreationService.js';

const service = new AgentCreationService();

const request = {
  definition: 'BackendDev',
  customizations: {
    name: 'Test Backend Developer',
    description: 'A test backend developer agent',
    backstory: 'I am a test backend developer',
  },
  options: {
    skipValidation: true,
    dryRun: true,
    verbose: false,
  },
};

console.log('=== Testing Template Validation ===');
const template = AGENT_TEMPLATES.BackendDev;
console.log('Template found:', !!template);

const validation = validateCustomizations(template, request.customizations);
console.log('Validation result:', validation);

console.log('\n=== Testing with Skip Validation ===');
const skipValidationRequest = { ...request, options: { ...request.options, skipValidation: true } };
const resultSkipValidation = await service.createAgent(skipValidationRequest);
console.log('Success (skip validation):', resultSkipValidation.success);
console.log('Agent created:', !!resultSkipValidation.agent);

if (resultSkipValidation.agent) {
  console.log('\n=== Agent Details ===');
  console.log('Agent ID:', resultSkipValidation.agent.id);
  console.log('Agent Name:', resultSkipValidation.agent.name);
  console.log('Agent Role:', resultSkipValidation.agent.role);
  console.log('Agent has metadata:', !!resultSkipValidation.agent.metadata);
  console.log('Agent metadata:', resultSkipValidation.agent.metadata);
  console.log('Agent backstory:', resultSkipValidation.agent.backstory);
  console.log('Agent backstory length:', resultSkipValidation.agent.backstory?.length);
}

console.log('\n=== Testing Agent Creation ===');
const result = await service.createAgent(request);
console.log('Success:', result.success);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
console.log('Agent:', result.agent);
console.log('Metadata:', result.metadata);

if (result.metadata?.validationResults?.[0]?.details) {
  console.log('\n=== Schema Validation Details ===');
  console.log('Validation details:', result.metadata.validationResults[0].details);
}