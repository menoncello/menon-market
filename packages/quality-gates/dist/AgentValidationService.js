/**
 * Agent Validation Methods
 * Extracted from TestingFramework to reduce file length
 */
/**
 * Agent Validation Service
 */
export class AgentValidationService {
    /**
     * Validate agent structure
     */
    async validateAgentStructure(agent) {
        const startTime = Date.now();
        try {
            const missingFieldsResult = this.validateRequiredFields(agent);
            if (!missingFieldsResult.passed)
                return missingFieldsResult;
            const goalsResult = this.validateGoalsArray(agent);
            if (!goalsResult.passed)
                return goalsResult;
            const coreSkillsResult = this.validateCoreSkillsArray(agent);
            if (!coreSkillsResult.passed)
                return coreSkillsResult;
            return {
                testName: 'Agent Structure Validation',
                passed: true,
                duration: Date.now() - startTime,
                message: 'Agent structure is valid',
            };
        }
        catch (error) {
            return {
                testName: 'Agent Structure Validation',
                passed: false,
                duration: Date.now() - startTime,
                message: `Structure validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    /**
     * Validate agent role
     */
    async validateAgentRole(agent) {
        const startTime = Date.now();
        try {
            const validRolesResult = this.validateRoleValue(agent);
            if (!validRolesResult.passed)
                return validRolesResult;
            const roleMatchResult = this.validateRoleContentMatch(agent);
            if (!roleMatchResult.passed)
                return roleMatchResult;
            return {
                testName: 'Agent Role Validation',
                passed: true,
                duration: Date.now() - startTime,
                message: 'Agent role is valid',
            };
        }
        catch (error) {
            return {
                testName: 'Agent Role Validation',
                passed: false,
                duration: Date.now() - startTime,
                message: `Role validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    /**
     * Validate agent configuration
     */
    async validateAgentConfiguration(agent) {
        const startTime = Date.now();
        try {
            // Performance configuration validation
            const { maxExecutionTime, memoryLimit } = agent.configuration.performance;
            const { maxConcurrentTasks: _maxConcurrentTasks, priority: _priority } = agent.configuration.performance;
            if (maxExecutionTime <= 0 || maxExecutionTime > 600) {
                return {
                    testName: 'Agent Configuration Validation',
                    passed: false,
                    duration: Date.now() - startTime,
                    message: 'Max execution time must be between 1 and 600 seconds',
                };
            }
            if (memoryLimit <= 0 || memoryLimit > 8192) {
                return {
                    testName: 'Agent Configuration Validation',
                    passed: false,
                    duration: Date.now() - startTime,
                    message: 'Memory limit must be between 1 and 8192 MB',
                };
            }
            return {
                testName: 'Agent Configuration Validation',
                passed: true,
                duration: Date.now() - startTime,
                message: 'Agent configuration is valid',
            };
        }
        catch (error) {
            return {
                testName: 'Agent Configuration Validation',
                passed: false,
                duration: Date.now() - startTime,
                message: `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    /**
     * Validate agent performance
     */
    async validateAgentPerformance(agent) {
        const startTime = Date.now();
        try {
            const { maxExecutionTime, memoryLimit } = agent.configuration.performance;
            // Performance validation
            if (maxExecutionTime > 300) {
                return {
                    testName: 'Agent Performance Validation',
                    passed: false,
                    duration: Date.now() - startTime,
                    message: 'Max execution time exceeds recommended 300 seconds',
                };
            }
            if (memoryLimit > 4096) {
                return {
                    testName: 'Agent Performance Validation',
                    passed: false,
                    duration: Date.now() - startTime,
                    message: 'Memory limit exceeds recommended 4096 MB',
                };
            }
            return {
                testName: 'Agent Performance Validation',
                passed: true,
                duration: Date.now() - startTime,
                message: 'Agent performance configuration is valid',
            };
        }
        catch (error) {
            return {
                testName: 'Agent Performance Validation',
                passed: false,
                duration: Date.now() - startTime,
                message: `Performance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    /**
     * Validate agent generation from template
     */
    async validateAgentGeneration(template) {
        const startTime = Date.now();
        try {
            if (!template || typeof template !== 'object') {
                return {
                    testName: 'Agent Generation Validation',
                    passed: false,
                    duration: Date.now() - startTime,
                    message: 'Invalid template object',
                };
            }
            return {
                testName: 'Agent Generation Validation',
                passed: true,
                duration: Date.now() - startTime,
                message: 'Agent generation template is valid',
            };
        }
        catch (error) {
            return {
                testName: 'Agent Generation Validation',
                passed: false,
                duration: Date.now() - startTime,
                message: `Generation validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    /**
     * Validate required agent fields
     */
    validateRequiredFields(agent) {
        const requiredFields = [
            'id',
            'name',
            'description',
            'role',
            'goals',
            'backstory',
            'coreSkills',
            'learningMode',
            'configuration',
            'metadata',
        ];
        const missingFields = requiredFields.filter(field => !(field in agent));
        if (missingFields.length > 0) {
            return {
                testName: 'Agent Structure Validation',
                passed: false,
                duration: 0,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                details: { missingFields },
            };
        }
        return {
            testName: 'Agent Structure Validation',
            passed: true,
            duration: 0,
            message: 'Required fields present',
        };
    }
    /**
     * Validate goals array
     */
    validateGoalsArray(agent) {
        if (!Array.isArray(agent.goals) || agent.goals.length === 0) {
            return {
                testName: 'Agent Structure Validation',
                passed: false,
                duration: 0,
                message: 'Goals must be a non-empty array',
            };
        }
        return {
            testName: 'Agent Structure Validation',
            passed: true,
            duration: 0,
            message: 'Goals array valid',
        };
    }
    /**
     * Validate core skills array
     */
    validateCoreSkillsArray(agent) {
        if (!Array.isArray(agent.coreSkills) || agent.coreSkills.length < 5) {
            return {
                testName: 'Agent Structure Validation',
                passed: false,
                duration: 0,
                message: 'Core skills must be an array with at least 5 items',
            };
        }
        return {
            testName: 'Agent Structure Validation',
            passed: true,
            duration: 0,
            message: 'Core skills array valid',
        };
    }
    /**
     * Validate agent role value
     */
    validateRoleValue(agent) {
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
        if (!validRoles.includes(agent.role)) {
            return {
                testName: 'Agent Role Validation',
                passed: false,
                duration: 0,
                message: `Invalid role: ${agent.role}`,
                details: { validRoles },
            };
        }
        return {
            testName: 'Agent Role Validation',
            passed: true,
            duration: 0,
            message: 'Role value valid',
        };
    }
    /**
     * Validate agent content matches role expectations
     */
    validateRoleContentMatch(agent) {
        const roleRequirements = this.getRoleRequirements();
        const requirements = roleRequirements[agent.role];
        if (!requirements)
            return {
                testName: 'Agent Role Validation',
                passed: true,
                duration: 0,
                message: 'No requirements for role',
            };
        const agentText = this.getAgentText(agent);
        const matches = requirements.filter((req) => agentText.includes(req));
        if (matches.length < requirements.length * 0.6) {
            return {
                testName: 'Agent Role Validation',
                passed: false,
                duration: 0,
                message: `Agent content doesn't match role expectations`,
                details: { role: agent.role, requirements, matches },
            };
        }
        return {
            testName: 'Agent Role Validation',
            passed: true,
            duration: 0,
            message: 'Role content match valid',
        };
    }
    /**
     * Get role requirements mapping
     */
    getRoleRequirements() {
        return {
            FrontendDev: ['react', 'frontend', 'ui'],
            BackendDev: ['api', 'backend', 'server'],
            QA: ['testing', 'quality', 'automation'],
            Architect: ['architecture', 'design', 'system'],
            'CLI Dev': ['cli', 'tools', 'command'],
            'UX Expert': ['ux', 'design', 'user'],
            SM: ['scrum', 'agile', 'team'],
            Custom: ['custom', 'specialized'],
        };
    }
    /**
     * Get agent text for content matching
     */
    getAgentText(agent) {
        return `${agent.name} ${agent.description} ${agent.coreSkills.join(' ')}`.toLowerCase();
    }
}
//# sourceMappingURL=AgentValidationService.js.map