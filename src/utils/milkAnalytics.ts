import { Buffalo, MilkProduction } from '@/types';

export interface MilkAnalytics {
  totalCapacity: number;
  healthyCapacity: number;
  actualProduction: number;
  capacityUtilization: number;
  efficiency: number;
  projectedWeekly: number;
  projectedMonthly: number;
  underperformingBuffaloes: Buffalo[];
  topProducers: Buffalo[];
}

export class MilkAnalyticsCalculator {
  static calculateAnalytics(
    buffaloes: Buffalo[],
    productions: MilkProduction[] = []
  ): MilkAnalytics {
    // Calculate total capacity
    const totalCapacity = buffaloes.reduce(
      (sum, buffalo) => sum + (buffalo.milkCapacity || 0),
      0
    );

    // Calculate healthy buffalo capacity
    const healthyBuffaloes = buffaloes.filter(b => b.healthStatus === 'healthy');
    const healthyCapacity = healthyBuffaloes.reduce(
      (sum, buffalo) => sum + (buffalo.milkCapacity || 0),
      0
    );

    // Calculate actual production (recent average)
    const recentProductions = productions.slice(-7); // Last 7 days
    const actualProduction = recentProductions.length > 0
      ? recentProductions.reduce((sum, prod) => sum + (prod.totalProduced || 0), 0) / recentProductions.length
      : 0;

    // Calculate capacity utilization
    const capacityUtilization = totalCapacity > 0 
      ? (actualProduction / totalCapacity) * 100 
      : 0;

    // Calculate efficiency (actual vs healthy capacity)
    const efficiency = healthyCapacity > 0 
      ? (actualProduction / healthyCapacity) * 100 
      : 0;

    // Calculate projections
    const projectedWeekly = actualProduction * 7;
    const projectedMonthly = actualProduction * 30;

    // Identify underperforming and top producing buffaloes
    const avgCapacityPerBuffalo = totalCapacity / (buffaloes.length || 1);
    const underperformingBuffaloes = buffaloes.filter(
      buffalo => (buffalo.milkCapacity || 0) < avgCapacityPerBuffalo * 0.7
    );
    const topProducers = buffaloes
      .filter(buffalo => buffalo.healthStatus === 'healthy')
      .sort((a, b) => (b.milkCapacity || 0) - (a.milkCapacity || 0))
      .slice(0, 3);

    return {
      totalCapacity: Math.round(totalCapacity * 10) / 10,
      healthyCapacity: Math.round(healthyCapacity * 10) / 10,
      actualProduction: Math.round(actualProduction * 10) / 10,
      capacityUtilization: Math.round(capacityUtilization * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      projectedWeekly: Math.round(projectedWeekly * 10) / 10,
      projectedMonthly: Math.round(projectedMonthly * 10) / 10,
      underperformingBuffaloes,
      topProducers,
    };
  }

  static getProductionInsights(analytics: MilkAnalytics): string[] {
    const insights: string[] = [];

    if (analytics.capacityUtilization < 70) {
      insights.push(`Capacity utilization is ${analytics.capacityUtilization}% - consider optimizing production`);
    }

    if (analytics.efficiency > 90) {
      insights.push('Excellent efficiency! Your healthy buffaloes are performing optimally');
    } else if (analytics.efficiency < 60) {
      insights.push('Low efficiency detected - consider health checkups and nutrition optimization');
    }

    if (analytics.underperformingBuffaloes.length > 0) {
      insights.push(`${analytics.underperformingBuffaloes.length} buffalo(es) may need attention`);
    }

    if (analytics.totalCapacity > 0 && analytics.actualProduction > analytics.totalCapacity * 0.8) {
      insights.push('Great job! Production is close to maximum capacity');
    }

    return insights;
  }

  static calculateRevenuePotential(
    analytics: MilkAnalytics,
    pricePerLiter: number = 60
  ): {
    currentDaily: number;
    potentialDaily: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    potentialIncrease: number;
  } {
    const currentDaily = analytics.actualProduction * pricePerLiter;
    const potentialDaily = analytics.totalCapacity * pricePerLiter;
    const weeklyRevenue = analytics.projectedWeekly * pricePerLiter;
    const monthlyRevenue = analytics.projectedMonthly * pricePerLiter;
    const potentialIncrease = potentialDaily - currentDaily;

    return {
      currentDaily: Math.round(currentDaily),
      potentialDaily: Math.round(potentialDaily),
      weeklyRevenue: Math.round(weeklyRevenue),
      monthlyRevenue: Math.round(monthlyRevenue),
      potentialIncrease: Math.round(potentialIncrease),
    };
  }
}
