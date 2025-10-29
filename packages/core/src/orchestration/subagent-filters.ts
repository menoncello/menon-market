/**
 * Filter functions for subagent discovery and selection
 */

import { AgentRole } from '../agents/types';
import { SubagentRegistration, SubagentStatus, DiscoveryFilter } from './subagent-registry';

/**
 * Filter subagents by role
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @param {AgentRole} role - Role to filter by
 * @returns {SubagentRegistration[]} Filtered subagents
 */
export function filterByRole(
  subagents: SubagentRegistration[],
  role: AgentRole
): SubagentRegistration[] {
  return subagents.filter(reg => reg.agent.role === role);
}

/**
 * Filter subagents by status
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @param {SubagentStatus | SubagentStatus[]} status - Status to filter by
 * @returns {SubagentRegistration[]} Filtered subagents
 */
export function filterByStatus(
  subagents: SubagentRegistration[],
  status: SubagentStatus | SubagentStatus[]
): SubagentRegistration[] {
  if (Array.isArray(status)) {
    return subagents.filter(reg => status.includes(reg.status));
  }
  return subagents.filter(reg => reg.status === status);
}

/**
 * Filter subagents by capabilities
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @param {string[]} capabilities - Required capabilities
 * @returns {SubagentRegistration[]} Filtered subagents
 */
export function filterByCapabilities(
  subagents: SubagentRegistration[],
  capabilities: string[]
): SubagentRegistration[] {
  return subagents.filter(reg =>
    capabilities.some(cap => reg.capabilities.specializations.includes(cap))
  );
}

/**
 * Filter subagents by minimum success rate
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @param {number} minSuccessRate - Minimum success rate threshold
 * @returns {SubagentRegistration[]} Filtered subagents
 */
export function filterByMinSuccessRate(
  subagents: SubagentRegistration[],
  minSuccessRate: number
): SubagentRegistration[] {
  return subagents.filter(reg => reg.successRate >= minSuccessRate);
}

/**
 * Filter subagents by maximum load
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @param {number} maxLoad - Maximum load threshold
 * @returns {SubagentRegistration[]} Filtered subagents
 */
export function filterByMaxLoad(
  subagents: SubagentRegistration[],
  maxLoad: number
): SubagentRegistration[] {
  return subagents.filter(reg => reg.currentLoad <= maxLoad);
}

/**
 * Filter subagents by required tools
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @param {string[]} requiredTools - Required tools
 * @returns {SubagentRegistration[]} Filtered subagents
 */
export function filterByRequiredTools(
  subagents: SubagentRegistration[],
  requiredTools: string[]
): SubagentRegistration[] {
  return subagents.filter(reg =>
    requiredTools.every(tool => reg.capabilities.tools.includes(tool))
  );
}

/**
 * Apply multiple filters to subagents
 * @param {SubagentRegistration[]} subagents - Array of subagent registrations
 * @param {DiscoveryFilter} filter - Filter criteria
 * @returns {SubagentRegistration[]} Filtered subagents
 */
export function applyFilters(
  subagents: SubagentRegistration[],
  filter: DiscoveryFilter
): SubagentRegistration[] {
  let filteredSubagents = [...subagents];

  // Apply role filter
  if (filter.role) {
    filteredSubagents = filterByRole(filteredSubagents, filter.role);
  }

  // Apply status filter
  if (filter.status) {
    filteredSubagents = filterByStatus(filteredSubagents, filter.status);
  }

  // Apply capabilities filter
  if (filter.capabilities && filter.capabilities.length > 0) {
    filteredSubagents = filterByCapabilities(filteredSubagents, filter.capabilities);
  }

  // Apply success rate filter
  if (filter.minSuccessRate !== undefined) {
    filteredSubagents = filterByMinSuccessRate(filteredSubagents, filter.minSuccessRate);
  }

  // Apply load filter
  if (filter.maxLoad !== undefined) {
    filteredSubagents = filterByMaxLoad(filteredSubagents, filter.maxLoad);
  }

  // Apply required tools filter
  if (filter.requiredTools && filter.requiredTools.length > 0) {
    filteredSubagents = filterByRequiredTools(filteredSubagents, filter.requiredTools);
  }

  return filteredSubagents;
}
