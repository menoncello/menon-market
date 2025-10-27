/**
 * Agent Creator API
 * RESTful API service for agent creation operations
 * Provides endpoints for creating, validating, and managing agents
 */
import { AgentCreationService } from './AgentCreationService';
/**
 *
 */
export class AgentCreatorAPI {
    agentCreationService;
    /**
     *
     */
    constructor() {
        this.agentCreationService = new AgentCreationService();
    }
    /**
     * Create a new agent
     * POST /api/v1/agents/create
     * @param req
     * @param res
     */
    async createAgent(req, res) {
        try {
            const createRequest = req.body;
            // Validate request structure
            if (!createRequest.definition && !createRequest.options) {
                res.status(400).json({
                    error: 'Invalid request: missing definition or options',
                    code: 'MISSING_REQUIRED_FIELDS',
                });
                return;
            }
            // Set default options if not provided
            if (!createRequest.options) {
                createRequest.options = {
                    skipValidation: false,
                    dryRun: false,
                    verbose: false,
                };
            }
            // Create the agent
            const result = await this.agentCreationService.createAgent(createRequest);
            if (result.success) {
                res.status(201).json({
                    success: true,
                    agent: result.agent,
                    metadata: result.metadata,
                    warnings: result.warnings,
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    error: result.errors?.join(', ') || 'Unknown error',
                    metadata: result.metadata,
                });
            }
        }
        catch (error) {
            console.error('Error in createAgent:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Get list of available predefined agents
     * GET /api/v1/agents/predefined
     * @param req
     * @param res
     */
    async getPredefinedAgents(_req, res) {
        try {
            const agents = this.agentCreationService.getAvailableAgents();
            res.status(200).json({
                success: true,
                agents: agents.map(agent => ({
                    id: agent.id,
                    name: agent.name,
                    role: agent.role,
                    description: agent.description,
                    coreSkills: agent.coreSkills,
                    learningMode: agent.learningMode,
                })),
                count: agents.length,
            });
        }
        catch (error) {
            console.error('Error in getPredefinedAgents:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Get list of available templates
     * GET /api/v1/agents/templates
     * @param req
     * @param res
     */
    async getTemplates(_req, res) {
        try {
            const templates = this.agentCreationService.getAvailableTemplates();
            res.status(200).json({
                success: true,
                templates: templates.map(template => ({
                    id: template.id,
                    name: template.name,
                    description: template.description,
                    baseRole: template.baseRole,
                    customizationOptions: template.customizationOptions.map(opt => ({
                        id: opt.id,
                        name: opt.name,
                        description: opt.description,
                        type: opt.type,
                        defaultValue: opt.defaultValue,
                        required: opt.required,
                    })),
                    usageCount: template.templateMetadata.usageCount,
                    averageRating: template.templateMetadata.averageRating,
                })),
                count: templates.length,
            });
        }
        catch (error) {
            console.error('Error in getTemplates:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Get specific predefined agent by role
     * GET /api/v1/agents/predefined/:role
     * @param req
     * @param res
     */
    async getPredefinedAgent(req, res) {
        try {
            const { role } = req.params;
            if (!role || !this.isValidAgentRole(role)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid agent role',
                    code: 'INVALID_ROLE',
                });
                return;
            }
            const agent = this.agentCreationService.getPredefinedAgent(role);
            if (!agent) {
                res.status(404).json({
                    success: false,
                    error: 'Agent not found',
                    code: 'AGENT_NOT_FOUND',
                });
                return;
            }
            res.status(200).json({
                success: true,
                agent,
            });
        }
        catch (error) {
            console.error('Error in getPredefinedAgent:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Get specific template by role
     * GET /api/v1/agents/templates/:role
     * @param req
     * @param res
     */
    async getTemplate(req, res) {
        try {
            const { role } = req.params;
            if (!role || !this.isValidAgentRole(role)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid agent role',
                    code: 'INVALID_ROLE',
                });
                return;
            }
            const template = this.agentCreationService.getTemplate(role);
            if (!template) {
                res.status(404).json({
                    success: false,
                    error: 'Template not found',
                    code: 'TEMPLATE_NOT_FOUND',
                });
                return;
            }
            res.status(200).json({
                success: true,
                template,
            });
        }
        catch (error) {
            console.error('Error in getTemplate:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Validate template customizations
     * POST /api/v1/agents/templates/:role/validate
     * @param req
     * @param res
     */
    async validateTemplateCustomizations(req, res) {
        try {
            const { role } = req.params;
            const { customizations } = req.body;
            if (!role || !this.isValidAgentRole(role)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid agent role',
                    code: 'INVALID_ROLE',
                });
                return;
            }
            if (!customizations || typeof customizations !== 'object') {
                res.status(400).json({
                    success: false,
                    error: 'Customizations object is required',
                    code: 'MISSING_CUSTOMIZATIONS',
                });
                return;
            }
            const validation = this.agentCreationService.validateTemplateCustomizations(role, customizations);
            res.status(200).json({
                success: true,
                valid: validation.valid,
                errors: validation.errors,
            });
        }
        catch (error) {
            console.error('Error in validateTemplateCustomizations:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Get performance metrics
     * GET /api/v1/agents/metrics
     * @param req
     * @param res
     */
    async getPerformanceMetrics(_req, res) {
        try {
            const metrics = this.agentCreationService.getPerformanceMetrics();
            res.status(200).json({
                success: true,
                metrics,
                healthy: this.isPerformanceHealthy(metrics),
            });
        }
        catch (error) {
            console.error('Error in getPerformanceMetrics:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Health check endpoint
     * GET /api/v1/agents/health
     * @param req
     * @param res
     */
    async healthCheck(_req, res) {
        try {
            const metrics = this.agentCreationService.getPerformanceMetrics();
            const healthy = this.isPerformanceHealthy(metrics);
            res.status(healthy ? 200 : 503).json({
                success: healthy,
                status: healthy ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                metrics: {
                    totalCreations: metrics.totalCreations,
                    averageCreationTime: metrics.averageCreationTime,
                    successRate: metrics.successRate,
                    performanceTargetMetRate: metrics.performanceTargetMetRate,
                },
            });
        }
        catch (error) {
            console.error('Error in healthCheck:', error);
            res.status(500).json({
                success: false,
                status: 'unhealthy',
                error: 'Health check failed',
            });
        }
    }
    /**
     * Check if a string is a valid agent role
     * @param role
     */
    isValidAgentRole(role) {
        const validRoles = [
            'FrontendDev',
            'BackendDev',
            'QA',
            'Architect',
            'CLI Dev',
            'UX Expert',
            'SM',
            'Custom',
        ];
        return validRoles.includes(role);
    }
    /**
     * Check if performance metrics are healthy
     * @param metrics
     */
    isPerformanceHealthy(metrics) {
        return (metrics.averageCreationTime < 30000 && // 30 seconds
            metrics.successRate > 90 && // 90% success rate
            metrics.performanceTargetMetRate > 80 // 80% target met rate
        );
    }
}
//# sourceMappingURL=AgentCreatorAPI.js.map