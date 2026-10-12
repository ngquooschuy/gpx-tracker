import React, { useMemo, useRef, useState } from 'react';
import { GPXFileItem, GPXPoint } from '../../types/gpx';

interface ElevationChartProps {
  file: GPXFileItem | null;
  activePoint: GPXPoint | null;
  onPointHover: (point: GPXPoint | null) => void;
  onPointClick: (point: GPXPoint) => void;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({
  file,
  activePoint,
  onPointHover,
  onPointClick
}) => {
  const [metricMode, setMetricMode] = useState<'elevation' | 'speed'>('elevation');
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Flatten all track points sequentially for the active file
  const points = useMemo(() => {
    if (!file) return [];
    const pts: GPXPoint[] = [];
    file.tracks.forEach((track) => {
      track.segments.forEach((seg) => {
        seg.points.forEach((p) => pts.push(p));
      });
    });
    // If no tracks, fallback to routes
    if (pts.length === 0) {
      file.routes.forEach((route) => {
        route.points.forEach((p) => pts.push(p));
      });
    }
    return pts;
  }, [file]);

  const hasElevationData = useMemo(() => {
    return points.some((p) => p.ele !== undefined && !isNaN(p.ele));
  }, [points]);

  const hasSpeedData = useMemo(() => {
    return points.some((p) => p.speedCalc !== undefined && !isNaN(p.speedCalc));
  }, [points]);

  // Compute scale boundaries
  const chartData = useMemo(() => {
    if (points.length < 2) return null;

    const totalDistM = points[points.length - 1].distanceFromStart || 1;
    const totalDistKm = totalDistM / 1000;

    // Elevation extents
    let minEle = Infinity;
    let maxEle = -Infinity;
    // Speed extents
    let minSpd = 0;
    let maxSpd = 0;

    points.forEach((p) => {
      if (p.ele !== undefined) {
        minEle = Math.min(minEle, p.ele);
        maxEle = Math.max(maxEle, p.ele);
      }
      if (p.speedCalc !== undefined) {
        maxSpd = Math.max(maxSpd, p.speedCalc);
      }
    });

    if (minEle === Infinity) {
      minEle = 0;
      maxEle = 100;
    }
    // Add 5% padding to elevation range
    const elePadding = Math.max(10, (maxEle - minEle) * 0.08);
    const yMinEle = Math.floor(Math.max(0, minEle - elePadding));
    const yMaxEle = Math.ceil(maxEle + elePadding);

    const yMaxSpd = Math.max(20, Math.ceil(maxSpd * 1.15));

    return {
      totalDistKm,
      minEle,
      maxEle,
      yMinEle,
      yMaxEle,
      yMaxSpd
    };
  }, [points]);

  if (!file || points.length < 2 || !chartData || (!hasElevationData && !hasSpeedData)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
        <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <span>Chọn một file GPX có dữ liệu độ cao hoặc tốc độ để xem biểu đồ phân tích</span>
      </div>
    );
  }

  // Chart coordinates calculation
  const width = 800;
  const height = 180;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const isElevation = metricMode === 'elevation' || !hasSpeedData;
  const yMin = isElevation ? chartData.yMinEle : 0;
  const yMax = isElevation ? chartData.yMaxEle : chartData.yMaxSpd;

  const getX = (distM: number) => {
    const fraction = distM / (chartData.totalDistKm * 1000);
    return paddingLeft + fraction * chartW;
  };

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const fraction = (clamped - yMin) / (yMax - yMin || 1);
    return paddingTop + chartH - fraction * chartH;
  };

  // Generate SVG path points
  const pathD = points
    .map((pt, idx) => {
      const x = getX(pt.distanceFromStart || 0);
      const val = isElevation ? pt.ele ?? yMin : pt.speedCalc ?? 0;
      const y = getY(val);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaD = `${pathD} L ${(paddingLeft + chartW).toFixed(1)} ${(
    paddingTop + chartH
  ).toFixed(1)} L ${paddingLeft.toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`;

  // Handle Mouse Scrubbing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    if (mouseX < paddingLeft || mouseX > paddingLeft + chartW) {
      setHoverIndex(null);
      onPointHover(null);
      return;
    }

    const distFraction = (mouseX - paddingLeft) / chartW;
    const targetDistM = distFraction * chartData.totalDistKm * 1000;

    // Binary search or linear search closest point
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < points.length; i++) {
      const diff = Math.abs((points[i].distanceFromStart || 0) - targetDistM);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    setHoverIndex(closestIdx);
    onPointHover(points[closestIdx]);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    onPointHover(null);
  };

  const handleClick = () => {
    if (hoverIndex !== null && points[hoverIndex]) {
      onPointClick(points[hoverIndex]);
    }
  };

  const activeHoverPoint = hoverIndex !== null ? points[hoverIndex] : activePoint;
  const hoverX = activeHoverPoint
    ? getX(activeHoverPoint.distanceFromStart || 0)
    : null;
  const hoverY = activeHoverPoint
    ? getY(
        isElevation
          ? activeHoverPoint.ele ?? yMin
          : activeHoverPoint.speedCalc ?? 0
      )
    : null;

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 text-slate-200">
      {/* Header controls for chart */}
      <div className="flex items-center justify-between px-2 pt-1 pb-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: file.color }}
            />
            <span className="text-xs font-semibold text-slate-100 truncate max-w-xs">
              {file.fileName}
            </span>
          </div>

          {/* Mode Switcher */}
          {hasSpeedData && (
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
              <button
                onClick={() => setMetricMode('elevation')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  metricMode === 'elevation'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Độ cao (m)
              </button>
              <button
                onClick={() => setMetricMode('speed')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  metricMode === 'speed'
                    ? 'bg-amber-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tốc độ (km/h)
              </button>
            </div>
          )}
        </div>

        {/* Real-time Hover Scrubber Metrics */}
        {activeHoverPoint ? (
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-300">
            <div>
              <span className="text-slate-500">Km:</span>{' '}
              <span className="text-cyan-300 font-semibold">
                {((activeHoverPoint.distanceFromStart || 0) / 1000).toFixed(2)}
              </span>
            </div>
            {activeHoverPoint.ele !== undefined && (
              <div>
                <span className="text-slate-500">Độ cao:</span>{' '}
                <span className="text-emerald-300 font-semibold">
                  {Math.round(activeHoverPoint.ele)}m
                </span>
              </div>
            )}
            {activeHoverPoint.speedCalc !== undefined && (
              <div>
                <span className="text-slate-500">Tốc độ:</span>{' '}
                <span className="text-amber-300 font-semibold">
                  {activeHoverPoint.speedCalc.toFixed(1)} km/h
                </span>
              </div>
            )}
            {activeHoverPoint.grade !== undefined && (
              <div>
                <span className="text-slate-500">Dốc:</span>{' '}
                <span
                  className={
                    activeHoverPoint.grade > 0
                      ? 'text-rose-400'
                      : 'text-teal-400'
                  }
                >
                  {activeHoverPoint.grade > 0 ? '+' : ''}
                  {activeHoverPoint.grade.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 italic">
            Rê chuột vào biểu đồ để đối chiếu vị trí trên bản đồ
          </div>
        )}
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative flex-1 w-full min-h-[120px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair overflow-visible"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#065f46" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft + chartW}
            y2={paddingTop}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + chartH / 2}
            x2={paddingLeft + chartW}
            y2={paddingTop + chartH / 2}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + chartH}
            x2={paddingLeft + chartW}
            y2={paddingTop + chartH}
            stroke="#334155"
          />

          {/* Y Axis Labels */}
          <text
            x={paddingLeft - 8}
            y={paddingTop + 4}
            textAnchor="end"
            fontSize="10"
            fill="#64748b"
            className="font-mono tabular-nums"
          >
            {yMax} {isElevation ? 'm' : 'km/h'}
          </text>
          <text
            x={paddingLeft - 8}
            y={paddingTop + chartH / 2 + 4}
            textAnchor="end"
            fontSize="10"
            fill="#64748b"
            className="font-mono tabular-nums"
          >
            {Math.round((yMax + yMin) / 2)}
          </text>
          <text
            x={paddingLeft - 8}
            y={paddingTop + chartH}
            textAnchor="end"
            fontSize="10"
            fill="#64748b"
            className="font-mono tabular-nums"
          >
            {yMin}
          </text>

          {/* X Axis Labels */}
          <text
            x={paddingLeft}
            y={height - 8}
            textAnchor="start"
            fontSize="10"
            fill="#64748b"
            className="font-mono tabular-nums"
          >
            0 km
          </text>
          <text
            x={paddingLeft + chartW / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
            className="font-mono tabular-nums"
          >
            {(chartData.totalDistKm / 2).toFixed(1)} km
          </text>
          <text
            x={paddingLeft + chartW}
            y={height - 8}
            textAnchor="end"
            fontSize="10"
            fill="#64748b"
            className="font-mono tabular-nums"
          >
            {chartData.totalDistKm.toFixed(1)} km
          </text>

          {/* Area Fill */}
          <path
            d={areaD}
            fill={isElevation ? 'url(#elevationGrad)' : 'url(#speedGrad)'}
          />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={isElevation ? '#34d399' : '#fbbf24'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scrubbing Crosshair & Dot */}
          {hoverX !== null && hoverY !== null && (
            <g>
              {/* Vertical Guide Line */}
              <line
                x1={hoverX}
                y1={paddingTop}
                x2={hoverX}
                y2={paddingTop + chartH}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Circle Marker */}
              <circle
                cx={hoverX}
                cy={hoverY}
                r="5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
