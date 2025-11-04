// Teste rápido para Claude Code
import { AdvancedPromptCrafter } from './dist/index.js';

const crafter = new AdvancedPromptCrafter();

// Teste rápido com um prompt
const resultado = await crafter.analyzeAndOptimize('criar chatbot com IA', {
  mode: 'technical',
  domain: 'technical',
});

console.log('🎯 Teste Rápido');
console.log('Original:', 'criar chatbot com IA');
console.log('Otimizado:', resultado.optimizedPrompt.substring(0, 200) + '...');
console.log('Score:', resultado.validation.qualityScore.toFixed(1) + '/10');
