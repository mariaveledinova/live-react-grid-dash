
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
  width = 96,
  height = 48
}) => {
  if (!data || data.length < 2) {
    return <div className="w-full h-full bg-gray-100 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points.split(' ').map((point, index) => 
    index === 0 ? `M ${point}` : `L ${point}`
  ).join(' ')}`;

  return (
    <div className="w-full h-full bg-gray-50 rounded p-1">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill={`url(#gradient-${color.replace('#', '')})`}
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Last point indicator */}
        <circle
          cx={data.length > 1 ? ((data.length - 1) / (data.length - 1)) * width : width / 2}
          cy={data.length > 1 ? height - ((data[data.length - 1] - min) / range) * height : height / 2}
          r="2"
          fill={color}
        />
      </svg>
    </div>
  );
};
