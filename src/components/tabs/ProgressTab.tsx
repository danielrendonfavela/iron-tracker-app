import React, { useState, useMemo } from 'react';
import { Target, LineChart } from 'lucide-react';
import { Workout } from '../../types/gym';

interface ProgressTabProps {
  exercises: string[];
  workouts: Workout[];
}

interface DataPoint {
  dateStr: string;
  timestamp: number;
  maxWeight: number;
  x?: number;
  y?: number;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({ exercises, workouts }) => {
  const [selectedEx, setSelectedEx] = useState(exercises[0] || '');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const chartData = useMemo<DataPoint[]>(() => {
    return workouts
      .filter(w => w.exerciseName === selectedEx)
      .map(w => {
        const maxW = Math.max(
          ...w.blocks.map(b =>
            b.unit === 'lb' ? Number(b.weight) / 2.20462 : Number(b.weight)
          ),
          0
        );
        return {
          dateStr: w.date,
          timestamp: w.timestamp,
          maxWeight: parseFloat(maxW.toFixed(1))
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-15);
  }, [selectedEx, workouts]);

  const SVG_W = 400;
  const SVG_H = 220;
  const PADDING_X = 25;
  const PADDING_Y = 30;

  const chartInfo = useMemo(() => {
    if (chartData.length < 2) return null;

    const weights = chartData.map(d => d.maxWeight);
    const maxVal = Math.max(...weights);
    const minVal = Math.min(...weights);
    const range = maxVal - minVal || maxVal * 0.2 || 10;

    const adjustedMax = maxVal + range * 0.1;
    const adjustedMin = Math.max(0, minVal - range * 0.1);
    const adjustedRange = adjustedMax - adjustedMin;

    const points: DataPoint[] = chartData.map((d, i) => ({
      ...d,
      x: PADDING_X + (i / (chartData.length - 1)) * (SVG_W - 2 * PADDING_X),
      y: SVG_H - PADDING_Y - ((d.maxWeight - adjustedMin) / adjustedRange) * (SVG_H - 2 * PADDING_Y)
    }));

    const linePath =
      `M ${points[0].x},${points[0].y} ` +
      points.map(p => `L ${p.x},${p.y}`).join(' ');

    const areaPath = `${linePath} L ${points[points.length - 1].x},${SVG_H - PADDING_Y} L ${
      points[0].x
    },${SVG_H - PADDING_Y} Z`;

    return { points, linePath, areaPath, maxVal, minVal };
  }, [chartData]);

  return (
    <div className="space-y-4 animate-in fade-in pb-8">
      <div className="bg-zinc-950 p-5 border-2 border-zinc-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-xs font-black text-red-600 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> CURVA DE PROGRESO DE FUERZA (PESO MÁXIMO)
        </h2>

        <div className="relative z-10 mb-6">
          <select
            value={selectedEx}
            onChange={e => setSelectedEx(e.target.value)}
            className="w-full bg-black border-2 border-zinc-800 p-4 text-xs font-black text-white outline-none focus:border-red-600 uppercase"
          >
            {exercises.map(ex => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        {chartData.length < 2 ? (
          <div className="h-56 flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-800 text-zinc-600 bg-black/50 z-10 relative">
            <LineChart className="w-10 h-10 mb-3 opacity-50 text-red-600" />
            <span className="text-xs font-black tracking-widest text-center uppercase">
              SE REQUIEREN AL MENOS 2 REGISTROS EN ESTE EJERCICIO PARA RENDERIZAR LA GRÁFICA.
            </span>
          </div>
        ) : (
          chartInfo && (
            <div className="relative w-full h-[250px] bg-black border border-zinc-800 pt-4 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]">
              {hoveredPoint && hoveredPoint.x !== undefined && hoveredPoint.y !== undefined && (
                <div
                  className="absolute z-50 transform -translate-x-1/2 -translate-y-[120%] pointer-events-none"
                  style={{
                    left: `${(hoveredPoint.x / SVG_W) * 100}%`,
                    top: `${(hoveredPoint.y / SVG_H) * 100}%`
                  }}
                >
                  <div className="bg-zinc-900 border border-red-500/80 p-2 text-center backdrop-blur-md shadow-lg">
                    <p className="text-[10px] text-red-400 font-bold mb-0.5">{hoveredPoint.dateStr}</p>
                    <p className="text-base font-black text-white">
                      {hoveredPoint.maxWeight} <span className="text-xs text-red-500">KG</span>
                    </p>
                  </div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-900 mx-auto" />
                </div>
              )}

              <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {[0, 0.5, 1].map((ratio, i) => {
                  const y = PADDING_Y + ratio * (SVG_H - 2 * PADDING_Y);
                  return (
                    <g key={i}>
                      <line
                        x1={PADDING_X}
                        y1={y}
                        x2={SVG_W - PADDING_X}
                        y2={y}
                        stroke="#27272a"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      {(i === 0 || i === 2) && (
                        <text
                          x={PADDING_X}
                          y={y - 5}
                          fill="#52525b"
                          fontSize="8"
                          fontWeight="bold"
                          className="font-mono"
                        >
                          {i === 0 ? chartInfo.maxVal : chartInfo.minVal} KG
                        </text>
                      )}
                    </g>
                  );
                })}

                <path d={chartInfo.areaPath} fill="url(#areaGlow)" />
                <path
                  d={chartInfo.linePath}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  filter="url(#neonGlow)"
                />

                {chartInfo.points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onTouchStart={() => setHoveredPoint(p)}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint === p ? '5.5' : '3.5'}
                      fill="#ffffff"
                      stroke="#dc2626"
                      strokeWidth="2"
                      filter="url(#neonGlow)"
                      className="pointer-events-none transition-all"
                    />
                    <text
                      x={p.x}
                      y={SVG_H - 8}
                      fill={hoveredPoint === p ? '#ef4444' : '#52525b'}
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {p.dateStr.split(' ')[0]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )
        )}
      </div>
    </div>
  );
};
