import React, { useMemo } from 'react';
import { GPXFileItem } from '../../types/gpx';
import { exportStatsToCSV, triggerFileDownload } from '../../services/gpxExporter';

interface OverallStatsProps {
  files: GPXFileItem[];
}

export const OverallStats: React.FC<OverallStatsProps> = ({ files }) => {
  const visibleFiles = useMemo(() => files.filter((f) => f.visible), [files]);

  const summary = useMemo(() => {
    let totalDist = 0;
    let totalGain = 0;
    let totalPoints = 0;
    let totalTracks = 0;
    let totalRoutes = 0;
    let totalWaypoints = 0;
    let totalMovingSec = 0;
    let totalDurationSec = 0;
    let filesWithEle = 0;

    visibleFiles.forEach((f) => {
      totalDist += f.stats.totalDistanceKm;
      if (f.stats.elevationGainM !== null) {
        totalGain += f.stats.elevationGainM;
        filesWithEle++;
      }
      totalPoints += f.stats.totalPointsCount;
      totalTracks += f.stats.trackCount;
      totalRoutes += f.stats.routeCount;
      totalWaypoints += f.stats.waypointCount;
      if (f.stats.movingDurationSeconds) totalMovingSec += f.stats.movingDurationSeconds;
      if (f.stats.totalDurationSeconds) totalDurationSec += f.stats.totalDurationSeconds;
    });

    const avgSpeed =
      totalMovingSec > 0 && totalDist > 0
        ? parseFloat(((totalDist / (totalMovingSec / 3600))).toFixed(1))
        : null;

    return {
      totalDist: parseFloat(totalDist.toFixed(2)),
      totalGain,
      filesWithEle,
      totalPoints,
      totalTracks,
      totalRoutes,
      totalWaypoints,
      totalMovingSec,
      totalDurationSec,
      avgSpeed
    };
  }, [visibleFiles]);

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}g ${mins}p`;
    return `${mins} phút`;
  };

  const handleExportCSV = () => {
    if (visibleFiles.length === 0) return;
    const csv = exportStatsToCSV(visibleFiles);
    triggerFileDownload(csv, `VietMap_GPX_ThongKe_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  if (visibleFiles.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs">
        Bật hiển thị ít nhất 1 file GPX để xem thống kê tổng quan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 2x2 Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-2 text-slate-100">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Tổng quãng đường
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
            {summary.totalDist} <span className="text-xs font-sans text-slate-400">km</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Tổng độ cao leo
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            +{summary.totalGain} <span className="text-xs font-sans text-slate-400">m</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Thời gian di chuyển
          </div>
          <div className="text-base font-bold font-mono text-amber-300 mt-1 tabular-nums">
            {summary.totalMovingSec > 0 ? formatSeconds(summary.totalMovingSec) : '—'}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Tốc độ trung bình
          </div>
          <div className="text-base font-bold font-mono text-indigo-300 mt-1 tabular-nums">
            {summary.avgSpeed ? `${summary.avgSpeed} km/h` : '—'}
          </div>
        </div>
      </div>

      {/* Secondary entities count breakdown */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Số file đang hiển thị</span>
          <span className="font-mono text-slate-200 tabular-nums">{visibleFiles.length} file</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Tổng số Track / Route</span>
          <span className="font-mono text-slate-200 tabular-nums">
            {summary.totalTracks} track / {summary.totalRoutes} route
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Tổng số Waypoint</span>
          <span className="font-mono text-slate-200 tabular-nums">{summary.totalWaypoints} điểm</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Tổng điểm GPS ghi nhận</span>
          <span className="font-mono text-slate-200 tabular-nums">{summary.totalPoints.toLocaleString()} điểm</span>
        </div>
      </div>

      {/* Export CSV action button */}
      <button
        onClick={handleExportCSV}
        className="w-full py-2 px-3 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
      >
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Xuất bảng thống kê CSV</span>
      </button>
    </div>
  );
};
