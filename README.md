# VietMap GPX Viewer

Ứng dụng web chuyên nghiệp dùng để xem, phân tích và quản lý dữ liệu GPS/GPX trên nền bản đồ OpenStreetMap, tích hợp lớp thông tin khẳng định chủ quyền của Việt Nam đối với hai quần đảo Hoàng Sa và Trường Sa.

---

## 1. Tính năng nổi bật

1. **Nhập & Quản lý GPX đa nguồn (Client-Side Only)**
   - Kéo thả hoặc chọn nhiều file GPX cùng lúc.
   - Xử lý hoàn toàn trong trình duyệt (DOMParser an toàn, bảo vệ tuyệt đối dữ liệu GPS cá nhân).
   - Kiểm tra tính hợp lệ của cấu trúc XML và dữ liệu tọa độ.
   - Quản lý nhiều hành trình đồng thời: bật/tắt hiển thị, đổi màu sắc track, căn khung bản đồ (fit bounds).

2. **Lớp chú thích địa lý chủ quyền Việt Nam (Vietnam Geographic Annotation Layer)**
   - Lớp thông tin độc lập quản lý bởi ứng dụng, không phụ thuộc vào nhãn mặc định của OpenStreetMap hay tile server bên thứ ba.
   - Thể hiện nổi bật:
     - `Quần đảo Hoàng Sa, Việt Nam` (trực thuộc Huyện đảo Hoàng Sa, TP. Đà Nẵng).
     - `Quần đảo Trường Sa, Việt Nam` (trực thuộc Huyện đảo Trường Sa, Tỉnh Khánh Hòa).
     - Biển Đông và các đảo tiền tiêu: Đảo Trường Sa Lớn, Song Tử Tây, Sinh Tồn, Nam Yết, Đảo Hoàng Sa, Phú Lâm.
   - Nút căn chỉnh nhanh góc nhìn toàn cảnh Biển đảo Việt Nam.

3. **Phân tích hành trình & Thống kê độ chính xác cao**
   - Quãng đường di chuyển tính theo công thức độ cung lớn Haversine.
   - Trắc diện độ cao: độ cao nhỏ nhất, lớn nhất, tổng độ cao tăng (ascent) và giảm (descent) có bộ lọc khử nhiễu cảm biến GPS (jitter filtering).
   - Thời gian di chuyển (moving time), thời gian dừng (paused time), tốc độ trung bình và tốc độ tối đa.

4. **Biểu đồ trắc diện tương tác đồng bộ bản đồ (Interactive Elevation Profile)**
   - Biểu đồ SVG vector sắc nét thể hiện độ cao theo quãng đường và tốc độ theo quãng đường.
   - Đồng bộ hóa 2 chiều (Bidirectional Scrubbing): rê chuột trên biểu đồ sẽ hiển thị điểm tương ứng trên bản đồ và ngược lại.

4. **Mô phỏng 3D góc nhìn Strava Flyover (3D Route Simulation)**
   - Khởi chạy chế độ giả lập chuyến đi với camera 3D bám sát theo thời gian thực (góc nghiêng 62°, tự động xoay góc nhìn hướng về phía trước theo hướng chạy).
   - Tích hợp ảnh vệ tinh phân giải cao (ESRI World Imagery) chuẩn như video Strava.
   - Bảng thông số HUD trên đỉnh màn hình (Quãng đường, Độ cao tăng, Độ nghiêng %) theo đúng phong cách video Strava.
   - Hỗ trợ đổi tỷ lệ khung hình video: Khung dọc Reel (9:16) hoặc Toàn màn hình GIS.
   - Tùy chỉnh tốc độ tua 1x, 2x, 5x, 10x, 20x và thanh trượt tua tiến độ.

5. **Xuất dữ liệu & Chuyển đổi định dạng**
   - Xuất sang định dạng chuẩn GeoJSON (`.geojson`) cho các phần mềm GIS (QGIS, ArcGIS).
   - Xuất bảng báo cáo phân tích tổng hợp dưới dạng file CSV.
   - Tải lại file GPX gốc.

6. **Mẫu hành trình Việt Nam tích hợp sẵn**
   - Chạy bộ Hồ Tây - Đường Lạc Long Quân - Phố Quảng An - Phố Nguyễn Đình Thi (TP. Hà Nội).
   - Trekking Đỉnh Fansipan (3.143m - Sa Pa, Lào Cai).
   - Đèo Hải Vân (Đà Nẵng - Thừa Thiên Huế).
   - Tuyến tuần tra Đảo Nam Yết (Huyện đảo Trường Sa, Khánh Hòa, Việt Nam).

---

## 2. Kiến trúc thư mục

```
src/
├── types/
│   ├── gpx.ts                     # Định nghĩa kiểu dữ liệu GPX, Track, Route, Waypoint, Stats
│   └── map.ts                     # Định nghĩa cấu hình TileProvider, GeoAnnotation, LayerSettings
├── services/
│   ├── gpxParser.ts               # Core parser DOMParser, Haversine, khử nhiễu độ cao
│   ├── gpxExporter.ts             # Xuất GeoJSON, CSV, GPX download
│   └── sampleGpxData.ts           # Dữ liệu hành trình mẫu tại Việt Nam
├── data/
│   └── vietnamGeoAnnotations.ts   # Tọa độ và chú thích Hoàng Sa, Trường Sa, Biển Đông
├── components/
│   ├── header/
│   │   └── TopBar.tsx             # Thanh điều hướng chuẩn Top Bar Contract
│   ├── sidebar/
│   │   ├── Sidebar.tsx            # Bảng điều khiển quản lý file & thống kê
│   │   ├── FileUploadZone.tsx     # Khu vực kéo thả file GPX
│   │   ├── FileList.tsx           # Danh sách file, màu sắc, bật tắt layer
│   │   └── OverallStats.tsx       # Tổng hợp KPI toàn bộ hành trình
│   ├── map/
│   │   └── MapView.tsx            # Bản đồ Leaflet, Polyline, Marker, Annotation Overlay
│   ├── chart/
│   │   └── ElevationChart.tsx     # Biểu đồ trắc diện độ cao & tốc độ SVG tương tác
│   └── modals/
│       ├── MapInfoModal.tsx       # Thông tin bản quyền, nguồn tile và chủ quyền
│       ├── TrackDetailsModal.tsx  # Bảng chi tiết từng điểm, waypoint và đoạn track
│       ├── AnnotationDetailModal.tsx # Chi tiết Hoàng Sa - Trường Sa
│       ├── SampleSelectionModal.tsx  # Danh sách mẫu thử nghiệm
│       └── WaypointDetailModal.tsx   # Chi tiết từng waypoint
├── tests/
│   └── gpxParser.test.ts          # Unit tests kiểm tra parser, công thức tính toán và dữ liệu
├── App.tsx                        # Ứng dụng chính và luồng dữ liệu
├── main.tsx
└── index.css
```

---

## 3. Cài đặt và Chạy Development

### Yêu cầu môi trường
- Node.js >= 18.0.0
- npm >= 9.0.0

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

### Chạy Unit Tests
```bash
npm test
```

### Chạy Typecheck & Linter
```bash
npm run lint
```

### Build cho môi trường Production
```bash
npm run build
```
Kết quả build được tạo trong thư mục `dist/`.

---

## 4. Triển khai Production

Ứng dụng là một Single Page Application (SPA) hoàn toàn tĩnh, có thể triển khai lên bất kỳ dịch vụ static hosting nào (Cloudflare Pages, Vercel, Netlify, GitHub Pages, Firebase Hosting) hoặc máy chủ Nginx / Apache.

### Ví dụ cấu hình Nginx:
```nginx
server {
    listen 80;
    server_name gpx.vietmap.vn;

    root /var/www/vietmap-gpx/dist;
    index index.html;

    # Gzip nén tài nguyên
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache tài nguyên tĩnh
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 5. Nguồn dữ liệu & Bản quyền

- **Bản đồ nền OpenStreetMap:** &copy; [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), giấy phép ODbL.
- **Bản đồ địa hình OpenTopoMap:** &copy; OpenStreetMap contributors, SRTM. Phong cách: &copy; OpenTopoMap (CC-BY-SA).
- **CartoDB Basemaps:** &copy; OpenStreetMap contributors &copy; CARTO.
- **Lớp chú thích chủ quyền Hoàng Sa & Trường Sa:** Dữ liệu địa lý và hành chính chính thức theo các văn bản quy phạm pháp luật và tuyên bố chủ quyền của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam (Huyện Hoàng Sa - TP. Đà Nẵng; Huyện Trường Sa - Tỉnh Khánh Hòa).
