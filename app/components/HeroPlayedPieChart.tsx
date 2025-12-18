"use client";

import { HERO_COLORS, HERO_ROLES } from './heroRoles';
import { createArc, capitalizeWords, PieSlice } from './pieChartUtils';
import PieChart from './PieChart';

interface HeroSummary { hero_name: string; matches: number }
interface HeroPlayedPieChartProps {
  heroes: HeroSummary[];
  filterRole?: 'Vanguard' | 'Duelist' | 'Strategist' | null;
}

export default function HeroPlayedPieChart({ heroes, filterRole = null }: HeroPlayedPieChartProps) {
  // Count occurrences of each hero
  const heroCounts: Record<string, number> = {};

  heroes?.forEach((entry) => {
    const heroName = entry?.hero_name;
    const matches = Number(entry?.matches) || 0;
    if (heroName && matches > 0) {
      const normalizedName = heroName.toLowerCase();
      if (filterRole && HERO_ROLES[normalizedName] !== filterRole) return;
      heroCounts[normalizedName] = (heroCounts[normalizedName] || 0) + matches;
    }
  });

  const heroEntries = Object.entries(heroCounts).sort((a, b) => b[1] - a[1]);
  const total = heroEntries.reduce((sum, [_, count]) => sum + count, 0);

  // Get hero-specific color
  const getHeroColor = (heroName: string, index: number) => {
    const heroColor = HERO_COLORS[heroName];
    if (heroColor) {
      return heroColor;
    }
    // Fallback colors if hero not in mapping
    const fallbackColors = ['#9333EA', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];
    return fallbackColors[index % fallbackColors.length];
  };

  // Build slices array
  let currentAngle = 0;
  const slices: PieSlice[] = heroEntries.map(([heroName, count], index) => {
    const angle = (count / total) * 360;
    const percent = (count / total) * 100;
    const slice = {
      label: capitalizeWords(heroName),
      path: createArc(currentAngle, currentAngle + angle),
      color: getHeroColor(heroName, index),
      count: count,
      percent: percent,
    };
    currentAngle += angle;
    return slice;
  });

  return <PieChart title="Heroes Played" slices={slices} total={total} legendLayout="grid" />;
}
