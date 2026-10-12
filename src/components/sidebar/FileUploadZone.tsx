import React, { useRef, useState } from 'react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  isProcessing
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const gpxFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.name.toLowerCase().endsWith('.gpx') || file.type.includes('xml')
      );
      if (gpxFiles.length > 0) {
        onFilesSelected(gpxFiles);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
        isDragOver
          ? 'border-cyan-400 bg-cyan-950/30'
          : 'border-slate-700/80 hover:border-slate-500 bg-slate-900/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".gpx,application/gpx+xml,text/xml"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 mb-0.5">
          {isProcessing ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        <p className="text-xs font-semibold text-slate-200">
          Kéo thả file .GPX vào đây
        </p>
        <p className="text-[11px] text-slate-400">
          hoặc bấm để chọn từ máy tính (Hỗ trợ nhiều file)
        </p>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
          <span>Xử lý 100% trên trình duyệt</span>
          <span aria-hidden="true">·</span>
          <span>Bảo mật riêng tư</span>
        </div>
      </div>
    </div>
  );
};
