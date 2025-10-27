/**
 * Metadata service for handling task execution metadata
 */
import { TaskExecutionMetadata, MetadataParams } from './types';
export declare class MetadataService {
    private registeredAgents;
    constructor(registeredAgents: Map<string, any>);
    /**
     * Create metadata from parameter object
     * @param params
     */
    createMetadata(params: MetadataParams): TaskExecutionMetadata;
    /**
     * Create basic metadata
     */
    private createBasicMetadata;
    /**
     * Update metadata with execution results
     */
    private updateMetadataWithResults;
}
//# sourceMappingURL=MetadataService.d.ts.map