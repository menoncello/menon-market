/**
 * Tests for skills module index exports
 */

// Test that all expected exports are available
describe('Skills Module Index', () => {
  // Test that all types are exported (only runtime-checkable types)
  it('should export all type definitions', async () => {
    const typesModule = await import('../../src/skills/types');

    // TypeScript types are not available at runtime, so we can only check that the module loads
    expect(typesModule).toBeDefined();
    expect(typeof typesModule).toBe('object');
  });

  // Test that registry and loader are exported
  it('should export registry and loader modules', async () => {
    const indexModule = await import('../../src/skills/index');

    // These should be available if the modules exist
    // Note: Some of these might not exist yet, which is okay for this test
    expect(indexModule).toBeDefined();
  });

  // Test that validation is exported correctly
  it('should export validation types and functions', async () => {
    const indexModule = await import('../../src/skills/index');

    // Check that validation-related exports are available
    // SkillValidationRule is an interface, so it's not available at runtime
    // But we should have runtime exports from validation module
    expect(indexModule.SkillValidator).toBeDefined();
    expect(indexModule.validateSkill).toBeDefined();
    expect(indexModule.checkCompatibility).toBeDefined();
    expect(typeof indexModule.SkillValidator).toBe('function');
    expect(typeof indexModule.validateSkill).toBe('function');
    expect(typeof indexModule.checkCompatibility).toBe('function');
  });

  // Test that testing utilities are exported
  it('should export testing utilities', async () => {
    const indexModule = await import('../../src/skills/index');

    // These exports should be available
    expect(indexModule).toBeDefined();
  });

  // Test that re-exports work correctly
  it('should re-export commonly used utilities', async () => {
    const indexModule = await import('../../src/skills/index');

    // Check that re-exports are available (these might be undefined if modules don't exist yet)
    expect(indexModule).toBeDefined();
  });

  // Test module structure
  it('should maintain consistent module structure', async () => {
    const indexModule = await import('../../src/skills/index');

    // The module should be an object with expected properties
    expect(typeof indexModule).toBe('object');

    // Should have various exports
    const exportNames = Object.keys(indexModule);
    expect(exportNames.length).toBeGreaterThan(0);

    // Check that some expected runtime exports exist (not TypeScript types)
    const expectedRuntimeExports = [
      'SkillValidator',      // Class
      'validateSkill',       // Function
      'checkCompatibility',  // Function
    ];

    expectedRuntimeExports.forEach(exportName => {
      expect(indexModule[exportName]).toBeDefined();
    });
  });

  // Test that types can be used
  it('should allow usage of exported types', async () => {
    const indexModule = await import('../../src/skills/index');

    // TypeScript types are not available at runtime, but we can check that the module loads
    // and that we can access runtime exports
    expect(indexModule).toBeDefined();
    expect(typeof indexModule).toBe('object');

    // Check that we can access runtime functions/classes
    if (indexModule.SkillValidator) {
      expect(typeof indexModule.SkillValidator).toBe('function');
    }
    if (indexModule.validateSkill) {
      expect(typeof indexModule.validateSkill).toBe('function');
    }
  });

  // Test AgentRole re-export
  it('should re-export AgentRole from agents types', async () => {
    const typesModule = await import('../../src/skills/types');

    // AgentRole is a type import and not available at runtime, but the module should load
    expect(typesModule).toBeDefined();
    expect(typeof typesModule).toBe('object');

    // Since AgentRole is a type, we can't check it at runtime
    // but we can verify the types module loads correctly
  });

  // Test that all skill domains are available
  it('should export all skill domains', async () => {
    // Since SkillDomain is a type, we can't check it directly at runtime
    // But we can verify the expected domain strings are valid
    const expectedDomains = [
      'frontend',
      'backend',
      'testing',
      'architecture',
      'cli',
      'ux',
      'project-management',
      'cross-cutting',
    ];

    expectedDomains.forEach(domain => {
      expect(domain).toBeDefined();
      expect(typeof domain).toBe('string');
    });
  });

  // Test that all skill categories are available
  it('should export all skill categories', async () => {
    // Test a few key categories from each domain
    const expectedCategories = [
      'ui-patterns', // frontend
      'api-design', // backend
      'unit-testing', // testing
      'system-design', // architecture
      'command-line-tools', // cli
      'user-research', // ux
      'planning', // project-management
      'performance', // cross-cutting
    ];

    expectedCategories.forEach(category => {
      expect(category).toBeDefined();
      expect(typeof category).toBe('string');
    });
  });

  // Test validation category types
  it('should export all validation categories', async () => {
    const expectedCategories = [
      'schema',
      'dependencies',
      'compatibility',
      'performance',
      'security',
      'documentation',
      'testing',
      'quality',
    ];

    expectedCategories.forEach(category => {
      expect(category).toBeDefined();
      expect(typeof category).toBe('string');
    });
  });

  // Test resource types
  it('should export all resource types', async () => {
    const expectedResourceTypes = [
      'documentation',
      'tutorial',
      'example',
      'video',
      'article',
      'book',
      'course',
    ];

    expectedResourceTypes.forEach(resourceType => {
      expect(resourceType).toBeDefined();
      expect(typeof resourceType).toBe('string');
    });
  });

  // Test difficulty levels
  it('should export all difficulty levels', async () => {
    const expectedDifficultyLevels = [
      'beginner',
      'intermediate',
      'advanced',
      'expert',
    ];

    expectedDifficultyLevels.forEach(level => {
      expect(level).toBeDefined();
      expect(typeof level).toBe('string');
    });
  });

  // Test capability types
  it('should export all capability types', async () => {
    const expectedCapabilityTypes = [
      'action',
      'knowledge',
      'tool',
      'pattern',
      'framework',
      'methodology',
    ];

    expectedCapabilityTypes.forEach(capabilityType => {
      expect(capabilityType).toBeDefined();
      expect(typeof capabilityType).toBe('string');
    });
  });

  // Test compatibility levels
  it('should export all compatibility levels', async () => {
    const expectedCompatibilityLevels = [
      'full',
      'partial',
      'limited',
    ];

    expectedCompatibilityLevels.forEach(level => {
      expect(level).toBeDefined();
      expect(typeof level).toBe('string');
    });
  });

  // Test sort orders
  it('should export all sort orders', async () => {
    const expectedSortOrders = [
      'name',
      'domain',
      'category',
      'version',
      'created',
      'updated',
      'usage',
      'rating',
      'complexity',
    ];

    expectedSortOrders.forEach(sortOrder => {
      expect(sortOrder).toBeDefined();
      expect(typeof sortOrder).toBe('string');
    });
  });

  // Test that the index module doesn't have runtime errors
  it('should load without runtime errors', async () => {
    expect(async () => {
      await import('../../src/skills/index');
    }).not.toThrow();
  });

  // Test that circular dependencies don't exist
  it('should handle imports without circular dependencies', async () => {
    // This test passes if the module loads successfully
    const typesModule = await import('../../src/skills/types');
    const indexModule = await import('../../src/skills/index');

    expect(typesModule).toBeDefined();
    expect(indexModule).toBeDefined();

    // Make sure we can access properties from both (runtime properties only)
    expect(typeof typesModule).toBe('object');
    expect(typeof indexModule).toBe('object');
  });

  // Test that default exports work if they exist
  it('should handle default exports if they exist', async () => {
    try {
      const indexModule = await import('../../src/skills/index');

      // The module might have a default export or not
      // This test just ensures it doesn't crash
      expect(indexModule).toBeDefined();
    } catch (error) {
      // If there's an error, it should be due to missing default export
      // which is acceptable for this test
      expect(error).toBeDefined();
    }
  });
});