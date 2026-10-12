/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { GPXFileItem, GPXPoint, GPXWaypoint } from './types/gpx';
import { GeoAnnotation, MapViewSettings } from './types/map';
import { parseGPXString } from './services/gpxParser';
import { SAMPLE_GPX_LIST, SampleGpxMeta } from './services/sampleGpxData';
import { TopBar } from './components/header/TopBar';
import { Sidebar } from './components/sidebar/Sidebar';
import { MapView } from './components/map/MapView';
import { ElevationChart } from './components/chart/ElevationChart';
import { MapInfoModal } from './components/modals/MapInfoModal';
import { TrackDetailsModal } from './components/modals/TrackDetailsModal';
import { AnnotationDetailModal } from './components/modals/AnnotationDetailModal';
import { SampleSelectionModal } from './components/modals/SampleSelectionModal';
import { WaypointDetailModal } from './components/modals/WaypointDetailModal';
import { StravaFlyover3D } from './components/map3d/StravaFlyover3D';
import { VIETNAM_GEO_ANNOTATIONS } from './data/vietnamGeoAnnotations';

const DEFAULT_SETTINGS: MapViewSettings = {
  tileProviderId: 'esri-satellite', // Default to crystal-clear Satellite imagery matching Strava
  showVietnamAnnotations: true,
  showWaypoints: true,
  showRoutes: true,
  showTracks: true,
  showDistanceMarkers: true,
  showCoordinateGrid: false,
  elevationExaggeration: 1,
  mapDimension: '2D'
};

const PALETTE = ['#fc5200', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export default function App() {
  const [files, setFiles] = useState<GPXFileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<GPXPoint | null>(null);
  const [settings, setSettings] = useState<MapViewSettings>(DEFAULT_SETTINGS);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [chartCollapsed, setChartCollapsed] = useState<boolean>(false);

  // Modals state
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [sampleModalOpen, setSampleModalOpen] = useState<boolean>(false);
  const [detailsModalFile, setDetailsModalFile] = useState<GPXFileItem | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<GeoAnnotation | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<{
    waypoint: GPXWaypoint;
    file: GPXFileItem;
  } | null>(null);

  // 3D Strava Flyover Modal state
  const [flyoverFile, setFlyoverFile] = useState<GPXFileItem | null>(null);

  // Map triggers
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);
  const [focusVietnamTrigger, setFocusVietnamTrigger] = useState<number>(0);

  // Auto-load West Lake (Hồ Tây) sample initially on first run matching user's Strava screenshot
  useEffect(() => {
    try {
      const westLakeSample = SAMPLE_GPX_LIST[0]; // West Lake route
      const xml = westLakeSample.getXml();
      const parsed = parseGPXString(
        xml,
        'Duong_Lac_Long_Quan_Quang_An_Nguyen_Dinh_Thi.gpx',
        22400,
        westLakeSample.color
      );
      setFiles([parsed]);
      setSelectedFileId(parsed.id);
      // Trigger fit bounds shortly after mount
      setTimeout(() => {
        setFitBoundsTrigger((prev) => prev + 1);
      }, 350);
    } catch (e) {
      console.error('Failed to load initial sample:', e);
    }
  }, []);

  // Handle uploaded files
  const handleFilesSelected = async (newFiles: File[]) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const parsedItems: GPXFileItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        const text = await file.text();
        const color = PALETTE[(files.length + parsedItems.length) % PALETTE.length];
        const parsed = parseGPXString(text, file.name, file.size, color);
        parsedItems.push(parsed);
      } catch (err: any) {
        errors.push(err.message || `Lỗi không xác định khi đọc ${file.name}`);
      }
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join('\n'));
    }

    if (parsedItems.length > 0) {
      setFiles((prev) => [...prev, ...parsedItems]);
      setSelectedFileId(parsedItems[0].id);
      setFitBoundsTrigger((prev) => prev + 1);
    }

    setIsProcessing(false);
  };

  // Load a built-in sample GPX
  const handleLoadSample = (sampleId: string) => {
    const meta = SAMPLE_GPX_LIST.find((s) => s.id === sampleId);
    if (!meta) return;

    try {
      const xml = meta.getXml();
      const color = meta.color;
      const fileName = `${meta.name.replace(/[^a-zA-Z0-9_]/g, '_')}.gpx`;
      const parsed = parseGPXString(xml, fileName, 18500, color);

      // Check if already added
      const existing = files.find((f) => f.fileName === fileName);
      if (existing) {
        setSelectedFileId(existing.id);
        setFitBoundsTrigger((prev) => prev + 1);
      } else {
        setFiles((prev) => [...prev, parsed]);
        setSelectedFileId(parsed.id);
        setFitBoundsTrigger((prev) => prev + 1);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Không thể nạp mẫu này');
    }
  };

  // Toggle file visibility
  const handleToggleVisibility = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, visible: !f.visible } : f))
    );
  };

  // Toggle file waypoints
  const handleToggleWaypoints = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, showWaypoints: !f.showWaypoints } : f
      )
    );
  };

  // Change file track color
  const handleColorChange = (fileId: string, color: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, color } : f))
    );
  };

  // Delete single file
  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => {
      const remaining = prev.filter((f) => f.id !== fileId);
      if (selectedFileId === fileId) {
        setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // Clear all files
  const handleClearAll = () => {
    setFiles([]);
    setSelectedFileId(null);
    setActivePoint(null);
  };

  // Selected active file for elevation profile and 3D simulation
  const selectedFile =
    files.find((f) => f.id === selectedFileId) || (files.length > 0 ? files[0] : null);

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Global Header adhering to Top Bar Contract */}
      <TopBar
        onOpenUpload={() => {
          setSidebarOpen(true);
        }}
        onOpenSampleModal={() => setSampleModalOpen(true)}
        onOpenInfoModal={() => setInfoModalOpen(true)}
        onFocusVietnam={() => {
          setFocusVietnamTrigger((prev) => prev + 1);
        }}
        onOpenFlyover={() => {
          if (selectedFile) setFlyoverFile(selectedFile);
        }}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
        totalFiles={files.length}
        hasActiveFile={!!selectedFile}
      />

      {/* 2. Error Toast / Alert if any */}
      {errorMessage && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between z-40 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">Lỗi xử lý GPX:</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Sidebar (Files, Stats, Sample Presets) */}
        <Sidebar
          files={files}
          selectedFileId={selectedFileId}
          onSelectFile={(id) => setSelectedFileId(id)}
          onFilesSelected={handleFilesSelected}
          onLoadSample={handleLoadSample}
          onToggleVisibility={handleToggleVisibility}
          onToggleWaypoints={handleToggleWaypoints}
          onColorChange={handleColorChange}
          onZoomToFile={(file) => {
            setSelectedFileId(file.id);
            setFitBoundsTrigger((prev) => prev + 1);
          }}
          onViewDetails={(file) => setDetailsModalFile(file)}
          onLaunchFlyover={(file) => setFlyoverFile(file)}
          onDeleteFile={handleDeleteFile}
          onClearAll={handleClearAll}
          isProcessing={isProcessing}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Center / Right GIS Viewport Area */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Map Section */}
          <div className="flex-1 w-full relative">
            <MapView
              files={files}
              selectedFileId={selectedFileId}
              activePoint={activePoint}
              onPointSelect={(point) => setActivePoint(point)}
              onWaypointSelect={(wpt, file) =>
                setSelectedWaypoint({ waypoint: wpt, file })
              }
              onAnnotationSelect={(anno) => setSelectedAnnotation(anno)}
              settings={settings}
              onSettingsChange={(newSettings) => setSettings(newSettings)}
              fitBoundsTrigger={fitBoundsTrigger}
              focusVietnamTrigger={focusVietnamTrigger}
            />

            {/* Quick 3D Strava Flyover FAB overlay on map */}
            {selectedFile && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => setFlyoverFile(selectedFile)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-[#fc5200] hover:bg-[#e04800] text-white text-xs font-bold rounded-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-white/20"
                  title="Chạy mô phỏng đường chạy 3D giống Strava Flyover"
                >
                  <span className="text-sm">▶</span>
                  <span>Mô phỏng 3D Strava Flyover</span>
                </button>

                {/* Vietnam Sovereign Quick Badge */}
                <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-medium text-slate-200">
                    Hoàng Sa & Trường Sa (VN):
                  </span>
                  <span className="text-amber-400 font-semibold">Đang kích hoạt</span>
                  <button
                    onClick={() => {
                      const hoangSa = VIETNAM_GEO_ANNOTATIONS[0];
                      setSelectedAnnotation(hoangSa);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline ml-1"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Interactive Elevation Profile Panel */}
          {selectedFile && (
            <div
              className={`bg-slate-925 border-t border-slate-800 transition-all duration-200 flex flex-col shrink-0 ${
                chartCollapsed ? 'h-9' : 'h-48 md:h-56'
              }`}
            >
              {/* Collapse / Expand Toggle Bar */}
              <div className="flex items-center justify-between px-3 h-9 bg-slate-900/80 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-semibold text-slate-200">
                    Trắc diện Độ cao & Tốc độ hành trình
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ({selectedFile.stats.totalDistanceKm} km ·{' '}
                    {selectedFile.stats.elevationGainM !== null
                      ? `+${selectedFile.stats.elevationGainM}m`
                      : 'Không có dữ liệu cao độ'}
                    )
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFlyoverFile(selectedFile)}
                    className="text-orange-400 hover:text-orange-300 font-semibold text-[11px] transition-colors flex items-center gap-1"
                  >
                    <span>▶ Chạy 3D Strava</span>
                  </button>
                  <button
                    onClick={() => setChartCollapsed(!chartCollapsed)}
                    className="text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-colors"
                  >
                    {chartCollapsed ? 'Mở rộng biểu đồ ↑' : 'Thu nhỏ ↓'}
                  </button>
                </div>
              </div>

              {/* Chart Canvas */}
              {!chartCollapsed && (
                <div className="flex-1 w-full min-h-0">
                  <ElevationChart
                    file={selectedFile}
                    activePoint={activePoint}
                    onPointHover={(point) => setActivePoint(point)}
                    onPointClick={(point) => setActivePoint(point)}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 4. Modals */}
      <MapInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />

      <SampleSelectionModal
        isOpen={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        onSelectSample={(sample) => handleLoadSample(sample.id)}
      />

      <TrackDetailsModal
        file={detailsModalFile}
        isOpen={!!detailsModalFile}
        onClose={() => setDetailsModalFile(null)}
        onLaunchFlyover={(file) => setFlyoverFile(file)}
      />

      <AnnotationDetailModal
        annotation={selectedAnnotation}
        isOpen={!!selectedAnnotation}
        onClose={() => setSelectedAnnotation(null)}
        onFocusAnnotation={() => {
          setFocusVietnamTrigger((prev) => prev + 1);
        }}
        onLoadPatrolSample={() => {
          handleLoadSample('sample-truong-sa');
        }}
      />

      <WaypointDetailModal
        waypoint={selectedWaypoint?.waypoint || null}
        file={selectedWaypoint?.file || null}
        isOpen={!!selectedWaypoint}
        onClose={() => setSelectedWaypoint(null)}
      />

      {/* 5. Strava 3D Flyover Simulator Modal */}
      {flyoverFile && (
        <StravaFlyover3D
          file={flyoverFile}
          isOpen={!!flyoverFile}
          onClose={() => setFlyoverFile(null)}
        />
      )}
    </div>
  );
}
