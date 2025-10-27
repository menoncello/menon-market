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

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private readonly MAX_RECENT_CREATIONS = 100;

  constructor() {
    this.metrics = {
      totalCreations: 0,
      averageCreationTime: 0,
      fastestCreation: Infinity,
      slowestCreation: 0,
      successRate: 100,
      performanceTargetMetRate: 100,
      recentCreations: []
    };
  }

  /**
   * Record agent creation performance
   */
  recordCreation(metric: CreationMetric): void {
    this.metrics.totalCreations++;
    this.metrics.recentCreations.push(metric);

    // Keep only recent creations
    if (this.metrics.recentCreations.length > this.MAX_RECENT_CREATIONS) {
      this.metrics.recentCreations.shift();
    }

    // Update timing metrics
    this.metrics.fastestCreation = Math.min(this.metrics.fastestCreation, metric.duration);
    this.metrics.slowestCreation = Math.max(this.metrics.slowestCreation, metric.duration);

    // Recalculate average
    this.updateAverageCreationTime();

    // Update success rate
    this.updateSuccessRate();

    // Update performance target rate
    this.updatePerformanceTargetRate();
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if performance is within acceptable ranges
   */
  isPerformanceHealthy(): boolean {
    return (
      this.metrics.averageCreationTime < 30000 && // 30 seconds
      this.metrics.successRate > 90 && // 90% success rate
      this.metrics.performanceTargetMetRate > 80 // 80% target met rate
    );
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.averageCreationTime > 25000) {
      recommendations.push('Average creation time is approaching the 30-second target');
    }

    if (this.metrics.successRate < 95) {
      recommendations.push('Success rate is below 95% - review error patterns');
    }

    if (this.metrics.performanceTargetMetRate < 85) {
      recommendations.push('Performance target met rate is low - optimize creation process');
    }

    // Check for specific patterns in recent failures
    const recentFailures = this.metrics.recentCreations.filter(m => !m.success);
    if (recentFailures.length > 5) {
      recommendations.push('High number of recent failures - review validation logic');
    }

    // Check for specific agent types with poor performance
    const agentTypePerformance = this.getAgentTypePerformance();
    for (const [agentType, metrics] of Object.entries(agentTypePerformance)) {
      if (metrics.averageTime > 30000) {
        recommendations.push(`${agentType} agents are exceeding performance targets`);
      }
    }

    return recommendations;
  }

  /**
   * Get performance metrics by agent type
   */
  getAgentTypePerformance(): Record<string, { averageTime: number; count: number; successRate: number }> {
    const agentTypeMetrics: Record<string, CreationMetric[]> = {};

    // Group by agent type
    for (const metric of this.metrics.recentCreations) {
      const type = metric.agentType || 'Unknown';
      if (!agentTypeMetrics[type]) {
        agentTypeMetrics[type] = [];
      }
      agentTypeMetrics[type].push(metric);
    }

    // Calculate metrics for each type
    const result: Record<string, { averageTime: number; count: number; successRate: number }> = {};

    for (const [agentType, metrics] of Object.entries(agentTypeMetrics)) {
      const totalTime = metrics.reduce((sum, m) => sum + m.duration, 0);
      const successCount = metrics.filter(m => m.success).length;

      result[agentType] = {
        averageTime: totalTime / metrics.length,
        count: metrics.length,
        successRate: (successCount / metrics.length) * 100
      };
    }

    return result;
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalCreations: 0,
      averageCreationTime: 0,
      fastestCreation: Infinity,
      slowestCreation: 0,
      successRate: 100,
      performanceTargetMetRate: 100,
      recentCreations: []
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      agentTypePerformance: this.getAgentTypePerformance(),
      healthy: this.isPerformanceHealthy(),
      recommendations: this.getRecommendations()
    }, null, 2);
  }

  private updateAverageCreationTime(): void {
    if (this.metrics.recentCreations.length === 0) {
      this.metrics.averageCreationTime = 0;
      return;
    }

    const totalTime = this.metrics.recentCreations.reduce((sum, m) => sum + m.duration, 0);
    this.metrics.averageCreationTime = totalTime / this.metrics.recentCreations.length;
  }

  private updateSuccessRate(): void {
    if (this.metrics.recentCreations.length === 0) {
      this.metrics.successRate = 100;
      return;
    }

    const successCount = this.metrics.recentCreations.filter(m => m.success).length;
    this.metrics.successRate = (successCount / this.metrics.recentCreations.length) * 100;
  }

  private updatePerformanceTargetRate(): void {
    if (this.metrics.recentCreations.length === 0) {
      this.metrics.performanceTargetMetRate = 100;
      return;
    }

    const targetMetCount = this.metrics.recentCreations.filter(m => m.targetMet).length;
    this.metrics.performanceTargetMetRate = (targetMetCount / this.metrics.recentCreations.length) * 100;
  }
}