/**
 * Constants for subagent registry and orchestration
 */

/** Default health check interval in milliseconds (30 seconds) */
export const DEFAULT_HEALTH_CHECK_INTERVAL = 30000;

/** Health check frequency in milliseconds (10 seconds) */
export const HEALTH_CHECK_FREQUENCY = 10000;

/** Default maximum load threshold for subagent selection */
export const DEFAULT_MAX_LOAD_THRESHOLD = 80;

/** Health check success probability (95%) */
export const HEALTH_CHECK_SUCCESS_PROBABILITY = 0.95;

/** Success rate rolling average weight for new completions */
export const SUCCESS_RATE_ROLLING_WEIGHT = 0.1;

/** Success rate value for successful task completion */
export const SUCCESS_RATE_SUCCESS_VALUE = 100;

/** Success rate value for failed task completion */
export const SUCCESS_RATE_FAILURE_VALUE = 0;

/** Load threshold for marking subagent as busy */
export const BUSY_LOAD_THRESHOLD = 80;

/** Success rate score weight for subagent scoring */
export const SUCCESS_RATE_SCORE_WEIGHT = 30;

/** Load score weight for subagent scoring */
export const LOAD_SCORE_WEIGHT = 20;

/** Tool availability score weight for subagent scoring */
export const TOOL_AVAILABILITY_SCORE_WEIGHT = 20;

/** Specialization alignment score weight for subagent scoring */
export const SPECIALIZATION_SCORE_WEIGHT = 10;

/** Maximum specialization alignment score */
export const MAX_SPECIALIZATION_ALIGNMENT_SCORE = 20;

/** Specialization alignment score per matching specialization */
export const SPECIALIZATION_ALIGNMENT_SCORE = 4;

/** Default average response time in milliseconds */
export const DEFAULT_AVG_RESPONSE_TIME = 30000;

/** Default reliability percentage */
export const DEFAULT_RELIABILITY = 95;

/** Initial status for new subagents */
export const INITIAL_SUBAGENT_STATUS = 'active' as const;

/** Default initial load for new subagents */
export const DEFAULT_INITIAL_LOAD = 0;

/** Default initial tasks completed for new subagents */
export const DEFAULT_INITIAL_TASKS_COMPLETED = 0;

/** Maximum load percentage (100%) */
export const MAX_LOAD_PERCENTAGE = 100;
