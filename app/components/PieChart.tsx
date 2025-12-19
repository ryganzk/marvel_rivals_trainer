"use client";

import { PieSlice } from './pieChartUtils';
import { useMemo } from 'react';

interface PieChartProps {
  title: string;
  slices: PieSlice[];
  total: number;
  legendLayout?: 'single' | 'grid';
  selectedLabel?: string | null;
  onSliceClick?: (label: string) => void;
}

const pieAnimationStyles = `
  @keyframes pieSliceFill {
    from {
      transform: scale(0);
      opacity: 0;
      transform-origin: 100px 100px;
    }
    to {
      transform: scale(1);
      opacity: 1;
      transform-origin: 100px 100px;
    }
  }
  
  .pie-slice {
    animation: pieSliceFill 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transform-origin: 100px 100px;
  }
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pieAnimationStyles;
  document.head.appendChild(style);
}

export default function PieChart({
  title,
  slices,
  total,
  legendLayout = 'single',
  selectedLabel,
  onSliceClick,
}: PieChartProps) {
  // Generate a key based on slices data to trigger re-animation when data changes
  const chartKey = useMemo(() => {
    return slices.map(s => s.label + s.count).join('|');
  }, [slices]);
  if (slices.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-800 border border-gray-700 rounded-md">
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-400">No History</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gray-800 border border-gray-700 rounded-md">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg key={chartKey} width="200" height="200" viewBox="0 0 200 200">
            {slices.map((slice, index) => {
              return (
                <path
                  key={index}
                  d={slice.path}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="2"
                  className={`pie-slice ${onSliceClick ? 'cursor-pointer' : ''} ${selectedLabel && slice.label !== selectedLabel ? 'opacity-40' : 'hover:opacity-100'}`}
                  style={{ 
                    animationDelay: `${index * 0.08}s`
                  }}
                  onClick={onSliceClick ? () => onSliceClick(slice.label) : undefined}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-grow">
          <div className={legendLayout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'flex flex-col gap-3'}>
            {slices.map((slice, index) => (
              <button
                key={index}
                type="button"
                onClick={onSliceClick ? () => onSliceClick(slice.label) : undefined}
                className={`flex items-center gap-3 text-left ${onSliceClick ? 'cursor-pointer' : ''} ${selectedLabel && slice.label !== selectedLabel ? 'opacity-60' : ''}`}
              >
                <div
                  className={legendLayout === 'grid' ? 'w-3 h-3 rounded-sm flex-shrink-0' : 'w-4 h-4 rounded-sm flex-shrink-0'}
                  style={{ backgroundColor: slice.color }}
                />
                <div className="flex-grow min-w-0">
                  <span className={`text-white ${legendLayout === 'grid' ? 'text-sm font-medium' : 'font-semibold'}`}>
                    {slice.label}
                  </span>
                  <span className={`text-gray-400 ${legendLayout === 'grid' ? 'text-xs ml-1' : 'text-sm ml-2'}`}>
                    {slice.count} match{slice.count !== 1 ? 'es' : ''} ({slice.percent.toFixed(1)}%)
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="text-gray-400 text-sm">
              Total: {total} match{total !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
