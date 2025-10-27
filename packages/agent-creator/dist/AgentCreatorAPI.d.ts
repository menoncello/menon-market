/**
 * Agent Creator API
 * RESTful API service for agent creation operations
 * Provides endpoints for creating, validating, and managing agents
 */
import { Request, Response } from 'express';
/**
 *
 */
export declare class AgentCreatorAPI {
    private agentCreationService;
    /**
     *
     */
    constructor();
    /**
     * Create a new agent
     * POST /api/v1/agents/create
     * @param req
     * @param res
     */
    createAgent(req: Request, res: Response): Promise<void>;
    /**
     * Get list of available predefined agents
     * GET /api/v1/agents/predefined
     * @param req
     * @param res
     */
    getPredefinedAgents(_req: Request, res: Response): Promise<void>;
    /**
     * Get list of available templates
     * GET /api/v1/agents/templates
     * @param req
     * @param res
     */
    getTemplates(_req: Request, res: Response): Promise<void>;
    /**
     * Get specific predefined agent by role
     * GET /api/v1/agents/predefined/:role
     * @param req
     * @param res
     */
    getPredefinedAgent(req: Request, res: Response): Promise<void>;
    /**
     * Get specific template by role
     * GET /api/v1/agents/templates/:role
     * @param req
     * @param res
     */
    getTemplate(req: Request, res: Response): Promise<void>;
    /**
     * Validate template customizations
     * POST /api/v1/agents/templates/:role/validate
     * @param req
     * @param res
     */
    validateTemplateCustomizations(req: Request, res: Response): Promise<void>;
    /**
     * Get performance metrics
     * GET /api/v1/agents/metrics
     * @param req
     * @param res
     */
    getPerformanceMetrics(_req: Request, res: Response): Promise<void>;
    /**
     * Health check endpoint
     * GET /api/v1/agents/health
     * @param req
     * @param res
     */
    healthCheck(_req: Request, res: Response): Promise<void>;
    /**
     * Check if a string is a valid agent role
     * @param role
     */
    private isValidAgentRole;
    /**
     * Check if performance metrics are healthy
     * @param metrics
     */
    private isPerformanceHealthy;
}
//# sourceMappingURL=AgentCreatorAPI.d.ts.map