/**
 * Performance Monitor
 * Tracks agent creation performance metrics and ensures <30 second targets
 */
export interface PerformanceMetrics {
    totalCreations: number;
    averageCreationTime: number;
    fastestCreation: number;
    slowestCreation: number;
    successRate: number;
    performanceTargetMetRate: number;
    recentCreations: CreationMetric[];
}
export interface CreationMetric {
    timestamp: Date;
    duration: number;
    success: boolean;
    targetMet: boolean;
    agentType?: string;
    error?: string;
}
/**
 *
 */
export declare class PerformanceMonitor {
    private metrics;
    private readonly MAX_RECENT_CREATIONS;
    /**
     *
     */
    constructor();
    /**
     * Record agent creation performance
     * @param metric
     */
    recordCreation(metric: CreationMetric): void;
    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Check if performance is within acceptable ranges
     */
    isPerformanceHealthy(): boolean;
    /**
     * Get performance recommendations
     */
    getRecommendations(): string[];
    /**
     * Get performance metrics by agent type
     */
    getAgentTypePerformance(): Record<string, {
        averageTime: number;
        count: number;
        successRate: number;
    }>;
    /**
     * Reset all metrics
     */
    resetMetrics(): void;
    /**
     * Export metrics for analysis
     */
    exportMetrics(): string;
    /**
     *
     */
    private updateAverageCreationTime;
    /**
     *
     */
    private updateSuccessRate;
    /**
     *
     */
    private updatePerformanceTargetRate;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map