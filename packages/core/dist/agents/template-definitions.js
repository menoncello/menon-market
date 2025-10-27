/**
 * Agent configuration templates for the ClaudeCode SuperPlugin ecosystem
 * Provides customizable templates for each predefined agent type with validation and customization options
 */
/**
 * Frontend Development Agent Template
 */
export const FrontendDevTemplate = {
    id: 'frontend-dev-template',
    name: 'Frontend Development Agent Template',
    description: 'Customizable template for creating frontend development specialists with expertise in modern web technologies',
    baseRole: 'FrontendDev',
    template: {
        name: '{{name}}', // Will be filled by TemplateEngine
        description: '{{description}}', // Will be filled by TemplateEngine
        role: 'FrontendDev',
        goals: [
            'Build responsive and accessible user interfaces',
            'Implement component-based architectures',
            'Optimize frontend performance and user experience',
            'Ensure cross-browser compatibility and mobile responsiveness',
            'Apply modern frontend best practices and patterns',
        ],
        backstory: '{{backstory}}', // Will be filled by TemplateEngine
        coreSkills: [
            'React/Next.js development',
            'TypeScript and modern JavaScript',
            'CSS-in-JS and component styling',
            'State management (Redux, Zustand, Context)',
            'Frontend testing (Jest, React Testing Library)',
            'Web accessibility (WCAG standards)',
            'Performance optimization',
            'Build tools and bundling (Vite, Webpack)',
            'Progressive Web Apps (PWA)',
            'Cross-browser debugging',
        ],
        learningMode: 'adaptive',
        configuration: {
            performance: {
                maxExecutionTime: 45,
                memoryLimit: 512,
                maxConcurrentTasks: 3,
                priority: 7,
            },
            capabilities: {
                allowedTools: [
                    'Read',
                    'Write',
                    'Edit',
                    'Glob',
                    'Grep',
                    'Bash',
                    'WebFetch',
                    'WebSearch',
                    'mcp__zai-mcp-server__analyze_image',
                ],
                fileSystemAccess: {
                    read: true,
                    write: true,
                    execute: false,
                    allowedPaths: ['/tmp', '/Users/menoncello/repos/ai/menon-market'],
                },
                networkAccess: {
                    http: true,
                    https: true,
                    externalApis: false,
                    allowedDomains: [],
                },
                agentIntegration: true,
            },
            communication: {
                style: 'detailed',
                responseFormat: 'structured',
                collaboration: {
                    enabled: true,
                    roles: ['implementer', 'reviewer', 'leader'],
                    conflictResolution: 'collaborative',
                },
            },
        },
    },
    customizationOptions: [
        {
            id: 'name',
            name: 'Agent Name',
            description: 'Custom name for the frontend development agent',
            type: 'string',
            defaultValue: 'Frontend Development Specialist',
            required: true,
            validation: [
                {
                    type: 'min',
                    params: { length: 3 },
                    message: 'Agent name must be at least 3 characters long',
                },
                {
                    type: 'max',
                    params: { length: 100 },
                    message: 'Agent name must not exceed 100 characters',
                },
            ],
        },
        {
            id: 'description',
            name: 'Description',
            description: "Detailed description of the agent's capabilities and focus",
            type: 'string',
            defaultValue: 'Expert in modern frontend development, specializing in React, TypeScript, component architecture, and user interface implementation.',
            required: true,
            validation: [
                {
                    type: 'min',
                    params: { length: 20 },
                    message: 'Description must be at least 20 characters long',
                },
            ],
        },
        {
            id: 'backstory',
            name: 'Backstory',
            description: 'Personal background and experience narrative',
            type: 'string',
            defaultValue: 'I am a senior frontend developer with extensive experience in modern JavaScript frameworks and component-based architectures.',
            required: true,
        },
        {
            id: 'maxExecutionTime',
            name: 'Max Execution Time (seconds)',
            description: 'Maximum time for completing individual tasks',
            type: 'number',
            defaultValue: 45,
            required: true,
            validation: [
                {
                    type: 'min',
                    params: { value: 10 },
                    message: 'Execution time must be at least 10 seconds',
                },
                {
                    type: 'max',
                    params: { value: 300 },
                    message: 'Execution time must not exceed 300 seconds',
                },
            ],
        },
        {
            id: 'memoryLimit',
            name: 'Memory Limit (MB)',
            description: 'Maximum memory usage in megabytes',
            type: 'number',
            defaultValue: 512,
            required: true,
            validation: [
                {
                    type: 'min',
                    params: { value: 128 },
                    message: 'Memory limit must be at least 128 MB',
                },
                {
                    type: 'max',
                    params: { value: 4096 },
                    message: 'Memory limit must not exceed 4096 MB',
                },
            ],
        },
        {
            id: 'communicationStyle',
            name: 'Communication Style',
            description: 'Preferred communication style',
            type: 'string',
            defaultValue: 'technical',
            required: true,
            validation: [
                {
                    type: 'enum',
                    params: {
                        values: ['formal', 'casual', 'technical', 'educational', 'concise', 'detailed'],
                    },
                    message: 'Communication style must be one of: formal, casual, technical, educational, concise, detailed',
                },
            ],
        },
    ],
    templateMetadata: {
        createdAt: new Date('2025-10-26'),
        author: 'Eduardo Menoncello',
        version: '1.0.0',
        usageCount: 0,
        averageRating: 0,
    },
};
/**
 * Backend Development Agent Template
 */
export const BackendDevTemplate = {
    id: 'backend-dev-template',
    name: 'Backend Development Agent Template',
    description: 'Customizable template for creating backend development specialists with expertise in server-side technologies and architecture',
    baseRole: 'BackendDev',
    template: {
        name: '{{name}}', // Will be filled by TemplateEngine
        description: '{{description}}', // Will be filled by TemplateEngine
        role: 'BackendDev',
        goals: [
            'Design and implement scalable APIs',
            'Build secure and efficient database schemas',
            'Ensure system reliability and performance',
            'Implement proper authentication and authorization',
            'Apply backend development best practices',
        ],
        backstory: '{{backstory}}', // Will be filled by TemplateEngine
        coreSkills: [
            'Node.js/Express/NestJS development',
            'RESTful API design and GraphQL',
            'Database design (SQL and NoSQL)',
            'Authentication and authorization systems',
            'Microservices architecture',
            'Cloud services (AWS, GCP, Azure)',
            'Message queues and event streaming',
            'Caching strategies',
            'API testing and documentation',
            'DevOps and CI/CD pipelines',
        ],
        learningMode: 'adaptive',
        configuration: {
            performance: {
                maxExecutionTime: 45,
                memoryLimit: 512,
                maxConcurrentTasks: 3,
                priority: 7,
            },
            capabilities: {
                allowedTools: [
                    'Read',
                    'Write',
                    'Edit',
                    'Glob',
                    'Grep',
                    'Bash',
                    'WebFetch',
                    'WebSearch',
                    'Task',
                ],
                fileSystemAccess: {
                    read: true,
                    write: true,
                    execute: true,
                    allowedPaths: ['/tmp', '/Users/menoncello/repos/ai/menon-market'],
                },
                networkAccess: {
                    http: true,
                    https: true,
                    externalApis: false,
                    allowedDomains: [],
                },
                agentIntegration: true,
            },
            communication: {
                style: 'detailed',
                responseFormat: 'structured',
                collaboration: {
                    enabled: true,
                    roles: ['implementer', 'reviewer', 'leader'],
                    conflictResolution: 'collaborative',
                },
            },
        },
    },
    customizationOptions: [
        {
            id: 'name',
            name: 'Agent Name',
            description: 'Custom name for the backend development agent',
            type: 'string',
            defaultValue: 'Backend Development Specialist',
            required: true,
            validation: [
                {
                    type: 'min',
                    params: { length: 3 },
                    message: 'Agent name must be at least 3 characters long',
                },
            ],
        },
        {
            id: 'description',
            name: 'Description',
            description: "Detailed description of the agent's capabilities and focus",
            type: 'string',
            defaultValue: 'Expert in server-side development, API design, database architecture, and system integration.',
            required: true,
        },
        {
            id: 'backstory',
            name: 'Backstory',
            description: 'Personal background and experience narrative',
            type: 'string',
            defaultValue: 'I am a seasoned backend developer with deep expertise in distributed systems, API design, and database optimization.',
            required: true,
        },
        {
            id: 'maxExecutionTime',
            name: 'Max Execution Time (seconds)',
            description: 'Maximum time for completing individual tasks',
            type: 'number',
            defaultValue: 60,
            required: true,
            validation: [
                {
                    type: 'min',
                    params: { value: 15 },
                    message: 'Execution time must be at least 15 seconds',
                },
                {
                    type: 'max',
                    params: { value: 600 },
                    message: 'Execution time must not exceed 600 seconds',
                },
            ],
        },
    ],
    templateMetadata: {
        createdAt: new Date('2025-10-26'),
        author: 'Eduardo Menoncello',
        version: '1.0.0',
        usageCount: 0,
        averageRating: 0,
    },
};
//# sourceMappingURL=template-definitions.js.map