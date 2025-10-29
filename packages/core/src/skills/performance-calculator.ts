import { TREND_THRESHOLDS, PERFORMANCE_THRESHOLDS } from './constants';
import { ExecutionResult, HistoricalData, PerformanceData, TrendsResult } from './types';

/**
 * Trend direction type for performance analysis
 */
type TrendDirection = 'increasing' | 'decreasing' | 'stable';

/**
 * Performance threshold constants
 */
const PERFORMANCE_CONSTANTS = {
  ERROR_RATE_THRESHOLD: 0.1,
  CACHE_HIT_RATE_THRESHOLD: 0.8,
  HALF_DIVISOR: 2,
} as const;

/**
 * Calculate average execution time from an array of times
 * @param {number[]} times - Array of execution times in milliseconds
 * @returns {number} Average execution time rounded to nearest integer
 */
export function calculateAverageExecutionTime(times: number[]): number {
  if (times.length === 0) return 0;
  const sum = times.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / times.length);
}

/**
 * Calculate success rate from execution results
 * @param {ExecutionResult[]} executions - Array of execution results
 * @returns {number} Success rate as a decimal between 0 and 1
 */
export function calculateSuccessRate(executions: ExecutionResult[]): number {
  if (executions.length === 0) return 0;
  const successfulExecutions = executions.filter(exec => exec.success).length;
  return successfulExecutions / executions.length;
}

/**
 * Analyze trend between two values using thresholds
 * @param {number} firstValue - First period value
 * @param {number} secondValue - Second period value
 * @param {number} increaseThreshold - Threshold for considering an increase
 * @param {number} decreaseThreshold - Threshold for considering a decrease
 * @returns {TrendDirection} Trend direction: 'increasing', 'decreasing', or 'stable'
 */
function analyzeTrendDirection(
  firstValue: number,
  secondValue: number,
  increaseThreshold: number,
  decreaseThreshold: number
): TrendDirection {
  if (secondValue > firstValue * increaseThreshold) {
    return 'increasing';
  }
  if (secondValue < firstValue * decreaseThreshold) {
    return 'decreasing';
  }
  return 'stable';
}

/**
 * Analyze execution time trends from historical data
 * @param {HistoricalData[]} data - Array of historical performance data
 * @returns {TrendDirection} Trend analysis result for execution time
 */
function analyzeExecutionTimeTrend(data: HistoricalData[]): TrendDirection {
  const firstHalf = data.slice(0, Math.floor(data.length / PERFORMANCE_CONSTANTS.HALF_DIVISOR));
  const secondHalf = data.slice(Math.floor(data.length / PERFORMANCE_CONSTANTS.HALF_DIVISOR));

  const firstAvgExecTime =
    firstHalf.reduce((sum, d) => sum + d.avgExecutionTime, 0) / firstHalf.length;
  const secondAvgExecTime =
    secondHalf.reduce((sum, d) => sum + d.avgExecutionTime, 0) / secondHalf.length;

  return analyzeTrendDirection(
    firstAvgExecTime,
    secondAvgExecTime,
    TREND_THRESHOLDS.INCREASE_HIGH,
    TREND_THRESHOLDS.DECREASE_HIGH
  );
}

/**
 * Analyze success rate trends from historical data
 * @param {HistoricalData[]} data - Array of historical performance data
 * @returns {TrendDirection} Trend analysis result for success rate
 */
function analyzeSuccessRateTrend(data: HistoricalData[]): TrendDirection {
  const firstHalf = data.slice(0, Math.floor(data.length / PERFORMANCE_CONSTANTS.HALF_DIVISOR));
  const secondHalf = data.slice(Math.floor(data.length / PERFORMANCE_CONSTANTS.HALF_DIVISOR));

  const firstAvgSuccessRate =
    firstHalf.reduce((sum, d) => sum + d.successRate, 0) / firstHalf.length;
  const secondAvgSuccessRate =
    secondHalf.reduce((sum, d) => sum + d.successRate, 0) / secondHalf.length;

  return analyzeTrendDirection(
    firstAvgSuccessRate,
    secondAvgSuccessRate,
    TREND_THRESHOLDS.SUCCESS_INCREASE,
    TREND_THRESHOLDS.SUCCESS_DECREASE
  );
}

/**
 * Determine overall performance health from individual trends
 * @param {TrendDirection} executionTimeTrend - Trend for execution time
 * @param {TrendDirection} successRateTrend - Trend for success rate
 * @returns {'improving' | 'declining' | 'stable'} Overall health assessment
 */
function determineOverallHealth(
  executionTimeTrend: TrendDirection,
  successRateTrend: TrendDirection
): 'improving' | 'declining' | 'stable' {
  if (executionTimeTrend === 'increasing' || successRateTrend === 'decreasing') {
    return 'declining';
  }
  if (executionTimeTrend === 'decreasing' || successRateTrend === 'increasing') {
    return 'improving';
  }
  return 'stable';
}

/**
 * Analyze performance trends from historical data
 * @param {HistoricalData[]} data - Array of historical performance data
 * @returns {TrendsResult} Trend analysis results
 */
export function analyzeTrends(data: HistoricalData[]): TrendsResult {
  if (data.length < TREND_THRESHOLDS.MIN_DATA_POINTS) {
    return {
      executionTimeTrend: 'stable',
      successRateTrend: 'stable',
      overallHealth: 'stable',
    };
  }

  const executionTimeTrend = analyzeExecutionTimeTrend(data);
  const successRateTrend = analyzeSuccessRateTrend(data);
  const overallHealth = determineOverallHealth(executionTimeTrend, successRateTrend);

  return {
    executionTimeTrend,
    successRateTrend,
    overallHealth,
  };
}

/**
 * Generate optimization recommendations based on performance data
 * @param {PerformanceData} performance - Performance data to analyze
 * @returns {string[]} Array of optimization recommendations
 */
export function generateOptimizations(performance: PerformanceData): string[] {
  const recommendations: string[] = [];

  if (performance.avgExecutionTime > PERFORMANCE_THRESHOLDS.EXECUTION_TIME_HIGH) {
    recommendations.push('Optimize algorithm efficiency to reduce execution time below 2 seconds');
  }

  if (performance.successRate < PERFORMANCE_THRESHOLDS.SUCCESS_RATE_GOOD) {
    recommendations.push('Implement better error handling to improve success rate above 90%');
  }

  if (performance.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_USAGE_HIGH) {
    recommendations.push('Optimize memory usage to stay below 100MB');
  }

  if (performance.errorRate > PERFORMANCE_CONSTANTS.ERROR_RATE_THRESHOLD) {
    recommendations.push('Reduce error rate below 10% through better input validation');
  }

  if (performance.cacheHitRate < PERFORMANCE_CONSTANTS.CACHE_HIT_RATE_THRESHOLD) {
    recommendations.push('Improve caching strategy to achieve 80%+ hit rate');
  }

  return recommendations;
}

/**
 * Performance calculator interface
 */
export interface PerformanceCalculator {
  calculateAverageExecutionTime: (times: number[]) => number;
  calculateSuccessRate: (executions: ExecutionResult[]) => number;
  analyzeTrends: (data: HistoricalData[]) => TrendsResult;
  generateOptimizations: (performance: PerformanceData) => string[];
}

/**
 * Create a performance calculator for testing
 * @returns {PerformanceCalculator} Performance calculator object with analysis methods
 */
export function createPerformanceCalculator(): PerformanceCalculator {
  return {
    calculateAverageExecutionTime,
    calculateSuccessRate,
    analyzeTrends,
    generateOptimizations,
  };
}
