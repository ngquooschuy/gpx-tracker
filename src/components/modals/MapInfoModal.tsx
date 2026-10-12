import React from 'react';

interface MapInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapInfoModal: React.FC<MapInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
            <h3 className="text-base font-bold text-white">
              Thông tin Bản đồ & Chủ quyền Địa lý
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-5 text-xs lg:text-sm leading-relaxed text-slate-300">
          {/* Vietnam Sovereignty Section */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <span className="text-base">★</span>
              <span>Chủ quyền Quần đảo Hoàng Sa và Trường Sa</span>
            </div>
            <p>
              Ứng dụng <strong>VietMap GPX Viewer</strong> thiết lập lớp thông tin địa lý độc lập (
              <em>Vietnam Geographic Annotation Layer</em>) nhằm thể hiện chính xác lập trường chủ
              quyền toàn vẹn của Nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam đối với:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-200">
              <li>
                <strong>Quần đảo Hoàng Sa, Việt Nam</strong> (trực thuộc Huyện đảo Hoàng Sa, Thành
                phố Đà Nẵng).
              </li>
              <li>
                <strong>Quần đảo Trường Sa, Việt Nam</strong> (trực thuộc Huyện đảo Trường Sa, Tỉnh
                Khánh Hòa).
              </li>
              <li>
                <strong>Vùng biển Việt Nam và Biển Đông</strong> theo đúng Công ước Liên Hợp Quốc về
                Luật Biển năm 1982 (UNCLOS 1982).
              </li>
            </ul>
            <p className="text-[11px] text-amber-350 italic">
              Lớp chú thích được hiển thị độc lập, không phụ thuộc vào hệ thống nhãn mặc định của các
              nhà cung cấp bản đồ nền bên thứ ba.
            </p>
          </div>

          {/* Base Map & Tile Providers */}
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">
              1. Nguồn Bản đồ nền & Attribution
            </h4>
            <p className="mb-2">
              Ứng dụng tích hợp các tile server tương thích OpenStreetMap công khai:
            </p>
            <ul className="space-y-1.5 pl-2 border-l-2 border-slate-700">
              <li>
                <strong>OpenStreetMap Standard:</strong> &copy;{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  OpenStreetMap contributors
                </a>{' '}
                (Giấy phép Open Database License - ODbL).
              </li>
              <li>
                <strong>OpenTopoMap:</strong> Dữ liệu bản đồ &copy; OpenStreetMap contributors &amp; SRTM. Phong cách bản đồ &copy; OpenTopoMap (CC-BY-SA).
              </li>
              <li>
                <strong>CartoDB Basemaps:</strong> &copy; OpenStreetMap contributors &copy; CARTO.
              </li>
            </ul>
          </div>

          {/* Privacy & Client-side Architecture */}
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">
              2. Quyền riêng tư & Bảo mật dữ liệu GPS
            </h4>
            <p>
              Toàn bộ quá trình đọc, phân tích khoảng cách, trích xuất tọa độ và vẽ biểu đồ độ cao
              đều diễn ra <strong>trực tiếp trong trình duyệt người dùng</strong> (Client-Side). File
              GPX của bạn không bị tải lên bất kỳ máy chủ nào, đảm bảo tối đa quyền riêng tư cho các
              hành trình cá nhân.
            </p>
          </div>

          {/* Data Limitations */}
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">
              3. Giới hạn dữ liệu & Đo đạc GPS
            </h4>
            <p>
              Khoảng cách và độ cao được tính toán dựa trên công thức hình học cầu Haversine và bộ lọc
              khử nhiễu độ cao vệ tinh. Độ chính xác phụ thuộc vào thiết bị ghi GPS ban đầu của người
              dùng.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
