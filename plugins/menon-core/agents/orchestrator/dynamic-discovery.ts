/**
 * Dynamic Discovery System for Orchestrator
 * Enables real-time discovery of agents, skills, commands, and MCP servers
 */

import { AgentCapability } from './index';

export interface DiscoverySource {
  name: string;
  type: 'agents' | 'skills' | 'commands' | 'mcp';
  endpoint?: string;
  refreshInterval: number;
  lastUpdate: Date;
}

export interface DiscoveryResult<T> {
  items: T[];
  timestamp: Date;
  source: string;
  errors?: string[];
}

/**
 * Dynamic Discovery System for the Orchestrator.
 *
 * Enables real-time discovery of agents, skills, commands, and MCP servers
 * through multiple discovery sources including file system scanning,
 * API queries, and plugin discovery.
 */
export class DynamicDiscoverySystem {
  private discoverySources: Map<string, DiscoverySource> = new Map();
  private cache: Map<string, { data: unknown; timestamp: Date; ttl: number }> =
    new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Creates a new instance of the DynamicDiscoverySystem.
   *
   * Initializes discovery sources and starts automatic refresh timers.
   */
  constructor() {
    this.initializeDiscoverySources();
    this.startAutoRefresh();
  }

  /**
   * Initialize all discovery sources
   */
  private initializeDiscoverySources(): void {
    // Claude Code agents discovery
    this.discoverySources.set('claude-agents', {
      name: 'Claude Code Agents',
      type: 'agents',
      refreshInterval: 300000, // 5 minutes
      lastUpdate: new Date(0),
    });

    // Skills discovery from skill registry
    this.discoverySources.set('skill-registry', {
      name: 'Skill Registry',
      type: 'skills',
      refreshInterval: 600000, // 10 minutes
      lastUpdate: new Date(0),
    });

    // Commands discovery
    this.discoverySources.set('command-registry', {
      name: 'Command Registry',
      type: 'commands',
      refreshInterval: 300000, // 5 minutes
      lastUpdate: new Date(0),
    });

    // MCP servers discovery
    this.discoverySources.set('mcp-registry', {
      name: 'MCP Server Registry',
      type: 'mcp',
      refreshInterval: 600000, // 10 minutes
      lastUpdate: new Date(0),
    });

    // Plugin-based agents discovery
    this.discoverySources.set('plugin-agents', {
      name: 'Plugin Agents',
      type: 'agents',
      refreshInterval: 300000, // 5 minutes
      lastUpdate: new Date(0),
    });
  }

  /**
   * Start automatic refresh for all sources
   */
  private startAutoRefresh(): void {
    for (const [id, source] of this.discoverySources) {
      this.scheduleRefresh(id, source);
    }
  }

  /**
   * Schedule refresh for a specific source.
   *
   * @param id - The unique identifier for the discovery source
   * @param source - The discovery source configuration
   */
  private scheduleRefresh(id: string, source: DiscoverySource): void {
    const timer = setInterval(async () => {
      try {
        await this.refreshSource(id);
      } catch (error) {
        console.error(`Failed to refresh source ${id}:`, error);
      }
    }, source.refreshInterval);

    this.refreshTimers.set(id, timer);
  }

  /**
   * Refresh a specific discovery source.
   *
   * @param id - The unique identifier for the discovery source
   */
  async refreshSource(id: string): Promise<void> {
    const source = this.discoverySources.get(id);
    if (!source) {
      throw new Error(`Discovery source ${id} not found`);
    }

    const cacheKey = `${source.type}:${id}`;
    const cached = this.cache.get(cacheKey);

    // Check if cache is still valid
    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      return; // Cache is still valid
    }

    let result: unknown;

    switch (source.type) {
      case 'agents':
        result = await this.discoverAgents(source);
        break;
      case 'skills':
        result = await this.discoverSkills(source);
        break;
      case 'commands':
        result = await this.discoverCommands(source);
        break;
      case 'mcp':
        result = await this.discoverMCPServers(source);
        break;
      default:
        throw new Error(`Unknown discovery type: ${source.type}`);
    }

    // Update cache
    this.cache.set(cacheKey, {
      data: Array.isArray(result) ? result : [result],
      timestamp: new Date(),
      ttl: source.refreshInterval * 0.8, // Cache for 80% of refresh interval
    });

    source.lastUpdate = new Date();
  }

  /**
   * Discover agents dynamically from various sources.
   *
   * @param source - The discovery source configuration
   * @returns Array of discovered agent capabilities
   */
  private async discoverAgents(
    source: DiscoverySource
  ): Promise<AgentCapability[]> {
    const agents: AgentCapability[] = [];

    try {
      // Method 1: Scan for agent files
      const fileSystemAgents = await this.scanFileSystemForAgents();
      agents.push(...fileSystemAgents);

      // Method 2: Query Claude Code API (if available)
      const apiAgents = await this.queryClaudeCodeAPI('agents');
      agents.push(...apiAgents);

      // Method 3: Check for plugin agents
      const pluginAgents = await this.discoverPluginAgents();
      agents.push(...pluginAgents);

      // Method 4: Discover runtime agents
      const runtimeAgents = await this.discoverRuntimeAgents();
      agents.push(...runtimeAgents);
    } catch (error) {
      console.error(`Error discovering agents from ${source.name}:`, error);
    }

    return agents;
  }

  /**
   * Discover skills dynamically from various sources.
   *
   * @param source - The discovery source configuration
   * @returns Array of discovered skill names
   */
  private async discoverSkills(source: DiscoverySource): Promise<string[]> {
    const skills: string[] = [];

    try {
      // Method 1: Scan skill files
      const fileSystemSkills = await this.scanFileSystemForSkills();
      skills.push(...fileSystemSkills);

      // Method 2: Query skill registry
      const registrySkills = await this.querySkillRegistry();
      skills.push(...registrySkills);

      // Method 3: Discover plugin skills
      const pluginSkills = await this.discoverPluginSkills();
      skills.push(...pluginSkills);
    } catch (error) {
      console.error(`Error discovering skills from ${source.name}:`, error);
    }

    return [...new Set(skills)]; // Remove duplicates
  }

  /**
   * Discover commands dynamically from various sources.
   *
   * @param source - The discovery source configuration
   * @returns Array of discovered command names
   */
  private async discoverCommands(source: DiscoverySource): Promise<string[]> {
    const commands: string[] = [];

    try {
      // Method 1: Scan for slash command files
      const fileSystemCommands = await this.scanFileSystemForCommands();
      commands.push(...fileSystemCommands);

      // Method 2: Query command registry
      const registryCommands = await this.queryCommandRegistry();
      commands.push(...registryCommands);

      // Method 3: Discover plugin commands
      const pluginCommands = await this.discoverPluginCommands();
      commands.push(...pluginCommands);
    } catch (error) {
      console.error(`Error discovering commands from ${source.name}:`, error);
    }

    return [...new Set(commands)]; // Remove duplicates
  }

  /**
   * Discover MCP servers dynamically from various sources.
   *
   * @param source - The discovery source configuration
   * @returns Array of discovered MCP server names
   */
  private async discoverMCPServers(source: DiscoverySource): Promise<string[]> {
    const mcpServers: string[] = [];

    try {
      // Method 1: Scan for MCP configurations
      const configMCPServers = await this.scanMCPConfigurations();
      mcpServers.push(...configMCPServers);

      // Method 2: Query MCP registry
      const registryMCPServers = await this.queryMCPRegistry();
      mcpServers.push(...registryMCPServers);

      // Method 3: Discover running MCP servers
      const runningMCPServers = await this.discoverRunningMCPServers();
      mcpServers.push(...runningMCPServers);
    } catch (error) {
      console.error(
        `Error discovering MCP servers from ${source.name}:`,
        error
      );
    }

    return [...new Set(mcpServers)]; // Remove duplicates
  }

  /**
   * Scan file system for agents
   */
  private async scanFileSystemForAgents(): Promise<AgentCapability[]> {
    const agents: AgentCapability[] = [];

    try {
      // This would scan the agents directory for agent definitions
      // For now, return the static list as fallback
      const staticAgents = [
        'general-purpose',
        'statusline-setup',
        'Explore',
        'Plan',
        'superpowers:code-reviewer',
        'episodic-memory:search-conversations',
        'agent-sdk-dev:agent-sdk-verifier-py',
        'agent-sdk-dev:agent-sdk-verifier-ts',
        'pr-review-toolkit:code-reviewer',
        'pr-review-toolkit:code-simplifier',
        'pr-review-toolkit:comment-analyzer',
        'pr-review-toolkit:pr-test-analyzer',
        'pr-review-toolkit:silent-failure-hunter',
        'pr-review-toolkit:type-design-analyzer',
        'feature-dev:code-architect',
        'feature-dev:code-explorer',
        'feature-dev:code-reviewer',
        'studio-cc:cc-expert-examples',
        'studio-cc:cc-expert',
        'astrojs-specialist',
        'agent-creator',
        'lint-typescript-fixer',
      ];

      for (const agentType of staticAgents) {
        agents.push({
          name: agentType,
          skills: await this.getAgentSkillsFromFile(agentType),
          tools: await this.getAgentToolsFromFile(agentType),
          status: 'inactive',
          performance: {
            successRate: 1.0,
            avgExecutionTime: 0,
            lastUsed: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error scanning file system for agents:', error);
    }

    return agents;
  }

  private readonly AVAILABLE_SKILLS = [
    'n8n-code-javascript',
    'n8n-code-python',
    'n8n-expression-syntax',
    'n8n-mcp-tools-expert',
    'n8n-node-configuration',
    'n8n-validation-expert',
    'n8n-workflow-patterns',
    'superpowers:brainstorming',
    'superpowers:condition-based-waiting',
    'superpowers:defense-in-depth',
    'superpowers:dispatching-parallel-agents',
    'superpowers:executing-plans',
    'superpowers:finishing-a-development-branch',
    'superpowers:receiving-code-review',
    'superpowers:requesting-code-review',
    'superpowers:root-cause-tracing',
    'superpowers:sharing-skills',
    'superpowers:subagent-driven-development',
    'superpowers:systematic-debugging',
    'superpowers:test-driven-development',
    'superpowers:testing-anti-patterns',
    'example-skills:kokoro-js-builder',
    'example-skills:kokoro-tts-builder',
    'example-skills:nodejs-cli-builder',
    'example-skills:python-cli-builder',
    'example-skills:skill-creator',
    'example-skills:mcp-builder',
    'example-skills:canvas-design',
    'example-skills:algorithmic-art',
    'example-skills:internal-comms',
    'example-skills:webapp-testing',
    'example-skills:artifacts-builder',
    'example-skills:slack-gif-creator',
    'example-skills:theme-factory',
    'example-skills:brand-guidelines',
    'superpowers-chrome:browsing',
  ];

  /**
   * Scan file system for skills
   */
  private async scanFileSystemForSkills(): Promise<string[]> {
    try {
      return this.AVAILABLE_SKILLS;
    } catch (error) {
      console.error('Error scanning file system for skills:', error);
      return [];
    }
  }

  /**
   * Scan file system for commands
   */
  private async scanFileSystemForCommands(): Promise<string[]> {
    try {
      // This would scan for .claude/commands/ directory
      return [
        '/superpowers:brainstorm',
        '/superpowers:execute-plan',
        '/superpowers:write-plan',
        '/episodic-memory:search-conversations',
        '/agent-sdk-dev:new-sdk-app',
        '/pr-review-toolkit:review-pr',
        '/commit-commands:clean_gone',
        '/commit-commands:commit-push-pr',
        '/commit-commands:commit',
        '/feature-dev:feature-dev',
        '/code-review:code-review',
        '/studio-cc:cc-plugin',
      ];
    } catch (error) {
      console.error('Error scanning file system for commands:', error);
      return [];
    }
  }

  /**
   * Placeholder method for querying Claude Code API.
   *
   * @param _type - The type of items to query (agents/skills/commands)
   * @returns Array of available items from Claude Code API
   */
  private async queryClaudeCodeAPI(_type: string): Promise<unknown[]> {
    // This would query the Claude Code API for available agents/skills
    return [];
  }

  /**
   * Queries a central skill registry for available skills.
   *
   * @returns Array of available skill names from the registry
   */
  private async querySkillRegistry(): Promise<string[]> {
    // This would query a central skill registry
    return [];
  }

  /**
   * Queries a central command registry for available commands.
   *
   * @returns Array of available command names from the registry
   */
  private async queryCommandRegistry(): Promise<string[]> {
    // This would query a central command registry
    return [];
  }

  /**
   * Queries an MCP server registry for available servers.
   *
   * @returns Array of available MCP server names from the registry
   */
  private async queryMCPRegistry(): Promise<string[]> {
    // This would query an MCP server registry
    return [];
  }

  /**
   * Discovers agents from available plugins.
   *
   * @returns Array of agent capabilities discovered from plugins
   */
  private async discoverPluginAgents(): Promise<AgentCapability[]> {
    // This would discover agents from plugins
    return [];
  }

  /**
   * Discovers skills from available plugins.
   *
   * @returns Array of skill names discovered from plugins
   */
  private async discoverPluginSkills(): Promise<string[]> {
    // This would discover skills from plugins
    return [];
  }

  /**
   * Discovers commands from available plugins.
   *
   * @returns Array of command names discovered from plugins
   */
  private async discoverPluginCommands(): Promise<string[]> {
    // This would discover commands from plugins
    return [];
  }

  /**
   * Scans for MCP configuration files.
   *
   * @returns Array of MCP server names found in configuration files
   */
  private async scanMCPConfigurations(): Promise<string[]> {
    // This would scan for MCP configuration files
    return ['superpowers-chrome', 'web-search-prime', 'zai-mcp-server'];
  }

  /**
   * Discovers currently running MCP servers.
   *
   * @returns Array of currently running MCP server names
   */
  private async discoverRunningMCPServers(): Promise<string[]> {
    // This would discover currently running MCP servers
    return [];
  }

  /**
   * Discovers agents available at runtime.
   *
   * @returns Array of agent capabilities available at runtime
   */
  private async discoverRuntimeAgents(): Promise<AgentCapability[]> {
    // This would discover agents available at runtime
    return [];
  }

  /**
   * Reads agent skills from file system.
   *
   * @param _agentType - The type of agent to read skills for
   * @returns Array of skill names for the agent
   */
  private async getAgentSkillsFromFile(_agentType: string): Promise<string[]> {
    // This would read agent skills from file system
    return [];
  }

  /**
   * Reads agent tools from file system.
   *
   * @param _agentType - The type of agent to read tools for
   * @returns Array of tool names for the agent
   */
  private async getAgentToolsFromFile(_agentType: string): Promise<string[]> {
    // This would read agent tools from file system
    return [];
  }

  /**
   * Gets cached discovery data or refresh if needed.
   *
   * @param type - The type of discovery data to retrieve
   * @param forceRefresh - Whether to force a refresh of the data
   * @returns Discovery data for the specified type
   */
  async getDiscoveryData(type: string, forceRefresh = false): Promise<unknown> {
    const sources = Array.from(this.discoverySources.values()).filter(
      (source) => source.type === type
    );

    const allData: unknown[] = [];

    for (const source of sources) {
      if (forceRefresh) {
        await this.refreshSource(source.name);
      }

      const cacheKey = `${type}:${source.name}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Array.isArray(cached.data)) {
        allData.push(...cached.data);
      }
    }

    return allData;
  }

  /**
   * Get discovery status
   */
  getDiscoveryStatus(): {
    sources: Array<{
      name: string;
      type: string;
      lastUpdate: Date;
      status: 'updated' | 'stale' | 'error';
    }>;
    cacheSize: number;
  } {
    const sources = Array.from(this.discoverySources.values()).map((source) => {
      const now = new Date();
      const age = now.getTime() - source.lastUpdate.getTime();
      const isStale = age > source.refreshInterval;

      return {
        name: source.name,
        type: source.type,
        lastUpdate: source.lastUpdate,
        status: isStale
          ? 'stale'
          : ('updated' as 'updated' | 'stale' | 'error'),
      };
    });

    return {
      sources,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Force refresh all sources
   */
  async refreshAll(): Promise<void> {
    for (const [id] of this.discoverySources) {
      try {
        await this.refreshSource(id);
      } catch (error) {
        console.error(`Failed to refresh source ${id}:`, error);
      }
    }
  }

  /**
   * Cleanup and stop all refresh timers
   */
  destroy(): void {
    for (const [, timer] of this.refreshTimers) {
      clearInterval(timer);
    }
    this.refreshTimers.clear();
    this.cache.clear();
    this.discoverySources.clear();
  }
}

export default DynamicDiscoverySystem;
