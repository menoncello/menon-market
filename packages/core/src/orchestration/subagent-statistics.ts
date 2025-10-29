/**
 * Statistics calculation utilities for subagent registry
 */

import { AgentRole } from '../agents/types';
import { SubagentRegistration, SubagentStatus, SubagentStatistics } from './subagent-registry';

/**
 * Initialize status counters for all possible statuses
 * @returns {Record<SubagentStatus, number>} Initialized status counters
 */
export function initializeStatusCounters(): Record<SubagentStatus, number> {
  return {
    active: 0,
    inactive: 0,
    busy: 0,
    error: 0,
    maintenance: 0,
  };
}

/**
 * Initialize role counters for all possible roles
 * @returns {Record<AgentRole, number>} Initialized role counters
 */
export function initializeRoleCounters(): Record<AgentRole, number> {
  return {
    FrontendDev: 0,
    BackendDev: 0,
    QA: 0,
    Architect: 0,
    'CLI Dev': 0,
    'UX Expert': 0,
    SM: 0,
    Custom: 0,
  };
}

/**
 * Calculate status statistics for subagents
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @returns {Record<SubagentStatus, number>} Status count statistics
 */
export function calculateStatusStatistics(
  subagents: SubagentRegistration[]
): Record<SubagentStatus, number> {
  const byStatus = initializeStatusCounters();

  for (const subagent of subagents) {
    byStatus[subagent.status]++;
  }

  return byStatus;
}

/**
 * Calculate role statistics for subagents
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @returns {Record<AgentRole, number>} Role count statistics
 */
export function calculateRoleStatistics(
  subagents: SubagentRegistration[]
): Record<AgentRole, number> {
  const byRole = initializeRoleCounters();

  for (const subagent of subagents) {
    byRole[subagent.agent.role]++;
  }

  return byRole;
}

/**
 * Accumulate metrics from subagent registrations
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @returns {{totalTasksCompleted: number; totalSuccessRate: number; totalResponseTime: number; totalLoad: number}} Accumulated totals
 */
function accumulateMetrics(subagents: SubagentRegistration[]): {
  totalTasksCompleted: number;
  totalSuccessRate: number;
  totalResponseTime: number;
  totalLoad: number;
} {
  let totalTasksCompleted = 0;
  let totalSuccessRate = 0;
  let totalResponseTime = 0;
  let totalLoad = 0;

  for (const subagent of subagents) {
    totalTasksCompleted += subagent.tasksCompleted;
    totalSuccessRate += subagent.successRate;
    totalResponseTime += subagent.capabilities.performance.avgResponseTime;
    totalLoad += subagent.currentLoad;
  }

  return {
    totalTasksCompleted,
    totalSuccessRate,
    totalResponseTime,
    totalLoad,
  };
}

/**
 * Calculate system-wide metrics for subagents
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @returns {{avgSuccessRate: number; avgResponseTime: number; totalTasksCompleted: number; systemLoad: number}} System metrics
 */
export function calculateSystemMetrics(subagents: SubagentRegistration[]): {
  avgSuccessRate: number;
  avgResponseTime: number;
  totalTasksCompleted: number;
  systemLoad: number;
} {
  if (subagents.length === 0) {
    return {
      avgSuccessRate: 0,
      avgResponseTime: 0,
      totalTasksCompleted: 0,
      systemLoad: 0,
    };
  }

  const { totalTasksCompleted, totalSuccessRate, totalResponseTime, totalLoad } =
    accumulateMetrics(subagents);

  const activeCount = subagents.length;

  return {
    avgSuccessRate: totalSuccessRate / activeCount,
    avgResponseTime: totalResponseTime / activeCount,
    totalTasksCompleted,
    systemLoad: totalLoad / activeCount,
  };
}

/**
 * Calculate comprehensive statistics for all registered subagents
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @returns {SubagentStatistics} Complete statistics object
 */
export function calculateStatistics(subagents: SubagentRegistration[]): SubagentStatistics {
  return {
    totalSubagents: subagents.length,
    byStatus: calculateStatusStatistics(subagents),
    byRole: calculateRoleStatistics(subagents),
    systemMetrics: calculateSystemMetrics(subagents),
  };
}
