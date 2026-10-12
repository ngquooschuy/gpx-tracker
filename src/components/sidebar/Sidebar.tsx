import React, { useState } from 'react';
import { GPXFileItem } from '../../types/gpx';
import { FileUploadZone } from './FileUploadZone';
import { FileList } from './FileList';
import { OverallStats } from './OverallStats';
import { SAMPLE_GPX_LIST } from '../../services/sampleGpxData';

interface SidebarProps {
  files: GPXFileItem[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onFilesSelected: (files: File[]) => void;
  onLoadSample: (sampleId: string) => void;
  onToggleVisibility: (fileId: string) => void;
  onToggleWaypoints: (fileId: string) => void;
  onColorChange: (fileId: string, color: string) => void;
  onZoomToFile: (file: GPXFileItem) => void;
  onViewDetails: (file: GPXFileItem) => void;
  onLaunchFlyover: (file: GPXFileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onClearAll: () => void;
  isProcessing: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  onFilesSelected,
  onLoadSample,
  onToggleVisibility,
  onToggleWaypoints,
  onColorChange,
  onZoomToFile,
  onViewDetails,
  onLaunchFlyover,
  onDeleteFile,
  onClearAll,
  isProcessing,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'stats' | 'samples'>('files');

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full bg-slate-925 border-r border-slate-800 flex flex-col shrink-0 z-20 shadow-2xl overflow-hidden">
      {/* Sidebar Header & Tab Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-2 md:hidden">
          <span className="text-xs font-bold text-slate-300">Bảng điều khiển GIS</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('files')}
            className={`py-1.5 px-2 rounded-md transition-all text-center truncate ${
              activeTab === 'files'
                ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Files ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-1.5 px-2 rounded-md transition-all text-center truncate ${
              activeTab === 'stats'
                ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thống kê
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-1.5 px-2 rounded-md transition-all text-center truncate ${
              activeTab === 'samples'
                ? 'bg-slate-800 text-amber-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mẫu VN
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'files' && (
          <>
            <FileUploadZone
              onFilesSelected={onFilesSelected}
              isProcessing={isProcessing}
            />

            <FileList
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
              onToggleVisibility={onToggleVisibility}
              onToggleWaypoints={onToggleWaypoints}
              onColorChange={onColorChange}
              onZoomToFile={onZoomToFile}
              onViewDetails={onViewDetails}
              onLaunchFlyover={onLaunchFlyover}
              onDeleteFile={onDeleteFile}
              onClearAll={onClearAll}
            />
          </>
        )}

        {activeTab === 'stats' && <OverallStats files={files} />}

        {activeTab === 'samples' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 px-1">
              <span>Hành trình mẫu kiểm thử tại Việt Nam</span>
            </div>

            <div className="space-y-2.5">
              {SAMPLE_GPX_LIST.map((sample) => (
                <div
                  key={sample.id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {sample.name}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {sample.distanceKm}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-emerald-400 font-mono">
                      {sample.elevationGainM}
                    </span>
                    <button
                      onClick={() => onLoadSample(sample.id)}
                      className="px-2.5 py-1 text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors active:scale-95"
                    >
                      Nạp mẫu này →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
