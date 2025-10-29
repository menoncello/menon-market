/**
 * Tests for skills types and interfaces
 */

import {
  SkillDefinition,
  SkillDomain,
  SkillCategory,
  SkillDependency,
  AgentCompatibility,
  CompatibilityLevel,
  SkillCapability,
  CapabilityType,
  CapabilityImplementation,
  SkillExample,
  SkillPerformance,
  SkillMetadata,
  SkillVersion,
  SkillResource,
  ResourceType,
  DifficultyLevel,
  SkillUsageStats,
  SkillQuality,
  QualityBadge,
  SkillRequest,
  SkillLoadOptions,
  SkillSearchCriteria,
  SkillSortOrder,
  SkillValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationCategory,
} from '../../src/skills/types';

describe('Skills Types', () => {
  describe('SkillDefinition', () => {
    it('should create a complete skill definition', () => {
      const skill: SkillDefinition = {
        id: 'react-component-creator',
        name: 'React Component Creator',
        description: 'Creates React components with TypeScript and modern best practices',
        domain: 'frontend',
        category: 'ui-patterns',
        version: '1.2.0',
        dependencies: [
          {
            skillId: 'typescript-expert',
            minVersion: '1.0.0',
            required: true,
            reason: 'Requires TypeScript knowledge for type-safe components',
          },
        ],
        compatibility: [
          {
            agentRole: 'FrontendDev',
            level: 'full',
            enhancements: ['Advanced React patterns', 'TypeScript integration'],
          },
          {
            agentRole: 'BackendDev',
            level: 'limited',
            restrictions: ['Limited to simple components'],
          },
        ],
        capabilities: [
          {
            id: 'create-component',
            name: 'Create React Component',
            description: 'Creates a new React component with props and state management',
            type: 'action',
            implementation: {
              approach: 'functional-component-with-hooks',
              tools: ['Read', 'Write', 'Edit'],
              parameters: {
                componentType: 'functional',
                useTypeScript: true,
              },
            },
            usage: ['Use for creating reusable UI components'],
          },
        ],
        examples: [
          {
            title: 'Creating a Button Component',
            scenario: 'Need to create a reusable button component for a form',
            steps: [
              'Define component interface with TypeScript',
              'Implement component with proper props',
              'Add styling with CSS modules',
              'Include accessibility attributes',
            ],
            code: ['interface ButtonProps { /* ... */ }', 'export const Button: React.FC<ButtonProps> = ({ /* ... */ }) => { /* ... */ };'],
            outcomes: ['Type-safe reusable button component', 'Consistent styling across the application'],
            relevantFor: ['FrontendDev'],
          },
        ],
        performance: {
          executionTime: {
            min: 5,
            max: 15,
            average: 10,
          },
          resourceUsage: {
            memory: 'low',
            cpu: 'low',
            network: 'none',
          },
          complexity: 'moderate',
          successRate: 95,
          knownIssues: ['May require manual refactoring for complex state management'],
        },
        metadata: {
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          author: 'React Team',
          versionHistory: [
            {
              version: '1.2.0',
              releasedAt: new Date('2024-01-15'),
              notes: 'Added TypeScript support and accessibility features',
              newFeatures: ['TypeScript interfaces', 'ARIA attributes'],
            },
          ],
          tags: ['react', 'typescript', 'components', 'frontend'],
          relatedSkills: {
            similar: ['vue-component-creator'],
            complementary: ['css-styling-expert', 'testing-strategies'],
            alternative: ['vanilla-js-component'],
          },
          resources: [
            {
              type: 'documentation',
              title: 'React Component Patterns',
              url: 'https://reactpatterns.com',
              description: 'Comprehensive guide to React component patterns',
              level: 'intermediate',
              estimatedTime: 120,
            },
          ],
          usage: {
            totalUses: 1250,
            uniqueAgents: 45,
            satisfactionRating: 4.7,
            commonUseCases: ['Form components', 'Navigation elements', 'Data display'],
            trend: 'increasing',
            lastUpdated: new Date('2024-01-15'),
          },
          quality: {
            testCoverage: 92,
            documentationScore: 88,
            openIssues: 3,
            communityRating: 4.8,
            lastAssessed: new Date('2024-01-10'),
            badges: [
              {
                id: 'production-ready',
                name: 'Production Ready',
                description: 'Tested and verified for production use',
                awardedAt: new Date('2024-01-10'),
                authority: 'Quality Team',
              },
            ],
          },
        },
        tags: ['react', 'components', 'typescript', 'ui'],
      };

      expect(skill.id).toBe('react-component-creator');
      expect(skill.domain).toBe('frontend');
      expect(skill.category).toBe('ui-patterns');
      expect(skill.dependencies).toHaveLength(1);
      expect(skill.compatibility).toHaveLength(2);
      expect(skill.capabilities).toHaveLength(1);
      expect(skill.examples).toHaveLength(1);
      expect(skill.performance.successRate).toBe(95);
      expect(skill.metadata.tags).toContain('react');
    });

    it('should handle minimal skill definition', () => {
      const minimalSkill: SkillDefinition = {
        id: 'minimal-skill',
        name: 'Minimal Skill',
        description: 'A minimal skill definition',
        domain: 'cross-cutting',
        category: 'performance',
        version: '1.0.0',
        dependencies: [],
        compatibility: [],
        capabilities: [],
        examples: [],
        performance: {
          executionTime: { min: 1, max: 5, average: 3 },
          resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
          complexity: 'simple',
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'Test Author',
          versionHistory: [],
          tags: [],
          relatedSkills: {},
          resources: [],
        },
        tags: [],
      };

      expect(minimalSkill.id).toBe('minimal-skill');
      expect(minimalSkill.dependencies).toEqual([]);
      expect(minimalSkill.capabilities).toEqual([]);
      expect(minimalSkill.examples).toEqual([]);
    });
  });

  describe('SkillDomain', () => {
    it('should support all defined domains', () => {
      const domains: SkillDomain[] = [
        'frontend',
        'backend',
        'testing',
        'architecture',
        'cli',
        'ux',
        'project-management',
        'cross-cutting',
      ];

      domains.forEach(domain => {
        expect(typeof domain).toBe('string');
      });
    });
  });

  describe('SkillCategory', () => {
    it('should support all defined categories', () => {
      const categories: SkillCategory[] = [
        'ui-patterns',
        'component-libraries',
        'styling',
        'state-management',
        'frontend-frameworks',
        'frontend-tools',
        'api-design',
        'databases',
        'authentication',
        'microservices',
        'cloud-services',
        'backend-frameworks',
        'unit-testing',
        'integration-testing',
        'e2e-testing',
        'performance-testing',
        'testing-frameworks',
        'system-design',
        'design-patterns',
        'scalability',
        'security',
        'architecture-patterns',
        'command-line-tools',
        'scripting',
        'automation',
        'cli-frameworks',
        'user-research',
        'interaction-design',
        'usability-testing',
        'design-systems',
        'planning',
        'tracking',
        'coordination',
        'documentation',
        'performance',
        'accessibility',
        'monitoring',
      ];

      categories.forEach(category => {
        expect(typeof category).toBe('string');
      });
    });
  });

  describe('SkillDependency', () => {
    it('should create skill dependency with all fields', () => {
      const dependency: SkillDependency = {
        skillId: 'typescript-expert',
        minVersion: '1.0.0',
        maxVersion: '2.0.0',
        required: true,
        reason: 'Required for type safety',
      };

      expect(dependency.skillId).toBe('typescript-expert');
      expect(dependency.minVersion).toBe('1.0.0');
      expect(dependency.maxVersion).toBe('2.0.0');
      expect(dependency.required).toBe(true);
      expect(dependency.reason).toBe('Required for type safety');
    });

    it('should create optional dependency', () => {
      const optionalDependency: SkillDependency = {
        skillId: 'css-styling',
        required: false,
        reason: 'Enhances visual output but not required',
      };

      expect(optionalDependency.required).toBe(false);
      expect(optionalDependency.minVersion).toBeUndefined();
      expect(optionalDependency.maxVersion).toBeUndefined();
    });
  });

  describe('AgentCompatibility', () => {
    it('should create compatibility with full level', () => {
      const compatibility: AgentCompatibility = {
        agentRole: 'FrontendDev',
        level: 'full',
        restrictions: [],
        enhancements: ['Advanced patterns', 'TypeScript support'],
      };

      expect(compatibility.agentRole).toBe('FrontendDev');
      expect(compatibility.level).toBe('full');
      expect(compatibility.restrictions).toEqual([]);
      expect(compatibility.enhancements).toHaveLength(2);
    });

    it('should create compatibility with restrictions', () => {
      const limitedCompatibility: AgentCompatibility = {
        agentRole: 'BackendDev',
        level: 'limited',
        restrictions: ['No state management', 'Simple components only'],
      };

      expect(limitedCompatibility.level).toBe('limited');
      expect(limitedCompatibility.restrictions).toHaveLength(2);
      expect(limitedCompatibility.enhancements).toBeUndefined();
    });
  });

  describe('SkillCapability', () => {
    it('should create comprehensive capability', () => {
      const capability: SkillCapability = {
        id: 'generate-typescript-interfaces',
        name: 'Generate TypeScript Interfaces',
        description: 'Automatically generates TypeScript interfaces from data structures',
        type: 'action',
        implementation: {
          approach: 'static-analysis',
          tools: ['Read', 'Write', 'Edit'],
          parameters: {
            outputFormat: 'typescript',
            includeComments: true,
          },
          performance: {
            complexity: 'medium',
            resourceUsage: 'low',
          },
        },
        usage: [
          'Use when converting JavaScript to TypeScript',
          'Use for API response type definitions',
        ],
      };

      expect(capability.id).toBe('generate-typescript-interfaces');
      expect(capability.type).toBe('action');
      expect(capability.implementation?.approach).toBe('static-analysis');
      expect(capability.implementation?.parameters?.outputFormat).toBe('typescript');
      expect(capability.usage).toHaveLength(2);
    });

    it('should create simple capability', () => {
      const simpleCapability: SkillCapability = {
        id: 'basic-knowledge',
        name: 'Basic Knowledge',
        description: 'Provides basic knowledge about a topic',
        type: 'knowledge',
      };

      expect(simpleCapability.type).toBe('knowledge');
      expect(simpleCapability.implementation).toBeUndefined();
      expect(simpleCapability.usage).toBeUndefined();
    });
  });

  describe('SkillExample', () => {
    it('should create detailed example', () => {
      const example: SkillExample = {
        title: 'Creating a Form Component',
        scenario: 'Need to create a contact form with validation',
        steps: [
          'Define form interface with TypeScript',
          'Create form component with state',
          'Add validation logic',
          'Implement form submission',
          'Add error handling and loading states',
        ],
        code: [
          'interface ContactForm { name: string; email: string; message: string; }',
          'const ContactForm: React.FC = () => { /* form implementation */ };',
        ],
        outcomes: ['Type-safe form component', 'Client-side validation', 'Error handling'],
        relevantFor: ['FrontendDev', 'UX Expert'],
      };

      expect(example.title).toBe('Creating a Form Component');
      expect(example.steps).toHaveLength(5);
      expect(example.code).toHaveLength(2);
      expect(example.outcomes).toHaveLength(3);
      expect(example.relevantFor).toHaveLength(2);
    });
  });

  describe('SkillPerformance', () => {
    it('should create performance characteristics', () => {
      const performance: SkillPerformance = {
        executionTime: {
          min: 2,
          max: 10,
          average: 6,
        },
        resourceUsage: {
          memory: 'medium',
          cpu: 'medium',
          network: 'low',
        },
        complexity: 'complex',
        successRate: 88,
        knownIssues: ['May struggle with very large datasets'],
      };

      expect(performance.executionTime.min).toBe(2);
      expect(performance.executionTime.max).toBe(10);
      expect(performance.resourceUsage.memory).toBe('medium');
      expect(performance.complexity).toBe('complex');
      expect(performance.successRate).toBe(88);
      expect(performance.knownIssues).toHaveLength(1);
    });
  });

  describe('SkillMetadata', () => {
    it('should create comprehensive metadata', () => {
      const metadata: SkillMetadata = {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        author: 'Development Team',
        versionHistory: [
          {
            version: '1.0.0',
            releasedAt: new Date('2024-01-01'),
            notes: 'Initial release',
            newFeatures: ['Basic functionality'],
          },
          {
            version: '1.1.0',
            releasedAt: new Date('2024-01-15'),
            notes: 'Added advanced features',
            newFeatures: ['Advanced patterns', 'Performance improvements'],
            breakingChanges: ['Updated API'],
          },
        ],
        tags: ['frontend', 'react', 'typescript'],
        relatedSkills: {
          similar: ['vue-patterns'],
          complementary: ['css-styling', 'testing-frameworks'],
          alternative: ['vanilla-js-patterns'],
        },
        resources: [
          {
            type: 'tutorial',
            title: 'Getting Started Guide',
            description: 'Step-by-step tutorial for beginners',
            level: 'beginner',
            estimatedTime: 60,
          },
        ],
        usage: {
          totalUses: 500,
          uniqueAgents: 25,
          satisfactionRating: 4.5,
          commonUseCases: ['Component creation', 'Pattern implementation'],
          trend: 'stable',
          lastUpdated: new Date('2024-01-15'),
        },
        quality: {
          testCoverage: 85,
          documentationScore: 90,
          openIssues: 2,
          communityRating: 4.6,
          lastAssessed: new Date('2024-01-10'),
          badges: [
            {
              id: 'well-tested',
              name: 'Well Tested',
              description: 'High test coverage',
              awardedAt: new Date('2024-01-10'),
              authority: 'QA Team',
            },
          ],
        },
      };

      expect(metadata.author).toBe('Development Team');
      expect(metadata.versionHistory).toHaveLength(2);
      expect(metadata.relatedSkills.similar).toContain('vue-patterns');
      expect(metadata.resources).toHaveLength(1);
      expect(metadata.usage?.totalUses).toBe(500);
      expect(metadata.quality?.testCoverage).toBe(85);
    });
  });

  describe('SkillSearchCriteria', () => {
    it('should create comprehensive search criteria', () => {
      const criteria: SkillSearchCriteria = {
        query: 'React component',
        domain: 'frontend',
        category: 'ui-patterns',
        agentRole: 'FrontendDev',
        compatibilityLevel: 'full',
        tags: ['react', 'typescript'],
        complexity: 'moderate',
        limit: 10,
        sortBy: 'rating',
      };

      expect(criteria.query).toBe('React component');
      expect(criteria.domain).toBe('frontend');
      expect(criteria.compatibilityLevel).toBe('full');
      expect(criteria.limit).toBe(10);
      expect(criteria.sortBy).toBe('rating');
    });

    it('should create minimal search criteria', () => {
      const minimalCriteria: SkillSearchCriteria = {
        query: 'test',
      };

      expect(minimalCriteria.query).toBe('test');
      expect(minimalCriteria.domain).toBeUndefined();
      expect(minimalCriteria.limit).toBeUndefined();
    });
  });

  describe('SkillValidationResult', () => {
    it('should create validation result with errors and warnings', () => {
      const validationResult: SkillValidationResult = {
        valid: false,
        errors: [
          {
            category: 'schema',
            message: 'Missing required field: version',
            severity: 'error',
            location: 'skillDefinition.version',
            suggestion: 'Add a semantic version number',
          },
        ],
        warnings: [
          {
            category: 'documentation',
            message: 'Description could be more detailed',
            severity: 'warning',
            location: 'skillDefinition.description',
            suggestion: 'Add more examples and use cases',
          },
        ],
        score: 65,
        validatedAt: new Date('2024-01-15'),
      };

      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toHaveLength(1);
      expect(validationResult.warnings).toHaveLength(1);
      expect(validationResult.score).toBe(65);
      expect(validationResult.errors[0].category).toBe('schema');
      expect(validationResult.warnings[0].severity).toBe('warning');
    });

    it('should create successful validation result', () => {
      const successfulValidation: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 95,
        validatedAt: new Date(),
      };

      expect(successfulValidation.valid).toBe(true);
      expect(successfulValidation.errors).toEqual([]);
      expect(successfulValidation.warnings).toEqual([]);
      expect(successfulValidation.score).toBe(95);
    });
  });

  describe('SkillRequest and LoadOptions', () => {
    it('should create skill request with options', () => {
      const request: SkillRequest = {
        identifier: 'react-component-creator',
        options: {
          force: true,
          loadDependencies: true,
          skipValidation: false,
          config: {
            enableTypeScript: true,
            outputDirectory: './src/components',
          },
        },
      };

      expect(request.identifier).toBe('react-component-creator');
      expect(request.options.force).toBe(true);
      expect(request.options.loadDependencies).toBe(true);
      expect(request.options.skipValidation).toBe(false);
      expect(request.options.config?.enableTypeScript).toBe(true);
    });

    it('should create skill request with minimal options', () => {
      const minimalRequest: SkillRequest = {
        identifier: 'basic-skill',
        options: {},
      };

      expect(minimalRequest.options.force).toBeUndefined();
      expect(minimalRequest.options.loadDependencies).toBeUndefined();
    });
  });

  describe('Type Compatibility', () => {
    it('should ensure compatibility between related types', () => {
      const resourceType: ResourceType = 'tutorial';
      const difficultyLevel: DifficultyLevel = 'intermediate';
      const compatibilityLevel: CompatibilityLevel = 'partial';
      const capabilityType: CapabilityType = 'framework';
      const sortOrder: SkillSortOrder = 'name';

      expect(typeof resourceType).toBe('string');
      expect(typeof difficultyLevel).toBe('string');
      expect(typeof compatibilityLevel).toBe('string');
      expect(typeof capabilityType).toBe('string');
      expect(typeof sortOrder).toBe('string');
    });

    it('should handle validation warning as error subtype', () => {
      const warning: ValidationWarning = {
        category: 'documentation',
        message: 'Could be better documented',
        severity: 'warning',
        suggestion: 'Add more examples',
      };

      expect(warning.severity).toBe('warning');
      // ValidationWarning extends ValidationError, so it should have all properties
      expect(warning.category).toBe('documentation');
      expect(warning.message).toBe('Could be better documented');
    });

    it('should handle all validation categories', () => {
      const categories: ValidationCategory[] = [
        'schema',
        'dependencies',
        'compatibility',
        'performance',
        'security',
        'documentation',
        'testing',
        'quality',
      ];

      categories.forEach(category => {
        expect(typeof category).toBe('string');
      });
    });
  });

  describe('Complex Nested Types', () => {
    it('should handle deeply nested skill definition', () => {
      const complexSkill: SkillDefinition = {
        id: 'complex-skill',
        name: 'Complex Skill',
        description: 'A skill with complex nested structures',
        domain: 'architecture',
        category: 'system-design',
        version: '2.1.0',
        dependencies: [
          {
            skillId: 'dependency-1',
            required: true,
            reason: 'Required for core functionality',
          },
          {
            skillId: 'dependency-2',
            required: false,
            reason: 'Optional enhancement',
          },
        ],
        compatibility: [
          {
            agentRole: 'Architect',
            level: 'full',
            enhancements: ['Advanced patterns', 'Performance optimization'],
          },
        ],
        capabilities: [
          {
            id: 'complex-action',
            name: 'Complex Action',
            description: 'Performs complex operations',
            type: 'action',
            implementation: {
              approach: 'multi-step',
              tools: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch'],
              parameters: {
                step1: 'analyze',
                step2: 'implement',
                step3: 'validate',
              },
              performance: {
                complexity: 'high',
                resourceUsage: 'medium',
              },
            },
          },
        ],
        examples: [
          {
            title: 'Complex Example',
            scenario: 'Complex scenario requiring multiple steps',
            steps: ['Step 1', 'Step 2', 'Step 3'],
            outcomes: ['Outcome 1', 'Outcome 2'],
            relevantFor: ['Architect', 'Senior Developer'],
          },
        ],
        performance: {
          executionTime: { min: 10, max: 60, average: 30 },
          resourceUsage: { memory: 'high', cpu: 'high', network: 'medium' },
          complexity: 'expert',
          successRate: 92,
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'Expert Team',
          versionHistory: [
            {
              version: '2.1.0',
              releasedAt: new Date(),
              notes: 'Latest version',
              newFeatures: ['Feature A', 'Feature B'],
              breakingChanges: ['Change X'],
            },
          ],
          tags: ['complex', 'architecture', 'advanced'],
          relatedSkills: {
            similar: ['similar-skill'],
            complementary: ['complementary-skill'],
            alternative: ['alternative-skill'],
          },
          resources: [
            {
              type: 'documentation',
              title: 'Advanced Guide',
              description: 'For advanced users',
              level: 'expert',
              estimatedTime: 180,
            },
          ],
          usage: {
            totalUses: 100,
            uniqueAgents: 10,
            satisfactionRating: 4.8,
            commonUseCases: ['Complex systems', 'Large projects'],
            trend: 'increasing',
            lastUpdated: new Date(),
          },
          quality: {
            testCoverage: 95,
            documentationScore: 92,
            openIssues: 1,
            communityRating: 4.9,
            lastAssessed: new Date(),
            badges: [
              {
                id: 'expert-level',
                name: 'Expert Level',
                description: 'For expert users only',
                awardedAt: new Date(),
                authority: 'Expert Panel',
              },
            ],
          },
        },
        tags: ['complex', 'expert'],
      };

      // Verify all nested properties are accessible
      expect(complexSkill.dependencies).toHaveLength(2);
      expect(complexSkill.compatibility[0].enhancements).toHaveLength(2);
      expect(complexSkill.capabilities[0].implementation?.tools).toHaveLength(5);
      expect(complexSkill.metadata.relatedSkills.similar).toHaveLength(1);
      expect(complexSkill.metadata.quality?.badges).toHaveLength(1);
    });
  });
});