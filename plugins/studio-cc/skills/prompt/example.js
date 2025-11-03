import { AdvancedPromptCrafter } from './dist/index.js';

async function demonstrateAdvancedPromptCrafter() {
  console.log('🚀 Advanced Prompt Crafter Demo');
  console.log('=====================================\n');

  const crafter = new AdvancedPromptCrafter();

  // Example 1: Analyze and optimize a simple prompt
  console.log('1️⃣  Analyzing and optimizing a simple prompt...');
  const simplePrompt = 'Write about AI';
  const result1 = await crafter.analyzeAndOptimize(simplePrompt, {
    mode: 'creative',
    targetModel: 'claude-3-sonnet',
    outputFormat: 'markdown',
  });

  console.log('Original Prompt:', simplePrompt);
  console.log('Optimized Prompt:', result1.optimizedPrompt);
  console.log('Quality Score:', result1.validation.qualityScore + '/10');
  console.log('Response Time:', result1.responseTime + 'ms\n');

  // Example 2: Create a technical prompt from requirements
  console.log('2️⃣  Creating a technical prompt from requirements...');
  const technicalRequest = {
    task: 'Generate TypeScript code for a REST API',
    domain: 'technical',
    mode: 'technical',
    requirements: {
      include: ['types', 'validation', 'error-handling'],
      exclude: ['external-apis'],
      constraints: ['async/await', 'try-catch blocks'],
    },
    context: 'E-commerce platform backend',
  };

  const result2 = await crafter.createPrompt(technicalRequest);
  console.log('Generated Prompt:');
  console.log(result2.optimizedPrompt);
  console.log('Domain:', result2.metadata.domain);
  console.log('Quality Score:', result2.validation.qualityScore + '/10\n');

  // Example 3: Get quality metrics for a complex prompt
  console.log('3️⃣  Analyzing quality metrics for a complex prompt...');
  const complexPrompt =
    'As a senior software architect with 10+ years of experience in microservices, create a comprehensive guide about implementing a distributed system architecture. Include specific examples of service discovery, load balancing, circuit breakers, and monitoring. Format the response in Markdown with code examples and architectural diagrams described in text.';

  const metrics = await crafter.getQualityMetrics(complexPrompt);
  console.log('Prompt:', complexPrompt.substring(0, 100) + '...');
  console.log('Quality Metrics:');
  console.log(`  Overall: ${metrics.overall}/10`);
  console.log(`  Clarity: ${metrics.clarity}/10`);
  console.log(`  Specificity: ${metrics.specificity}/10`);
  console.log(`  Completeness: ${metrics.completeness}/10`);
  console.log(`  Efficiency: ${metrics.efficiency}/10`);
  console.log(`  Consistency: ${metrics.consistency}/10`);
  console.log(`  Error Rate: ${metrics.errorRate}/10\n`);

  // Example 4: Create A/B test variations
  console.log('4️⃣  Creating A/B test variations...');
  const testPrompt = 'Create a user authentication system';
  const variations = await crafter.createABTestVariations(testPrompt, 3);

  console.log('Base Prompt:', testPrompt);
  console.log('Variations:');
  variations.forEach((variation, index) => {
    console.log(`  Variation ${index + 1}: ${variation.optimizedPrompt.substring(0, 80)}...`);
    console.log(`    Quality: ${variation.validation.qualityScore}/10`);
    console.log(`    Mode: ${variation.metadata.mode}`);
  });
  console.log('');

  // Example 5: Business mode demonstration
  console.log('5️⃣  Business mode demonstration...');
  const businessResult = await crafter.analyzeAndOptimize(
    'Develop a marketing strategy for a new SaaS product',
    {
      mode: 'business',
      domain: 'business',
      targetModel: 'claude-3-opus',
      outputFormat: 'json',
    }
  );

  console.log('Business Prompt Result:');
  console.log('Optimized:', businessResult.optimizedPrompt.substring(0, 150) + '...');
  console.log('Analysis Intent:', businessResult.analysis.intent);
  console.log('Complexity:', businessResult.analysis.complexity);
  console.log('Techniques Applied:', businessResult.optimization.techniques.join(', '));
  console.log('Quality Score:', businessResult.validation.qualityScore + '/10\n');

  // Example 6: Research mode demonstration
  console.log('6️⃣  Research mode demonstration...');
  const researchResult = await crafter.createPrompt({
    task: 'Conduct a comprehensive literature review on artificial intelligence ethics',
    domain: 'research',
    mode: 'research',
    context: 'Academic research paper for computer ethics journal',
    requirements: {
      include: ['peer-reviewed sources', 'methodology', 'ethical frameworks', 'case studies'],
      constraints: ['publications from 2019-2024', 'APA citation format'],
      exclude: ['blog posts', 'non-academic sources'],
    },
  });

  console.log('Research Prompt Result:');
  console.log('Generated:', researchResult.optimizedPrompt.substring(0, 150) + '...');
  console.log('Quality Score:', researchResult.validation.qualityScore + '/10');
  console.log('Recommendations:', researchResult.validation.recommendations.length);
  console.log('Benchmark Category:', researchResult.validation.benchmarkComparison.category);
  console.log('');

  // Performance summary
  console.log('📊 Performance Summary');
  console.log('==================');
  console.log('All operations completed successfully!');
  console.log(
    'Average response time: ~',
    Math.round((result1.responseTime + result2.responseTime) / 2),
    'ms'
  );
  console.log(
    'Average quality score: ~',
    Math.round(
      (result1.validation.qualityScore +
        result2.validation.qualityScore +
        businessResult.validation.qualityScore +
        researchResult.validation.qualityScore) /
        4
    ),
    '/10'
  );
}

// Run the demonstration
demonstrateAdvancedPromptCrafter().catch(console.error);
