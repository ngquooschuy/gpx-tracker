import React from 'react';

interface TopBarProps {
  onOpenUpload: () => void;
  onOpenSampleModal: () => void;
  onOpenInfoModal: () => void;
  onFocusVietnam: () => void;
  onOpenFlyover: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  totalFiles: number;
  hasActiveFile: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenUpload,
  onOpenSampleModal,
  onOpenInfoModal,
  onFocusVietnam,
  onOpenFlyover,
  onToggleSidebar,
  sidebarOpen,
  totalFiles,
  hasActiveFile
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-4 lg:px-6 h-14 bg-slate-900 border-b border-slate-800 text-slate-100 z-30 shrink-0">
      {/* Zone 1: Single text element wordmark with toggle icon */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title={sidebarOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <a
          href="/"
          className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>VietMap GPX Viewer</span>
        </a>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium text-slate-300">
        <button
          onClick={onFocusVietnam}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-amber-300/90"
        >
          <span className="text-amber-400">★</span>
          <span>Hoàng Sa & Trường Sa</span>
        </button>

        {hasActiveFile && (
          <button
            onClick={onOpenFlyover}
            className="text-orange-400 hover:text-orange-300 font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span className="text-sm">▶</span>
            <span>Giả lập 3D Strava</span>
          </button>
        )}

        <button
          onClick={onOpenSampleModal}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          Mẫu hành trình VN
        </button>
        <button
          onClick={onOpenInfoModal}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          Thông tin & Bản quyền
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {hasActiveFile && (
          <button
            onClick={onOpenFlyover}
            className="md:hidden px-2.5 py-1.5 text-xs font-semibold text-white bg-[#fc5200] hover:bg-[#e04800] rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 active:scale-95"
          >
            <span>▶ 3D</span>
          </button>
        )}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Tải file GPX</span>
        </button>
      </div>
    </header>
  );
};
