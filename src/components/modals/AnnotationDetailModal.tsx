import React from 'react';
import { GeoAnnotation } from '../../types/map';

interface AnnotationDetailModalProps {
  annotation: GeoAnnotation | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusAnnotation: (coords: [number, number]) => void;
  onLoadPatrolSample?: () => void;
}

export const AnnotationDetailModal: React.FC<AnnotationDetailModalProps> = ({
  annotation,
  isOpen,
  onClose,
  onFocusAnnotation,
  onLoadPatrolSample
}) => {
  if (!isOpen || !annotation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-200">
        {/* Header with National Sovereignty Emblem motif */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-amber-300 font-bold shadow-md">
              ★
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-300">
                {annotation.nameVi}
              </h3>
              {annotation.nameEn && (
                <p className="text-[11px] text-slate-400">{annotation.nameEn}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs lg:text-sm leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Khẳng định lập trường chủ quyền
            </div>
            <p className="font-medium text-slate-100">
              {annotation.sovereigntyAffirmation}
            </p>
            {annotation.administrativeUnit && (
              <p className="text-xs text-amber-300/90 font-mono">
                Đơn vị hành chính: {annotation.administrativeUnit}
              </p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-white mb-1">Mô tả địa lý</h4>
            <p className="text-slate-300">{annotation.descriptionVi}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-xs text-slate-300">
            <span className="text-slate-500">Tọa độ trung tâm:</span>{' '}
            <span className="text-cyan-400 font-bold">
              {annotation.center[0].toFixed(4)}°N, {annotation.center[1].toFixed(4)}°E
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {annotation.id.includes('truong-sa') && onLoadPatrolSample && (
            <button
              onClick={() => {
                onLoadPatrolSample();
                onClose();
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors"
            >
              Nạp tuyến tuần tra Đảo Nam Yết
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                onFocusAnnotation(annotation.center);
                onClose();
              }}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
            >
              Xem vị trí trên bản đồ
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
