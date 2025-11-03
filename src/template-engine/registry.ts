export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: 'deploy' | 'validate' | 'manage' | 'generate';
  templatePath: string;
  outputPath: string;
  requiredVars: string[];
  optionalVars: Record<string, any>;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'marketplace-deploy',
    name: 'Marketplace Deployment Script',
    description: 'Bun deployment script for marketplace plugins',
    category: 'deploy',
    templatePath: 'templates/deploy.hbs',
    outputPath: 'scripts/deploy.ts',
    requiredVars: ['PLUGIN_NAME', 'AUTHOR', 'VERSION'],
    optionalVars: {
      DATABASE_TYPE: 'sqlite',
      LOG_LEVEL: 'info',
    },
  },
  {
    id: 'marketplace-validate',
    name: 'Marketplace Validation Script',
    description: 'Bun validation script for plugin structure',
    category: 'validate',
    templatePath: 'templates/validate.hbs',
    outputPath: 'scripts/validate.ts',
    requiredVars: ['PLUGIN_NAME', 'VALIDATION_RULES'],
    optionalVars: {
      STRICT_MODE: true,
      AUTO_FIX: false,
      DESCRIPTION: 'Plugin validation script',
    },
  },
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(
  category: TemplateDefinition['category']
): TemplateDefinition[] {
  return TEMPLATES.filter(t => t.category === category);
}
