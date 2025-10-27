/**
 * Metadata service for handling task execution metadata
 */
export class MetadataService {
    registeredAgents;
    constructor(registeredAgents) {
        this.registeredAgents = registeredAgents;
    }
    /**
     * Create metadata from parameter object
     * @param params
     */
    createMetadata(params) {
        const basicMetadata = this.createBasicMetadata(params.agentId, params.startTime, params.endTime);
        return this.updateMetadataWithResults(basicMetadata, params.completedOnTime, params.toolsUsed, params.toolInvocations, params.collaborationUsed, params.confidence);
    }
    /**
     * Create basic metadata
     */
    createBasicMetadata(agentId, startTime, endTime) {
        return {
            agentId,
            agentRole: this.registeredAgents.get(agentId)?.role || 'Unknown',
            startTime,
            endTime,
            duration: endTime.getTime() - startTime.getTime(),
            completedOnTime: false,
            toolsUsed: [],
            toolInvocations: 0,
            collaborationUsed: false,
            confidence: 0,
        };
    }
    /**
     * Update metadata with execution results
     */
    updateMetadataWithResults(metadata, completedOnTime, toolsUsed, toolInvocations, collaborationUsed, confidence) {
        return {
            ...metadata,
            completedOnTime,
            toolsUsed,
            toolInvocations,
            collaborationUsed,
            confidence,
        };
    }
}
//# sourceMappingURL=MetadataService.js.map