import React, { useState } from 'react';
import { GPXFileItem } from '../../types/gpx';
import { exportToGeoJSON, triggerFileDownload } from '../../services/gpxExporter';

interface TrackDetailsModalProps {
  file: GPXFileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusWaypoint?: (lat: number, lng: number) => void;
  onLaunchFlyover?: (file: GPXFileItem) => void;
}

export const TrackDetailsModal: React.FC<TrackDetailsModalProps> = ({
  file,
  isOpen,
  onClose,
  onFocusWaypoint,
  onLaunchFlyover
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'waypoints' | 'tracks'>('stats');

  if (!isOpen || !file) return null;

  const s = file.stats;

  const handleDownloadOriginal = () => {
    if (file.rawXml) {
      triggerFileDownload(file.rawXml, file.fileName, 'application/gpx+xml');
    }
  };

  const handleExportGeoJSON = () => {
    const geojson = exportToGeoJSON(file);
    const baseName = file.fileName.replace(/\.gpx$/i, '');
    triggerFileDownload(geojson, `${baseName}.geojson`, 'application/geo+json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: file.color }}
            />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {file.fileName}
              </h3>
              <p className="text-[11px] text-slate-400">
                {file.creator ? `Tạo bởi: ${file.creator} · ` : ''}
                {(file.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'stats'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chỉ số chi tiết
          </button>
          <button
            onClick={() => setActiveTab('waypoints')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'waypoints'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Waypoints ({file.waypoints.length})
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'tracks'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đoạn Track ({file.tracks.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-4 text-xs">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Detailed Metrics Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    Tổng Quãng Đường
                  </span>
                  <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                    {s.totalDistanceKm} km
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    Độ cao Leo (Ascent)
                  </span>
                  <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                    {s.elevationGainM !== null ? `+${s.elevationGainM} m` : '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    Độ cao Xuống (Descent)
                  </span>
                  <span className="text-lg font-bold font-mono text-teal-400 tabular-nums">
                    {s.elevationLossM !== null ? `-${s.elevationLossM} m` : '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    Độ cao Min / Max
                  </span>
                  <span className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
                    {s.minElevationM !== null ? `${Math.round(s.minElevationM)}m` : '—'} /{' '}
                    {s.maxElevationM !== null ? `${Math.round(s.maxElevationM)}m` : '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    Tốc độ TB / Max
                  </span>
                  <span className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
                    {s.avgSpeedKmh ? `${s.avgSpeedKmh} km/h` : '—'} /{' '}
                    {s.maxSpeedKmh ? `${s.maxSpeedKmh} km/h` : '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                    Thời gian Di chuyển
                  </span>
                  <span className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
                    {s.movingDurationSeconds
                      ? `${Math.floor(s.movingDurationSeconds / 3600)}g ${Math.floor(
                          (s.movingDurationSeconds % 3600) / 60
                        )}p`
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Bounding Coordinates Box */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 font-sans mb-1">
                  Phạm vi địa lý (Bounding Box)
                </div>
                <div className="grid grid-cols-2 gap-2 tabular-nums">
                  <div>Vĩ độ: {s.bounds.minLat.toFixed(5)}°N → {s.bounds.maxLat.toFixed(5)}°N</div>
                  <div>Kinh độ: {s.bounds.minLng.toFixed(5)}°E → {s.bounds.maxLng.toFixed(5)}°E</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'waypoints' && (
            <div className="space-y-2">
              {file.waypoints.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  File này không có Waypoint nào.
                </div>
              ) : (
                file.waypoints.map((wpt, idx) => (
                  <div
                    key={wpt.id || idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="text-amber-400">★</span>
                        <span>{wpt.name}</span>
                      </div>
                      {wpt.desc && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{wpt.desc}</p>
                      )}
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {wpt.lat.toFixed(5)}°N, {wpt.lng.toFixed(5)}°E
                        {wpt.ele !== undefined ? ` · ${wpt.ele}m` : ''}
                      </div>
                    </div>

                    {onFocusWaypoint && (
                      <button
                        onClick={() => {
                          onFocusWaypoint(wpt.lat, wpt.lng);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded transition-colors"
                      >
                        Đến điểm này
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'tracks' && (
            <div className="space-y-2">
              {file.tracks.map((trk, idx) => (
                <div
                  key={trk.id || idx}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1"
                >
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>{trk.name}</span>
                    <span className="font-mono text-cyan-400 tabular-nums">
                      {(trk.distance / 1000).toFixed(2)} km
                    </span>
                  </div>
                  {trk.desc && (
                    <p className="text-[11px] text-slate-400">{trk.desc}</p>
                  )}
                  <div className="text-[10px] text-slate-500 flex items-center gap-3">
                    <span>{trk.segments.length} segment</span>
                    <span>·</span>
                    <span>{trk.pointsCount.toLocaleString()} điểm GPS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onLaunchFlyover && (
              <button
                onClick={() => {
                  onLaunchFlyover(file);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-[#fc5200] hover:bg-[#e04800] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <span>▶ Giả lập 3D Strava</span>
              </button>
            )}
            <button
              onClick={handleExportGeoJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Xuất GeoJSON</span>
            </button>
            <button
              onClick={handleDownloadOriginal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Tải GPX gốc</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
