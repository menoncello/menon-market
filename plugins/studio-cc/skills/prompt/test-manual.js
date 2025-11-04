import { AdvancedPromptCrafter } from './src/index.js';

async function testSkill() {
  console.log('🚀 Testando Advanced Prompt Crafter Skill...\n');

  const crafter = new AdvancedPromptCrafter();

  // Test 1: Otimização de prompt simples
  console.log('📝 Test 1: Otimizando prompt simples');
  const simplePrompt = 'create a website';
  const result1 = await crafter.analyzeAndOptimize(simplePrompt, {
    mode: 'technical',
    domain: 'web-development',
  });

  console.log(`Original: "${simplePrompt}"`);
  console.log(`Optimized: "${result1.optimizedPrompt.substring(0, 200)}..."`);
  console.log(`Quality Score: ${result1.validation.qualityScore}/10\n`);

  // Test 2: Criar prompt a partir de requisitos
  console.log('📋 Test 2: Criando prompt a partir de requisitos');
  const promptRequest = {
    task: 'Create a REST API for user management',
    domain: 'technical',
    mode: 'business',
    requirements: {
      include: ['authentication', 'CRUD operations', 'error handling'],
      exclude: ['password storage in plain text'],
      constraints: ['RESTful design', 'JSON responses'],
    },
    context: 'For a modern web application',
    targetModel: 'claude',
    outputFormat: 'json',
  };

  const result2 = await crafter.createPrompt(promptRequest);
  console.log(`Generated Prompt: "${result2.optimizedPrompt}"`);
  console.log(
    `Analysis: Domain=${result2.analysis.domain}, Complexity=${result2.analysis.complexity}\n`
  );

  // Test 3: Métricas de qualidade
  console.log('📊 Test 3: Analisando métricas de qualidade');
  const testPrompt =
    'As a senior developer, create a comprehensive guide about microservices architecture including examples, best practices, deployment strategies, and error handling patterns for intermediate developers.';
  const metrics = await crafter.getQualityMetrics(testPrompt);

  console.log(`Prompt: "${testPrompt}"`);
  console.log(`Clarity: ${metrics.clarity}/10`);
  console.log(`Specificity: ${metrics.specificity}/10`);
  console.log(`Completeness: ${metrics.completeness}/10`);
  console.log(`Efficiency: ${metrics.efficiency}/10`);
  console.log(`Consistency: ${metrics.consistency}/10`);
  console.log(`Overall: ${metrics.overall}/10\n`);

  // Test 4: A/B Testing
  console.log('🔄 Test 4: Criando variações para A/B test');
  const variations = await crafter.createABTestVariations('implement user authentication', 3);
  variations.forEach((variation, index) => {
    console.log(`Variação ${index + 1}: ${variation.optimizedPrompt.substring(0, 100)}...`);
  });

  console.log('\n✅ Todos os testes concluídos com sucesso!');
}

// Executar testes
testSkill().catch(console.error);
