import { GeoAnnotation, TileProvider } from '../types/map';

/**
 * Lớp chú thích địa lý khẳng định chủ quyền của Việt Nam đối với Quần đảo Hoàng Sa và Quần đảo Trường Sa.
 * Quản lý độc lập trên lớp thông tin riêng của ứng dụng (Vietnam Geographic Annotation Layer),
 * không phụ thuộc vào nhãn hay cài đặt của tile server bên thứ ba.
 * 
 * Nguồn tham chiếu:
 * - Nghị quyết và công bố chính thức của Nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
 * - Huyện đảo Hoàng Sa (thành phố Đà Nẵng).
 * - Huyện đảo Trường Sa (tỉnh Khánh Hòa).
 */
export const VIETNAM_GEO_ANNOTATIONS: GeoAnnotation[] = [
  {
    id: 'hoang-sa-archipelago',
    nameVi: 'Quần đảo Hoàng Sa, Việt Nam',
    nameEn: 'Paracel Islands (Vietnam)',
    category: 'archipelago',
    center: [16.538, 112.025], // Tọa độ trung tâm cụm đảo Hoàng Sa
    bounds: [[15.75, 111.0], [17.15, 113.0]],
    descriptionVi: 'Quần đảo Hoàng Sa là lãnh thổ không thể tách rời của Việt Nam, trực thuộc huyện đảo Hoàng Sa, thành phố Đà Nẵng.',
    descriptionEn: 'The Paracel Islands are an inseparable part of Vietnam sovereign territory, governed under Hoang Sa Island District, Da Nang City.',
    sovereigntyAffirmation: 'Lãnh thổ toàn vẹn và chủ quyền thiêng liêng của Việt Nam.',
    importance: 'critical',
    zoomRange: [3, 18],
    administrativeUnit: 'Huyện đảo Hoàng Sa, Thành phố Đà Nẵng'
  },
  {
    id: 'truong-sa-archipelago',
    nameVi: 'Quần đảo Trường Sa, Việt Nam',
    nameEn: 'Spratly Islands (Vietnam)',
    category: 'archipelago',
    center: [8.643, 111.918], // Tọa độ gần Đảo Trường Sa Lớn & trung tâm
    bounds: [[6.5, 109.5], [11.8, 117.5]],
    descriptionVi: 'Quần đảo Trường Sa là lãnh thổ không thể tách rời của Việt Nam, trực thuộc huyện đảo Trường Sa, tỉnh Khánh Hòa.',
    descriptionEn: 'The Spratly Islands are an inseparable part of Vietnam sovereign territory, governed under Truong Sa Island District, Khanh Hoa Province.',
    sovereigntyAffirmation: 'Lãnh thổ toàn vẹn và chủ quyền thiêng liêng của Việt Nam.',
    importance: 'critical',
    zoomRange: [3, 18],
    administrativeUnit: 'Huyện đảo Trường Sa, Tỉnh Khánh Hòa'
  },
  {
    id: 'dao-truong-sa-lon',
    nameVi: 'Đảo Trường Sa (Trường Sa Lớn)',
    nameEn: 'Spratly Island',
    category: 'island',
    center: [8.6439, 111.9214],
    descriptionVi: 'Đảo trung tâm của huyện đảo Trường Sa, tỉnh Khánh Hòa. Nơi đặt trụ sở UBND thị trấn Trường Sa.',
    sovereigntyAffirmation: 'Thị trấn Trường Sa, huyện Trường Sa, tỉnh Khánh Hòa, Việt Nam.',
    importance: 'high',
    zoomRange: [7, 18],
    administrativeUnit: 'Thị trấn Trường Sa, Huyện Trường Sa, Tỉnh Khánh Hòa'
  },
  {
    id: 'dao-song-tu-tay',
    nameVi: 'Đảo Song Tử Tây',
    nameEn: 'Southwest Cay',
    category: 'island',
    center: [11.4286, 114.3314],
    descriptionVi: 'Xã Song Tử Tây, huyện đảo Trường Sa, tỉnh Khánh Hòa, có ngọn hải đăng lâu đời dẫn đường cho tàu bè.',
    sovereigntyAffirmation: 'Xã Song Tử Tây, Huyện Trường Sa, Tỉnh Khánh Hòa, Việt Nam.',
    importance: 'high',
    zoomRange: [8, 18],
    administrativeUnit: 'Xã Song Tử Tây, Huyện Trường Sa, Tỉnh Khánh Hòa'
  },
  {
    id: 'dao-sinh-ton',
    nameVi: 'Đảo Sinh Tồn',
    nameEn: 'Sin Cowe Island',
    category: 'island',
    center: [9.8858, 114.3297],
    descriptionVi: 'Xã Sinh Tồn, huyện đảo Trường Sa, tỉnh Khánh Hòa. Có chùa Sinh Tồn, trường học và cộng đồng cư dân.',
    sovereigntyAffirmation: 'Xã Sinh Tồn, Huyện Trường Sa, Tỉnh Khánh Hòa, Việt Nam.',
    importance: 'high',
    zoomRange: [8, 18],
    administrativeUnit: 'Xã Sinh Tồn, Huyện Trường Sa, Tỉnh Khánh Hòa'
  },
  {
    id: 'dao-nam-yet',
    nameVi: 'Đảo Nam Yết',
    nameEn: 'Namyit Island',
    category: 'island',
    center: [10.1806, 114.3644],
    descriptionVi: 'Đảo Nam Yết trực thuộc huyện đảo Trường Sa, tỉnh Khánh Hòa, nổi tiếng với hàng dừa xanh và thảm san hô phong phú.',
    sovereigntyAffirmation: 'Huyện Trường Sa, Tỉnh Khánh Hòa, Việt Nam.',
    importance: 'high',
    zoomRange: [8, 18],
    administrativeUnit: 'Huyện Trường Sa, Tỉnh Khánh Hòa'
  },
  {
    id: 'dao-phu-lam',
    nameVi: 'Đảo Phú Lâm (Hoàng Sa)',
    nameEn: 'Woody Island',
    category: 'island',
    center: [16.8333, 112.3333],
    descriptionVi: 'Một trong những đảo lớn nhất thuộc nhóm An Vĩnh của quần đảo Hoàng Sa, Việt Nam.',
    sovereigntyAffirmation: 'Huyện Hoàng Sa, TP. Đà Nẵng, Việt Nam.',
    importance: 'high',
    zoomRange: [8, 18],
    administrativeUnit: 'Huyện đảo Hoàng Sa, TP. Đà Nẵng'
  },
  {
    id: 'dao-hoang-sa-island',
    nameVi: 'Đảo Hoàng Sa (Đảo Pattle)',
    nameEn: 'Pattle Island',
    category: 'island',
    center: [16.5333, 111.6000],
    descriptionVi: 'Đảo chính thuộc nhóm Lưỡi Liềm (Nguyệt Thiềm), quần đảo Hoàng Sa, Việt Nam.',
    sovereigntyAffirmation: 'Huyện Hoàng Sa, TP. Đà Nẵng, Việt Nam.',
    importance: 'high',
    zoomRange: [8, 18],
    administrativeUnit: 'Huyện đảo Hoàng Sa, TP. Đà Nẵng'
  },
  {
    id: 'bien-dong-vietnam',
    nameVi: 'Biển Đông (Vùng biển Việt Nam)',
    nameEn: 'East Sea (South China Sea)',
    category: 'maritime',
    center: [12.5, 112.0],
    descriptionVi: 'Vùng biển chủ quyền, quyền chủ quyền và quyền tài phán theo Công ước Liên Hợp Quốc về Luật Biển 1982 (UNCLOS).',
    sovereigntyAffirmation: 'Chủ quyền, quyền chủ quyền và quyền tài phán theo luật pháp quốc tế và luật pháp Việt Nam.',
    importance: 'medium',
    zoomRange: [4, 7]
  }
];

export const TILE_PROVIDERS: TileProvider[] = [
  {
    id: 'esri-satellite',
    name: 'Ảnh Vệ Tinh Độ Nét Cao (ESRI World Imagery - Chuẩn Strava)',
    category: 'satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, GIS Community',
    maxZoom: 19
  },
  {
    id: 'osm-standard',
    name: 'OpenStreetMap Tiêu chuẩn',
    category: 'street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  },
  {
    id: 'opentopomap',
    name: 'OpenTopoMap (Bản đồ địa hình hiking/outdoor)',
    category: 'topo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
    subdomains: ['a', 'b', 'c']
  },
  {
    id: 'carto-dark',
    name: 'Bản đồ Tối GIS (CartoDB Dark Matter)',
    category: 'dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  },
  {
    id: 'carto-light',
    name: 'Bản đồ Sáng Tối giản (CartoDB Positron)',
    category: 'light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  }
];
