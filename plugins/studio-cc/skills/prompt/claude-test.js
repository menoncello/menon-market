// Teste manual para usar no Claude Code
// Execute: node claude-test.js

import { AdvancedPromptCrafter } from './dist/index.js';

// Criar instância do skill
const crafter = new AdvancedPromptCrafter();

// Teste 1: Otimização de prompt simples
async function teste1() {
  console.log('🚀 Teste 1: Otimizando prompt simples\n');

  const prompt = "criar um website de delivery";
  const resultado = await crafter.analyzeAndOptimize(prompt, {
    mode: 'business',
    domain: 'technical'
  });

  console.log('📝 Original:', prompt);
  console.log('✨ Otimizado:', resultado.optimizedPrompt);
  console.log('📊 Score:', resultado.validation.qualityScore.toFixed(1) + '/10');
  console.log('🏗️ Domínio:', resultado.analysis.domain);
  console.log('⚡ Complexidade:', resultado.analysis.complexity);
  console.log('---\n');

  return resultado;
}

// Teste 2: Criar prompt a partir de requisitos
async function teste2() {
  console.log('📋 Teste 2: Criando prompt a partir de requisitos\n');

  const request = {
    task: "Implementar sistema de autenticação",
    domain: "technical",
    mode: "business",
    requirements: {
      include: ["login", "senha segura", "recuperação de senha"],
      exclude: ["armazenar senha em texto plano"],
      constraints: ["OAuth 2.0", "JWT tokens"]
    },
    context: "Para aplicação web moderna"
  };

  const resultado = await crafter.createPrompt(request);

  console.log('🎯 Tarefa:', request.task);
  console.log('✨ Prompt Gerado:', resultado.optimizedPrompt);
  console.log('📊 Score:', resultado.validation.qualityScore.toFixed(1) + '/10');
  console.log('---\n');

  return resultado;
}

// Teste 3: Análise de métricas
async function teste3() {
  console.log('📊 Teste 3: Análise completa de métricas\n');

  const prompt = "Como desenvolvedor sênior, crie um guia completo sobre arquitetura de microsserviços incluindo exemplos práticos, melhores práticas, estratégias de deploy e padrões de tratamento de erros para desenvolvedores intermediários.";

  const metrics = await crafter.getQualityMetrics(prompt);

  console.log('📝 Prompt:', prompt);
  console.log('📈 Métricas:');
  console.log('  • Claridade:', metrics.clarity + '/10');
  console.log('  • Especificidade:', metrics.specificity + '/10');
  console.log('  • Completude:', metrics.completeness + '/10');
  console.log('  • Eficiência:', metrics.efficiency + '/10');
  console.log('  • Consistência:', metrics.consistency + '/10');
  console.log('  • Taxa de Erro:', metrics.errorRate + '/10');
  console.log('  • Overall:', metrics.overall.toFixed(1) + '/10');
  console.log('---\n');

  return metrics;
}

// Teste 4: A/B Testing
async function teste4() {
  console.log('🔄 Teste 4: Variações para A/B Testing\n');

  const prompt = "implementar API REST";
  const variacoes = await crafter.createABTestVariations(prompt, 3);

  console.log('📝 Original:', prompt);
  console.log('🎯 Variações:');

  variacoes.forEach((variacao, index) => {
    console.log(`  ${index + 1}. ${variacao.optimizedPrompt.substring(0, 100)}...`);
  });
  console.log('---\n');

  return variacoes;
}

// Executar todos os testes
async function executarTestes() {
  console.log('🧪 INICIANDO TESTES DO ADVANCED PROMPT CRAFTER\n');
  console.log('=' .repeat(50));

  try {
    await teste1();
    await teste2();
    await teste3();
    await teste4();

    console.log('✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('\n🎉 O skill está funcionando perfeitamente no Claude Code!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

// Exportar funções para uso individual
export {
  teste1 as testSimplePrompt,
  teste2 as testPromptFromRequirements,
  teste3 as testQualityMetrics,
  teste4 as testABTesting,
  executarTestes as runAllTests
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTestes();
}