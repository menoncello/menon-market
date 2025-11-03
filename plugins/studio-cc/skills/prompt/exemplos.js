import { AdvancedPromptCrafter } from './dist/index.js';

const crafter = new AdvancedPromptCrafter();

// Exemplos de uso para diferentes cenários
const exemplos = [
  {
    nome: 'Prompt Técnico',
    prompt: 'create API for user authentication',
    opcoes: { mode: 'technical', domain: 'technical' },
  },
  {
    nome: 'Prompt Criativo',
    prompt: 'write a story about AI revolution',
    opcoes: { mode: 'creative', domain: 'creative' },
  },
  {
    nome: 'Prompt de Negócio',
    prompt: 'develop marketing strategy',
    opcoes: { mode: 'business', domain: 'business' },
  },
  {
    nome: 'Prompt de Pesquisa',
    prompt: 'analyze climate change data',
    opcoes: { mode: 'research', domain: 'research' },
  },
];

async function testarExemplos() {
  console.log('🧪 Testando exemplos práticos...\n');

  for (const exemplo of exemplos) {
    console.log(`📋 ${exemplo.nome}:`);
    console.log(`📝 Original: "${exemplo.prompt}"`);

    const resultado = await crafter.analyzeAndOptimize(exemplo.prompt, exemplo.opcoes);

    console.log(`🎯 Score: ${resultado.validation.qualityScore.toFixed(1)}/10`);
    console.log(`🏗️  Domínio: ${resultado.analysis.domain}`);
    console.log(`⚡ Complexidade: ${resultado.analysis.complexity}`);
    console.log(`✨ Otimizado: "${resultado.optimizedPrompt.substring(0, 150)}..."`);
    console.log('---\n');
  }
}

testarExemplos().catch(console.error);
