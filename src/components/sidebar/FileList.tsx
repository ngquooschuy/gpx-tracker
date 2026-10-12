import React from 'react';
import { GPXFileItem } from '../../types/gpx';

interface FileListProps {
  files: GPXFileItem[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onToggleVisibility: (fileId: string) => void;
  onToggleWaypoints: (fileId: string) => void;
  onColorChange: (fileId: string, color: string) => void;
  onZoomToFile: (file: GPXFileItem) => void;
  onViewDetails: (file: GPXFileItem) => void;
  onLaunchFlyover: (file: GPXFileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onClearAll: () => void;
}

const PALETTE = [
  '#fc5200', // Strava orange
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#ef4444'  // red
];

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  onToggleVisibility,
  onToggleWaypoints,
  onColorChange,
  onZoomToFile,
  onViewDetails,
  onLaunchFlyover,
  onDeleteFile,
  onClearAll
}) => {
  if (files.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs">
        <p>Chưa có file GPX nào trong phiên làm việc.</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Tải lên file của bạn hoặc nạp mẫu hành trình có sẵn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Danh sách file ({files.length})</span>
        <button
          onClick={onClearAll}
          className="text-[11px] text-rose-400/90 hover:text-rose-300 transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="space-y-2">
        {files.map((file) => {
          const isSelected = selectedFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* File header row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Color selector dropdown / button */}
                  <div className="relative group">
                    <button
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm shrink-0"
                      style={{ backgroundColor: file.color }}
                      title="Đổi màu hiển thị"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="hidden group-hover:flex absolute left-0 top-5 bg-slate-900 border border-slate-700 p-1.5 rounded-lg shadow-2xl gap-1 z-30">
                      {PALETTE.map((c) => (
                        <button
                          key={c}
                          onClick={(e) => {
                            e.stopPropagation();
                            onColorChange(file.id, c);
                          }}
                          className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-100 truncate" title={file.fileName}>
                    {file.fileName}
                  </span>
                </div>

                {/* Visibility and Zoom Controls */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Zoom to file button */}
                  <button
                    onClick={() => onZoomToFile(file)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 transition-colors"
                    title="Căn bản đồ đến file này"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  {/* Toggle eye */}
                  <button
                    onClick={() => onToggleVisibility(file.id)}
                    className={`p-1 rounded transition-colors ${
                      file.visible
                        ? 'text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/60'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={file.visible ? 'Ẩn file này' : 'Hiện file này'}
                  >
                    {file.visible ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Delete file */}
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                    title="Xóa khỏi phiên làm việc"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Metrics preview row */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 font-mono tabular-nums bg-slate-950/50 p-2 rounded-lg border border-slate-800/80 mb-2">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-sans">Quãng đường</div>
                  <div className="font-semibold text-cyan-300">{file.stats.totalDistanceKm} km</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-sans">Độ cao tăng</div>
                  <div className="font-semibold text-emerald-400">
                    {file.stats.elevationGainM !== null ? `+${file.stats.elevationGainM}m` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider font-sans">Tốc độ TB</div>
                  <div className="font-semibold text-amber-300">
                    {file.stats.avgSpeedKmh ? `${file.stats.avgSpeedKmh} km/h` : '—'}
                  </div>
                </div>
              </div>

              {/* Sub-controls: Waypoint count, 3D Strava Flyover CTA & Details CTA */}
              <div
                className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLaunchFlyover(file)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fc5200]/15 hover:bg-[#fc5200]/25 text-orange-400 border border-[#fc5200]/30 font-semibold text-[10px] transition-colors"
                    title="Mở giả lập 3D góc nhìn Strava"
                  >
                    <span>▶ Giả lập 3D</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {file.waypoints.length > 0 && (
                    <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200 text-[10px]">
                      <input
                        type="checkbox"
                        checked={file.showWaypoints}
                        onChange={() => onToggleWaypoints(file.id)}
                        className="rounded accent-cyan-500 scale-90"
                      />
                      <span>{file.waypoints.length} wpt</span>
                    </label>
                  )}

                  <button
                    onClick={() => onViewDetails(file)}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium transition-colors"
                  >
                    Chi tiết →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
