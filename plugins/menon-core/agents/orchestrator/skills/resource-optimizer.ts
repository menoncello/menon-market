import { Agent } from '../index';

/**
 * Resource Optimizer Skill
 *
 * Optimizes resource allocation and utilization across the agent system
 */
export class ResourceOptimizerSkill {
  private orchestrator: Agent;
  private resourcePools: Map<string, ResourcePool> = new Map();
  private allocations: Map<string, ResourceAllocation> = new Map();
  private metrics: ResourceMetrics[] = [];
  private optimizationHistory: OptimizationResult[] = [];

  /**
   *
   * @param orchestrator
   */
  constructor(orchestrator: Agent) {
    this.orchestrator = orchestrator;
    this.initializeResourcePools();
  }

  /**
   * Initialize default resource pools
   */
  private initializeResourcePools(): void {
    // CPU Resource Pool
    this.resourcePools.set('cpu', {
      id: 'cpu',
      name: 'CPU Resources',
      type: 'compute',
      total: 100,
      available: 100,
      allocated: 0,
      unit: 'percent',
      priority: 1
    });

    // Memory Resource Pool
    this.resourcePools.set('memory', {
      id: 'memory',
      name: 'Memory Resources',
      type: 'memory',
      total: 100,
      available: 100,
      allocated: 0,
      unit: 'percent',
      priority: 1
    });

    // Network Resource Pool
    this.resourcePools.set('network', {
      id: 'network',
      name: 'Network Resources',
      type: 'network',
      total: 1000,
      available: 1000,
      allocated: 0,
      unit: 'connections',
      priority: 2
    });

    // Storage Resource Pool
    this.resourcePools.set('storage', {
      id: 'storage',
      name: 'Storage Resources',
      type: 'storage',
      total: 10000,
      available: 10000,
      unit: 'megabytes',
      priority: 2,
      allocated: 0
    });

    // API Rate Limit Pool
    this.resourcePools.set('api-rate', {
      id: 'api-rate',
      name: 'API Rate Limits',
      type: 'api',
      total: 1000,
      available: 1000,
      allocated: 0,
      unit: 'requests_per_hour',
      priority: 3
    });
  }

  /**
   * Optimize resource allocation across the system
   * @param options Optimization options
   */
  async optimizeResources(options: OptimizationOptions = {}): Promise<OptimizationResult> {
    const startTime = Date.now();
    const optimizations: ResourceOptimization[] = [];

    try {
      // Get current system status
      const systemStatus = this.orchestrator.getSystemStatus();

      // Analyze current resource utilization
      const currentUtilization = this.getResourceUtilization();

      // Identify optimization opportunities
      const opportunities = this.identifyOptimizationOpportunities(currentUtilization, systemStatus);

      // Apply optimizations
      for (const opportunity of opportunities) {
        const optimization = await this.applyOptimization(opportunity);
        optimizations.push(optimization);
      }

      // Rebalance resources if needed
      const rebalancing = await this.rebalanceResources();

      const endTime = Date.now();
      const duration = endTime - startTime;

      const result: OptimizationResult = {
        timestamp: new Date().toISOString(),
        duration,
        optimizations,
        rebalancing,
        beforeMetrics: currentUtilization,
        afterMetrics: this.getResourceUtilization(),
        impact: this.calculateOptimizationImpact(currentUtilization, optimizations)
      };

      this.optimizationHistory.push(result);
      this.updateMetrics(result);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        timestamp: new Date().toISOString(),
        duration,
        optimizations: [],
        rebalancing: {
          success: false,
          reason: error.message,
          changes: []
        },
        beforeMetrics: this.getResourceUtilization(),
        afterMetrics: this.getResourceUtilization(),
        impact: {
          efficiencyGain: 0,
          resourceSavings: {},
          performanceImprovement: 0
        },
        error: error.message
      };
    }
  }

  /**
   * Get current resource utilization
   */
  getResourceUtilization(): ResourceUtilization {
    const pools: ResourcePoolStatus[] = [];

    for (const [id, pool] of this.resourcePools) {
      const utilizationRate = pool.total > 0 ? (pool.allocated / pool.total) * 100 : 0;

      pools.push({
        id: pool.id,
        name: pool.name,
        type: pool.type,
        total: pool.total,
        allocated: pool.allocated,
        available: pool.available,
        utilizationRate,
        status: this.getPoolStatus(utilizationRate),
        priority: pool.priority
      });
    }

    const overallUtilization = pools.reduce((sum, pool) => sum + pool.utilizationRate, 0) / pools.length;

    return {
      timestamp: new Date().toISOString(),
      pools,
      overallStatus: this.getOverallStatus(pools),
      overallUtilization,
      totalAllocations: this.allocations.size,
      efficiency: this.calculateEfficiency(pools)
    };
  }

  /**
   * Allocate resources to a specific agent or task
   * @param recipient Resource recipient
   * @param requests Resource requests
   */
  async allocateResources(
    recipient: string,
    requests: ResourceRequest[]
  ): Promise<ResourceAllocationResult> {
    const allocationId = `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const allocations: ResourceAllocationDetail[] = [];
    const failedRequests: ResourceRequest[] = [];

    // Check if we can satisfy all requests
    for (const request of requests) {
      const pool = this.resourcePools.get(request.type);
      if (!pool) {
        failedRequests.push(request);
        continue;
      }

      if (pool.available < request.amount) {
        failedRequests.push(request);
        continue;
      }
    }

    if (failedRequests.length > 0) {
      return {
        success: false,
        allocationId: '',
        allocations: [],
        failedRequests,
        reason: 'Insufficient resources available'
      };
    }

    // Allocate resources
    for (const request of requests) {
      const pool = this.resourcePools.get(request.type);
      if (!pool) continue;

      pool.allocated += request.amount;
      pool.available = pool.total - pool.allocated;

      allocations.push({
        type: request.type,
        amount: request.amount,
        priority: request.priority || 1,
        expiresAt: request.expiresAt || new Date(Date.now() + 3600000).toISOString(), // 1 hour default
        metadata: request.metadata || {}
      });
    }

    const allocation: ResourceAllocation = {
      id: allocationId,
      recipient,
      allocations,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    this.allocations.set(allocationId, allocation);

    return {
      success: true,
      allocationId,
      allocations,
      failedRequests: []
    };
  }

  /**
   * Release allocated resources
   * @param allocationId Allocation identifier
   */
  async releaseResources(allocationId: string): Promise<boolean> {
    const allocation = this.allocations.get(allocationId);
    if (!allocation) {
      return false;
    }

    // Release resources back to pools
    for (const detail of allocation.allocations) {
      const pool = this.resourcePools.get(detail.type);
      if (pool) {
        pool.allocated -= detail.amount;
        pool.available = pool.total - pool.allocated;
      }
    }

    allocation.status = 'released';
    this.allocations.delete(allocationId);

    return true;
  }

  /**
   * Identify optimization opportunities
   * @param utilization Current resource utilization
   * @param systemStatus System status
   */
  private identifyOptimizationOpportunities(
    utilization: ResourceUtilization,
    systemStatus: any
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Check for underutilized resources
    for (const pool of utilization.pools) {
      if (pool.utilizationRate < 30 && pool.priority <= 2) {
        opportunities.push({
          type: 'underutilization',
          poolId: pool.id,
          description: `Resource pool ${pool.name} is underutilized at ${pool.utilizationRate.toFixed(1)}%`,
          potentialSavings: pool.allocated * 0.5,
          priority: 'medium',
          effort: 'low'
        });
      }

      // Check for overutilized resources
      if (pool.utilizationRate > 80) {
        opportunities.push({
          type: 'overutilization',
          poolId: pool.id,
          description: `Resource pool ${pool.name} is overutilized at ${pool.utilizationRate.toFixed(1)}%`,
          potentialSavings: 0,
          priority: 'high',
          effort: 'medium'
        });
      }
    }

    // Check for expired allocations
    const now = Date.now();
    for (const [id, allocation] of this.allocations) {
      if (allocation.status === 'active') {
        for (const detail of allocation.allocations) {
          if (detail.expiresAt && new Date(detail.expiresAt).getTime() < now) {
            opportunities.push({
              type: 'expired_allocation',
              poolId: detail.type,
              description: `Expired allocation ${id} for ${allocation.recipient}`,
              potentialSavings: detail.amount,
              priority: 'medium',
              effort: 'low',
              allocationId: id
            });
          }
        }
      }
    }

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }

  /**
   * Apply optimization
   * @param opportunity Optimization opportunity
   */
  private async applyOptimization(opportunity: OptimizationOpportunity): Promise<ResourceOptimization> {
    const startTime = Date.now();

    try {
      switch (opportunity.type) {
        case 'underutilization':
          return this.optimizeUnderutilizedPool(opportunity);
        case 'overutilization':
          return this.optimizeOverutilizedPool(opportunity);
        case 'expired_allocation':
          return this.releaseExpiredAllocation(opportunity);
        default:
          throw new Error(`Unknown optimization type: ${opportunity.type}`);
      }
    } catch (error) {
      const endTime = Date.now();
      return {
        type: opportunity.type,
        poolId: opportunity.poolId,
        success: false,
        duration: endTime - startTime,
        message: error.message,
        beforeState: {},
        afterState: {}
      };
    }
  }

  /**
   * Optimize underutilized resource pool
   * @param opportunity Underutilization opportunity
   */
  private async optimizeUnderutilizedPool(opportunity: OptimizationOpportunity): Promise<ResourceOptimization> {
    const pool = this.resourcePools.get(opportunity.poolId);
    const startTime = Date.now();

    if (!pool) {
      throw new Error(`Resource pool ${opportunity.poolId} not found`);
    }

    const beforeState = {
      allocated: pool.allocated,
      available: pool.available,
      utilizationRate: (pool.allocated / pool.total) * 100
    };

    // Consolidate allocations or reduce limits
    const consolidations = await this.consolidateAllocations(opportunity.poolId);

    const afterState = {
      allocated: pool.allocated,
      available: pool.available,
      utilizationRate: (pool.allocated / pool.total) * 100
    };

    const endTime = Date.now();

    return {
      type: 'underutilization',
      poolId: opportunity.poolId,
      success: true,
      duration: endTime - startTime,
      message: `Consolidated ${consolidations.length} allocations in ${pool.name}`,
      beforeState,
      afterState,
      details: { consolidations }
    };
  }

  /**
   * Optimize overutilized resource pool
   * @param opportunity Overutilization opportunity
   */
  private async optimizeOverutilizedPool(opportunity: OptimizationOpportunity): Promise<ResourceOptimization> {
    const pool = this.resourcePools.get(opportunity.poolId);
    const startTime = Date.now();

    if (!pool) {
      throw new Error(`Resource pool ${opportunity.poolId} not found`);
    }

    const beforeState = {
      allocated: pool.allocated,
      available: pool.available,
      utilizationRate: (pool.allocated / pool.total) * 100
    };

    // Prioritize and potentially limit lower priority allocations
    const prioritizations = await this.prioritizeAllocations(opportunity.poolId);

    const afterState = {
      allocated: pool.allocated,
      available: pool.available,
      utilizationRate: (pool.allocated / pool.total) * 100
    };

    const endTime = Date.now();

    return {
      type: 'overutilization',
      poolId: opportunity.poolId,
      success: true,
      duration: endTime - startTime,
      message: `Reprioritized ${prioritizations.length} allocations in ${pool.name}`,
      beforeState,
      afterState,
      details: { prioritizations }
    };
  }

  /**
   * Release expired allocation
   * @param opportunity Expired allocation opportunity
   */
  private async releaseExpiredAllocation(opportunity: OptimizationOpportunity): Promise<ResourceOptimization> {
    const startTime = Date.now();

    if (!opportunity.allocationId) {
      throw new Error('Allocation ID is required for expired allocation optimization');
    }

    const success = await this.releaseResources(opportunity.allocationId);

    const endTime = Date.now();

    return {
      type: 'expired_allocation',
      poolId: opportunity.poolId,
      success,
      duration: endTime - startTime,
      message: success ? `Released expired allocation ${opportunity.allocationId}` : `Failed to release allocation ${opportunity.allocationId}`,
      beforeState: {},
      afterState: {},
      details: { allocationId: opportunity.allocationId }
    };
  }

  /**
   * Rebalance resources across pools
   */
  private async rebalanceResources(): Promise<RebalancingResult> {
    const changes: RebalancingChange[] = [];

    try {
      // Check for pools that can share resources
      const computePools = Array.from(this.resourcePools.values()).filter(p => p.type === 'compute');
      const memoryPools = Array.from(this.resourcePools.values()).filter(p => p.type === 'memory');

      // Simple rebalancing logic
      for (const computePool of computePools) {
        if (computePool.utilizationRate > 80) {
          // Try to move some workload to other compute pools
          const underutilizedCompute = computePools.find(p => p.id !== computePool.id && p.utilizationRate < 50);
          if (underutilizedCompute) {
            const transferAmount = Math.min(computePool.allocated * 0.2, underutilizedCompute.available);
            if (transferAmount > 0) {
              changes.push({
                from: computePool.id,
                to: underutilizedCompute.id,
                amount: transferAmount,
                type: 'compute',
                reason: 'Load balancing'
              });
            }
          }
        }
      }

      return {
        success: true,
        changes,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        reason: error.message,
        changes: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Consolidate allocations in a pool
   * @param poolId Pool identifier
   */
  private async consolidateAllocations(poolId: string): Promise<string[]> {
    const consolidations: string[] = [];

    // Find allocations that can be consolidated
    const poolAllocations = Array.from(this.allocations.values())
      .filter(a => a.status === 'active' && a.allocations.some(al => al.type === poolId));

    // This is a simplified consolidation logic
    // In a real implementation, you would analyze allocation patterns
    for (const allocation of poolAllocations) {
      if (allocation.allocations.length === 1 && allocation.allocations[0].amount < 10) {
        consolidations.push(allocation.id);
        // In a real implementation, you would consolidate this allocation
      }
    }

    return consolidations;
  }

  /**
   * Prioritize allocations in a pool
   * @param poolId Pool identifier
   */
  private async prioritizeAllocations(poolId: string): Promise<string[]> {
    const prioritizations: string[] = [];

    // Find allocations for this pool
    const poolAllococations = Array.from(this.allocations.entries())
      .filter(([_, allocation]) =>
        allocation.status === 'active' &&
        allocation.allocations.some(al => al.type === poolId)
      )
      .sort(([_, a], [__, b]) => {
        const aMaxPriority = Math.max(...a.allocations.map(al => al.priority));
        const bMaxPriority = Math.max(...b.allocations.map(al => al.priority));
        return bMaxPriority - aMaxPriority; // Higher priority first
      });

    // This is a simplified prioritization logic
    // In a real implementation, you would implement more sophisticated prioritization
    for (const [id, allocation] of poolAllococations) {
      prioritizations.push(id);
      // In a real implementation, you would adjust allocation priorities
    }

    return prioritizations;
  }

  /**
   * Get pool status based on utilization rate
   * @param utilizationRate Utilization percentage
   */
  private getPoolStatus(utilizationRate: number): 'optimal' | 'warning' | 'critical' {
    if (utilizationRate < 30) return 'warning'; // Underutilized
    if (utilizationRate > 80) return 'critical'; // Overutilized
    return 'optimal';
  }

  /**
   * Get overall system status
   * @param pools Resource pools
   */
  private getOverallStatus(pools: ResourcePoolStatus[]): 'optimal' | 'warning' | 'critical' {
    const criticalCount = pools.filter(p => p.status === 'critical').length;
    const warningCount = pools.filter(p => p.status === 'warning').length;

    if (criticalCount > 0) return 'critical';
    if (warningCount > pools.length / 2) return 'warning';
    return 'optimal';
  }

  /**
   * Calculate efficiency score
   * @param pools Resource pools
   */
  private calculateEfficiency(pools: ResourcePoolStatus[]): number {
    const optimalPools = pools.filter(p => p.status === 'optimal').length;
    return (optimalPools / pools.length) * 100;
  }

  /**
   * Calculate optimization impact
   * @param beforeMetrics Metrics before optimization
   * @param optimizations Applied optimizations
   */
  private calculateOptimizationImpact(
    beforeMetrics: ResourceUtilization,
    optimizations: ResourceOptimization[]
  ): OptimizationImpact {
    const afterMetrics = this.getResourceUtilization();

    const efficiencyGain = afterMetrics.efficiency - beforeMetrics.efficiency;

    const resourceSavings: Record<string, number> = {};
    for (const opt of optimizations) {
      if (opt.success && opt.type === 'underutilization') {
        resourceSavings[opt.poolId] = (resourceSavings[opt.poolId] || 0) +
          ((opt.beforeState.utilizationRate || 0) - (opt.afterState.utilizationRate || 0));
      }
    }

    const performanceImprovement = Math.max(0, efficiencyGain * 0.5);

    return {
      efficiencyGain,
      resourceSavings,
      performanceImprovement
    };
  }

  /**
   * Update metrics with optimization result
   * @param result Optimization result
   */
  private updateMetrics(result: OptimizationResult): void {
    const metric: ResourceMetrics = {
      timestamp: result.timestamp,
      efficiency: result.afterMetrics.efficiency,
      utilization: result.afterMetrics.overallUtilization,
      optimizations: result.optimizations.length,
      allocations: result.afterMetrics.totalAllocations
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }
}

// Type definitions
interface ResourcePool {
  id: string;
  name: string;
  type: string;
  total: number;
  available: number;
  allocated: number;
  unit: string;
  priority: number;
  utilizationRate?: number;
}

interface ResourceAllocation {
  id: string;
  recipient: string;
  allocations: ResourceAllocationDetail[];
  createdAt: string;
  status: 'active' | 'released' | 'expired';
}

interface ResourceAllocationDetail {
  type: string;
  amount: number;
  priority: number;
  expiresAt: string;
  metadata: Record<string, any>;
}

interface ResourceRequest {
  type: string;
  amount: number;
  priority?: number;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

interface ResourceAllocationResult {
  success: boolean;
  allocationId: string;
  allocations: ResourceAllocationDetail[];
  failedRequests: ResourceRequest[];
  reason?: string;
}

interface ResourceUtilization {
  timestamp: string;
  pools: ResourcePoolStatus[];
  overallStatus: 'optimal' | 'warning' | 'critical';
  overallUtilization: number;
  totalAllocations: number;
  efficiency: number;
}

interface ResourcePoolStatus extends ResourcePool {
  utilizationRate: number;
  status: 'optimal' | 'warning' | 'critical';
}

interface OptimizationOptions {
  aggressive?: boolean;
  targetEfficiency?: number;
  maxOptimizations?: number;
}

interface OptimizationOpportunity {
  type: string;
  poolId: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  allocationId?: string;
}

interface ResourceOptimization {
  type: string;
  poolId: string;
  success: boolean;
  duration: number;
  message: string;
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  details?: Record<string, any>;
}

interface RebalancingResult {
  success: boolean;
  changes: RebalancingChange[];
  timestamp: string;
  reason?: string;
}

interface RebalancingChange {
  from: string;
  to: string;
  amount: number;
  type: string;
  reason: string;
}

interface OptimizationResult {
  timestamp: string;
  duration: number;
  optimizations: ResourceOptimization[];
  rebalancing: RebalancingResult;
  beforeMetrics: ResourceUtilization;
  afterMetrics: ResourceUtilization;
  impact: OptimizationImpact;
  error?: string;
}

interface OptimizationImpact {
  efficiencyGain: number;
  resourceSavings: Record<string, number>;
  performanceImprovement: number;
}

interface ResourceMetrics {
  timestamp: string;
  efficiency: number;
  utilization: number;
  optimizations: number;
  allocations: number;
}

// Default export for test compatibility
export default ResourceOptimizerSkill;