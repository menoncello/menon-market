/**
 * Scoring utilities for subagent selection and task suitability
 */

import { AgentRole } from '../agents/types';
import {
  SUCCESS_RATE_SCORE_WEIGHT,
  LOAD_SCORE_WEIGHT,
  TOOL_AVAILABILITY_SCORE_WEIGHT,
  SPECIALIZATION_SCORE_WEIGHT,
  MAX_SPECIALIZATION_ALIGNMENT_SCORE,
  SPECIALIZATION_ALIGNMENT_SCORE,
} from './constants';
import { SubagentRegistration } from './subagent-registry';

/** Percentage divisor for rate calculations */
const PERCENTAGE_DIVISOR = 100;

/** Maximum value for percentage calculations */
const MAX_PERCENTAGE_VALUE = 100;

/** Minimum word length for partial matching in specializations */
const MIN_WORD_LENGTH_FOR_PARTIAL_MATCH = 3;

/** Partial match score multiplier (50% of full match) */
const PARTIAL_MATCH_MULTIPLIER = 0.5;

/** Base role score */
const BASE_ROLE_SCORE = 10;

/** Score per matching keyword */
const KEYWORD_MATCH_SCORE = 2;

/** Maximum role score */
const MAX_ROLE_SCORE = 20;

/**
 * Calculate success rate score component
 * @param {number} successRate - Subagent's success rate (0-100)
 * @returns {number} Success rate score component
 */
export function calculateSuccessRateScore(successRate: number): number {
  return (successRate / PERCENTAGE_DIVISOR) * SUCCESS_RATE_SCORE_WEIGHT;
}

/**
 * Calculate load score component (lower load is better)
 * @param {number} currentLoad - Subagent's current load (0-100)
 * @returns {number} Load score component
 */
export function calculateLoadScore(currentLoad: number): number {
  return ((MAX_PERCENTAGE_VALUE - currentLoad) / PERCENTAGE_DIVISOR) * LOAD_SCORE_WEIGHT;
}

/**
 * Calculate tool availability score component
 * @param {string[]} requiredTools - Required tools for the task
 * @param {string[]} availableTools - Tools available to the subagent
 * @returns {number} Tool availability score component
 */
export function calculateToolAvailabilityScore(
  requiredTools: string[],
  availableTools: string[]
): number {
  if (!requiredTools || requiredTools.length === 0) {
    return TOOL_AVAILABILITY_SCORE_WEIGHT;
  }

  const availableToolsCount = requiredTools.filter(tool => availableTools.includes(tool)).length;
  return (availableToolsCount / requiredTools.length) * TOOL_AVAILABILITY_SCORE_WEIGHT;
}

/**
 * Calculate specialization alignment score component
 * @param {string} taskDescription - Description of the task
 * @param {string[]} specializations - Subagent's specializations
 * @returns {number} Specialization alignment score component
 */
export function calculateSpecializationScore(
  taskDescription: string,
  specializations: string[]
): number {
  const taskLower = taskDescription.toLowerCase();

  // Direct matching
  const matchingSpecializations = specializations.filter(spec =>
    taskLower.includes(spec.toLowerCase())
  );

  // Partial matching for more flexible scoring
  const partialMatches = specializations.filter(spec => {
    const specLower = spec.toLowerCase();
    const specWords = specLower.split(/\s+/);
    return specWords.some(
      word => word.length > MIN_WORD_LENGTH_FOR_PARTIAL_MATCH && taskLower.includes(word)
    );
  });

  // Calculate base score from direct matches
  let specializationScore = matchingSpecializations.length * SPECIALIZATION_ALIGNMENT_SCORE;

  // Add bonus for partial matches (less weight)
  specializationScore +=
    partialMatches.length * (SPECIALIZATION_ALIGNMENT_SCORE * PARTIAL_MATCH_MULTIPLIER);

  // Cap at maximum
  specializationScore = Math.min(MAX_SPECIALIZATION_ALIGNMENT_SCORE, specializationScore);

  return (specializationScore / MAX_SPECIALIZATION_ALIGNMENT_SCORE) * SPECIALIZATION_SCORE_WEIGHT;
}

/**
 * Get Frontend development role keywords
 * @returns {string[]} FrontendDev role keywords
 */
const getFrontendDevKeywords = (): string[] => [
  'frontend',
  'ui',
  'component',
  'react',
  'vue',
  'angular',
  'css',
  'html',
  'javascript',
  'typescript',
  'interface',
  'user interface',
];

/**
 * Get Backend development role keywords
 * @returns {string[]} BackendDev role keywords
 */
const getBackendDevKeywords = (): string[] => [
  'backend',
  'api',
  'server',
  'database',
  'node',
  'express',
  'python',
  'java',
  'rest',
  'graphql',
  'microservice',
];

/**
 * Get QA role keywords
 * @returns {string[]} QA role keywords
 */
const getQAKeywords = (): string[] => [
  'test',
  'testing',
  'quality',
  'automation',
  'jest',
  'cypress',
  'spec',
  'verification',
  'validation',
];

/**
 * Get Architect role keywords
 * @returns {string[]} Architect role keywords
 */
const getArchitectKeywords = (): string[] => [
  'architecture',
  'design',
  'system',
  'structure',
  'pattern',
  'scalability',
  'planning',
  'blueprint',
];

/**
 * Get CLI Dev role keywords
 * @returns {string[]} CLI Dev role keywords
 */
const getCLIDevKeywords = (): string[] => [
  'cli',
  'command line',
  'terminal',
  'console',
  'script',
  'automation',
  'tool',
  'utility',
];

/**
 * Get UX Expert role keywords
 * @returns {string[]} UX Expert role keywords
 */
const getUXExpertKeywords = (): string[] => [
  'ux',
  'user experience',
  'design',
  'usability',
  'wireframe',
  'prototype',
  'user research',
  'interface design',
];

/**
 * Get SM role keywords
 * @returns {string[]} SM role keywords
 */
const getSMKeywords = (): string[] => [
  'scrum',
  'agile',
  'planning',
  'sprint',
  'workflow',
  'process',
  'management',
  'coordination',
];

/**
 * Get Custom role keywords
 * @returns {string[]} Custom role keywords
 */
const getCustomKeywords = (): string[] => [
  'custom',
  'specialized',
  'domain-specific',
  'tailored',
  'bespoke',
];

/**
 * Role-specific keyword matching for each agent role
 * @returns {Record<AgentRole, string[]>} Role keywords mapping
 */
const getRoleKeywords = (): Record<AgentRole, string[]> => {
  return {
    FrontendDev: getFrontendDevKeywords(),
    BackendDev: getBackendDevKeywords(),
    QA: getQAKeywords(),
    Architect: getArchitectKeywords(),
    'CLI Dev': getCLIDevKeywords(),
    'UX Expert': getUXExpertKeywords(),
    SM: getSMKeywords(),
    Custom: getCustomKeywords(),
  };
};

/**
 * Count matching keywords between task description and role keywords
 * @param {string} taskDescription - Description of the task
 * @param {string[]} keywords - Role-specific keywords to match against
 * @returns {number} Number of matching keywords
 */
const countMatchingKeywords = (taskDescription: string, keywords: string[]): number => {
  const taskLower = taskDescription.toLowerCase();
  return keywords.filter(keyword => taskLower.includes(keyword)).length;
};

/**
 * Calculate base role score with keyword matches
 * @param {number} matchingKeywordCount - Number of matching keywords
 * @returns {number} Base role score
 */
const calculateBaseRoleScore = (matchingKeywordCount: number): number => {
  const roleScore = BASE_ROLE_SCORE + matchingKeywordCount * KEYWORD_MATCH_SCORE;
  return Math.min(MAX_ROLE_SCORE, roleScore);
};

/**
 * Calculate role alignment score component
 * @param {string} taskDescription - Description of the task
 * @param {AgentRole} agentRole - The agent's role
 * @returns {number} Role alignment score component
 */
export function calculateRoleScore(taskDescription: string, agentRole: AgentRole): number {
  const roleKeywords = getRoleKeywords();
  const keywords = roleKeywords[agentRole] || [];
  const matchingKeywordCount = countMatchingKeywords(taskDescription, keywords);

  return calculateBaseRoleScore(matchingKeywordCount);
}

/**
 * Calculate overall suitability score for a subagent
 * @param {SubagentRegistration} registration - Subagent registration
 * @param {string} task - Task description
 * @param {string[]} [requirements] - Optional required tools
 * @returns {number} Overall suitability score (higher is better)
 */
export function scoreSubagentForTask(
  registration: SubagentRegistration,
  task: string,
  requirements?: string[]
): number {
  const { capabilities, successRate, currentLoad, agent } = registration;

  let score = 0;

  // Success rate score (30% weight)
  score += calculateSuccessRateScore(successRate);

  // Load score (20% weight) - lower load is better
  score += calculateLoadScore(currentLoad);

  // Tool availability score (20% weight)
  score += calculateToolAvailabilityScore(requirements || [], capabilities.tools);

  // Specialization alignment score (10% weight)
  score += calculateSpecializationScore(task, capabilities.specializations);

  // Role alignment score (20% weight)
  score += calculateRoleScore(task, agent.role);

  return score;
}
