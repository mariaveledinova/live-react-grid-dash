
import React from 'react';

interface SparklineChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color,
  width = 120,
  height = 40
}) => {
  if (!data || data.length < 2) {
    return <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
      <span className="text-xs text-gray-400">No data</span>
    </div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`
  ).join(' ');

  // Create fill path
  const fillPath = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-full">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <path
          d={fillPath}
          fill={`url(#gradient-${color.replace('#', '')})`}
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
