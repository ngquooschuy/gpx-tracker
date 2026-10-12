import React from 'react';
import { GPXFileItem, GPXWaypoint } from '../../types/gpx';

interface WaypointDetailModalProps {
  waypoint: GPXWaypoint | null;
  file: GPXFileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WaypointDetailModal: React.FC<WaypointDetailModalProps> = ({
  waypoint,
  file,
  isOpen,
  onClose
}) => {
  if (!isOpen || !waypoint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
              style={{ backgroundColor: file?.color || '#06b6d4' }}
            >
              ★
            </span>
            <h3 className="text-sm font-bold text-white truncate max-w-[280px]">
              {waypoint.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          {waypoint.desc && (
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 leading-relaxed">
              {waypoint.desc}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums">
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Vĩ độ (Lat)</span>
              <span className="text-slate-200 font-semibold">{waypoint.lat.toFixed(6)}°</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Kinh độ (Lng)</span>
              <span className="text-slate-200 font-semibold">{waypoint.lng.toFixed(6)}°</span>
            </div>
            {waypoint.ele !== undefined && (
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase font-sans">Độ cao</span>
                <span className="text-emerald-400 font-semibold">{Math.round(waypoint.ele)} m</span>
              </div>
            )}
            {waypoint.time && (
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block text-[9px] uppercase font-sans">Thời gian</span>
                <span className="text-slate-300 font-semibold">{waypoint.time.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {file && (
            <div className="text-[11px] text-slate-500 pt-1">
              Thuộc file: <span className="text-slate-400 font-medium">{file.fileName}</span>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
