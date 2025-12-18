"use client";

import { HERO_ROLES, ROLE_COLORS } from './heroRoles';
import { createArc, PieSlice } from './pieChartUtils';
import PieChart from './PieChart';

interface HeroSummary { hero_name: string; matches: number }
interface HeroRolePieChartProps {
  heroes: HeroSummary[];
  selectedRole?: 'Vanguard' | 'Duelist' | 'Strategist' | null;
  onSelectRole?: (role: 'Vanguard' | 'Duelist' | 'Strategist' | null) => void;
}

export default function HeroRolePieChart({ heroes, selectedRole = null, onSelectRole }: HeroRolePieChartProps) {
  // Count occurrences of each role
  const roleCounts = {
    Vanguard: 0,
    Duelist: 0,
    Strategist: 0,
  };

  heroes?.forEach((entry) => {
    const heroName = entry?.hero_name;
    const count = Number(entry?.matches) || 0;
    if (heroName && count > 0) {
      const role = HERO_ROLES[heroName.toLowerCase() as string];
      if (role) {
        roleCounts[role] += count;
      }
    }
  });

  const total = roleCounts.Vanguard + roleCounts.Duelist + roleCounts.Strategist;

  // Build slices array
  let currentAngle = 0;
  const slices: PieSlice[] = [];

  const roles: Array<{ role: 'Vanguard' | 'Duelist' | 'Strategist', count: number }> = [
    { role: 'Vanguard', count: roleCounts.Vanguard },
    { role: 'Duelist', count: roleCounts.Duelist },
    { role: 'Strategist', count: roleCounts.Strategist },
  ];

  roles.forEach(({ role, count }) => {
    if (count > 0) {
      const angle = (count / total) * 360;
      const percent = (count / total) * 100;
      slices.push({
        label: role,
        path: createArc(currentAngle, currentAngle + angle),
        color: ROLE_COLORS[role],
        count: count,
        percent: percent,
      });
      currentAngle += angle;
    }
  });

  const handleSliceClick = (role: string) => {
    if (!onSelectRole) return;
    // Toggle: clicking again clears selection
    if (selectedRole === role) {
      onSelectRole(null);
    } else {
      onSelectRole(role as 'Vanguard' | 'Duelist' | 'Strategist');
    }
  };

  return (
    <PieChart
      title="Hero Role Distribution"
      slices={slices}
      total={total}
      legendLayout="single"
      selectedLabel={selectedRole || undefined}
      onSliceClick={handleSliceClick}
    />
  );
}
