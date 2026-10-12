import React from 'react';
import { SAMPLE_GPX_LIST, SampleGpxMeta } from '../../services/sampleGpxData';

interface SampleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleGpxMeta) => void;
}

export const SampleSelectionModal: React.FC<SampleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectSample
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              Hành trình Mẫu Khảo sát & Du lịch Việt Nam
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn một cung đường thực tế để kiểm tra ngay tính năng hiển thị và phân tích GPX
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {SAMPLE_GPX_LIST.map((sample) => (
            <div
              key={sample.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: sample.color }}
                  />
                  <h4 className="text-sm font-semibold text-white">
                    {sample.name}
                  </h4>
                </div>
                <span className="text-xs font-mono font-medium text-cyan-400">
                  {sample.distanceKm}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {sample.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>{sample.category}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{sample.elevationGainM}</span>
                </div>

                <button
                  onClick={() => {
                    onSelectSample(sample);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  Nạp hành trình này
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
