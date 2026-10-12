/**
 * Pre-configured realistic GPX samples in Vietnam for instant testing and demonstration
 */

export interface SampleGpxMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  distanceKm: string;
  elevationGainM: string;
  getXml: () => string;
}

export const SAMPLE_GPX_LIST: SampleGpxMeta[] = [
  {
    id: 'sample-westlake',
    name: 'Chạy bộ Hồ Tây (Lạc Long Quân - Quảng An - Nguyễn Đình Thi)',
    category: 'Chạy bộ / Strava Flyover',
    description: 'Cung chạy ven Hồ Tây kinh điển tại Hà Nội qua Vườn hoa Lạc Long Quân, Phủ Tây Hồ, đường Thanh Niên và Nguyễn Đình Thi.',
    color: '#fc5200', // Signature Strava Orange
    distanceKm: '15.2 km',
    elevationGainM: '+28 m',
    getXml: generateWestLakeGpx
  },
  {
    id: 'sample-fansipan',
    name: 'Trekking Đỉnh Fansipan (3.143m)',
    category: 'Leo núi / Trekking',
    description: 'Hành trình leo Trạm Tôn - Đỉnh Fansipan, nóc nhà Đông Dương tại Sa Pa, Lào Cai với độ dốc cao và cảnh sắc hùng vĩ.',
    color: '#10b981', // emerald
    distanceKm: '11.8 km',
    elevationGainM: '+1.220 m',
    getXml: generateFansipanGpx
  },
  {
    id: 'sample-hai-van',
    name: 'Chinh phục Đèo Hải Vân (Đà Nẵng - Huế)',
    category: 'Đạp xe / Phượt đường đèo',
    description: 'Cung đường ven biển và đèo dốc uốn lượn hùng vĩ nối liền Đà Nẵng và Vịnh Lăng Cô qua di tích Hải Vân Quan (496m).',
    color: '#38bdf8', // sky
    distanceKm: '21.5 km',
    elevationGainM: '+530 m',
    getXml: generateHaiVanGpx
  },
  {
    id: 'sample-truong-sa',
    name: 'Hải trình Tuần tra Đảo Nam Yết (Trường Sa, VN)',
    category: 'Hàng hải / Vùng biển đảo',
    description: 'Tuyến tuần duyên ven thềm san hô đảo Nam Yết, thuộc huyện đảo Trường Sa, tỉnh Khánh Hòa, Việt Nam.',
    color: '#f59e0b', // amber
    distanceKm: '14.2 km',
    elevationGainM: '+4 m',
    getXml: generateTruongSaGpx
  }
];

function generateFansipanGpx(): string {
  const points = [
    { lat: 22.3508, lon: 103.7758, ele: 1950, time: '2026-04-10T01:00:00Z' }, // Trạm Tôn
    { lat: 22.3475, lon: 103.7765, ele: 2010, time: '2026-04-10T01:25:00Z' },
    { lat: 22.3432, lon: 103.7780, ele: 2110, time: '2026-04-10T01:50:00Z' },
    { lat: 22.3398, lon: 103.7795, ele: 2215, time: '2026-04-10T02:20:00Z' }, // Lán 2200
    { lat: 22.3350, lon: 103.7788, ele: 2340, time: '2026-04-10T02:55:00Z' },
    { lat: 22.3312, lon: 103.7770, ele: 2470, time: '2026-04-10T03:30:00Z' },
    { lat: 22.3270, lon: 103.7745, ele: 2600, time: '2026-04-10T04:10:00Z' },
    { lat: 22.3235, lon: 103.7730, ele: 2710, time: '2026-04-10T04:50:00Z' },
    { lat: 22.3195, lon: 103.7735, ele: 2820, time: '2026-04-10T05:30:00Z' }, // Lán 2800
    { lat: 22.3150, lon: 103.7748, ele: 2950, time: '2026-04-10T06:15:00Z' },
    { lat: 22.3105, lon: 103.7752, ele: 3080, time: '2026-04-10T07:00:00Z' },
    { lat: 22.3034, lon: 103.7753, ele: 3143, time: '2026-04-10T07:35:00Z' }  // Cột mốc Fansipan
  ];

  const trkpts = points
    .map(
      (p) => `      <trkpt lat="${p.lat}" lon="${p.lon}">
        <ele>${p.ele}</ele>
        <time>${p.time}</time>
      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VietMap GPX Viewer - Hoang Lien Son Trek" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Trekking Fansipan 3.143m (Sa Pa - Lao Cai)</name>
    <desc>Hành trình chinh phục nóc nhà Đông Dương qua trạm kiểm lâm Trạm Tôn</desc>
    <time>2026-04-10T01:00:00Z</time>
  </metadata>
  <wpt lat="22.3508" lon="103.7758">
    <ele>1950</ele>
    <name>Trạm Tôn (Bắt đầu)</name>
    <desc>Trạm kiểm lâm Vườn Quốc gia Hoàng Liên, độ cao 1.950m</desc>
    <sym>Trailhead</sym>
  </wpt>
  <wpt lat="22.3398" lon="103.7795">
    <ele>2215</ele>
    <name>Lán nghỉ 2.200m</name>
    <desc>Trạm dừng chân và tiếp nước đầu tiên</desc>
    <sym>Campground</sym>
  </wpt>
  <wpt lat="22.3195" lon="103.7735">
    <ele>2820</ele>
    <name>Lán nghỉ 2.800m</name>
    <desc>Khu hạ trại qua đêm trước khi đón bình minh trên đỉnh</desc>
    <sym>Campground</sym>
  </wpt>
  <wpt lat="22.3034" lon="103.7753">
    <ele>3143</ele>
    <name>Cột mốc Đỉnh Fansipan</name>
    <desc>Đỉnh Fansipan 3.143m - Nóc nhà Đông Dương</desc>
    <sym>Summit</sym>
  </wpt>
  <trk>
    <name>Tuyến Trạm Tôn - Đỉnh Fansipan</name>
    <desc>Cung trekking truyền thống Vườn quốc gia Hoàng Liên</desc>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

function generateHaiVanGpx(): string {
  const points = [
    { lat: 16.1420, lon: 108.1320, ele: 15, time: '2026-05-15T06:00:00Z' }, // Chân đèo Đà Nẵng
    { lat: 16.1550, lon: 108.1310, ele: 85, time: '2026-05-15T06:18:00Z' },
    { lat: 16.1680, lon: 108.1305, ele: 190, time: '2026-05-15T06:36:00Z' },
    { lat: 16.1770, lon: 108.1315, ele: 320, time: '2026-05-15T06:58:00Z' },
    { lat: 16.1860, lon: 108.1325, ele: 440, time: '2026-05-15T07:22:00Z' },
    { lat: 16.1915, lon: 108.1320, ele: 496, time: '2026-05-15T07:45:00Z' }, // Đỉnh Hải Vân Quan
    { lat: 16.2000, lon: 108.1250, ele: 380, time: '2026-05-15T08:05:00Z' },
    { lat: 16.2120, lon: 108.1140, ele: 230, time: '2026-05-15T08:22:00Z' },
    { lat: 16.2230, lon: 108.1020, ele: 95, time: '2026-05-15T08:40:00Z' },
    { lat: 16.2310, lon: 108.0890, ele: 12, time: '2026-05-15T08:58:00Z' }  // Vịnh Lăng Cô
  ];

  const trkpts = points
    .map(
      (p) => `      <trkpt lat="${p.lat}" lon="${p.lon}">
        <ele>${p.ele}</ele>
        <time>${p.time}</time>
      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VietMap GPX Viewer - Hai Van Pass Route" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Chinh phục Đèo Hải Vân (Đà Nẵng - Huế)</name>
    <desc>Cung đường đèo biển đẹp nhất miền Trung Việt Nam</desc>
    <time>2026-05-15T06:00:00Z</time>
  </metadata>
  <wpt lat="16.1420" lon="108.1320">
    <ele>15</ele>
    <name>Chân đèo Nam Hải Vân</name>
    <desc>Điểm xuất phát phía TP. Đà Nẵng</desc>
  </wpt>
  <wpt lat="16.1915" lon="108.1320">
    <ele>496</ele>
    <name>Di tích Hải Vân Quan</name>
    <desc>Đỉnh đèo Hải Vân - Thiên hạ đệ nhất hùng quan</desc>
  </wpt>
  <wpt lat="16.2310" lon="108.0890">
    <ele>12</ele>
    <name>Vịnh Lăng Cô (Thừa Thiên Huế)</name>
    <desc>Vịnh biển đẹp thế giới, chân đèo phía Bắc</desc>
  </wpt>
  <trk>
    <name>Đoạn đường Quốc lộ 1A vượt Đèo Hải Vân</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

function generateTruongSaGpx(): string {
  const points = [
    { lat: 10.1750, lon: 114.3550, ele: 1, time: '2026-06-01T02:00:00Z' },
    { lat: 10.1780, lon: 114.3590, ele: 2, time: '2026-06-01T02:15:00Z' },
    { lat: 10.1806, lon: 114.3644, ele: 4, time: '2026-06-01T02:30:00Z' }, // Cầu cảng Nam Yết
    { lat: 10.1830, lon: 114.3700, ele: 2, time: '2026-06-01T02:45:00Z' },
    { lat: 10.1850, lon: 114.3750, ele: 1, time: '2026-06-01T03:00:00Z' },
    { lat: 10.1820, lon: 114.3790, ele: 1, time: '2026-06-01T03:15:00Z' },
    { lat: 10.1760, lon: 114.3730, ele: 1, time: '2026-06-01T03:30:00Z' },
    { lat: 10.1720, lon: 114.3630, ele: 1, time: '2026-06-01T03:45:00Z' },
    { lat: 10.1750, lon: 114.3550, ele: 1, time: '2026-06-01T04:00:00Z' }
  ];

  const trkpts = points
    .map(
      (p) => `      <trkpt lat="${p.lat}" lon="${p.lon}">
        <ele>${p.ele}</ele>
        <time>${p.time}</time>
      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VietMap GPX Viewer - Truong Sa Patrol" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Hải trình Tuần tra Đảo Nam Yết (Trường Sa, Việt Nam)</name>
    <desc>Huyện đảo Trường Sa, tỉnh Khánh Hòa, Việt Nam</desc>
    <time>2026-06-01T02:00:00Z</time>
  </metadata>
  <wpt lat="10.1806" lon="114.3644">
    <ele>4</ele>
    <name>Cầu cảng Đảo Nam Yết</name>
    <desc>Đảo Nam Yết, thuộc cụm đảo Nam Yết, huyện Trường Sa, tỉnh Khánh Hòa, Việt Nam</desc>
  </wpt>
  <wpt lat="10.1840" lon="114.3720">
    <ele>2</ele>
    <name>Hải đăng Nam Yết</name>
    <desc>Ngọn hải đăng chủ quyền chỉ dẫn an toàn hàng hải</desc>
  </wpt>
  <trk>
    <name>Vành đai tuần tra quanh rạn san hô Đảo Nam Yết</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

function generateWestLakeGpx(): string {
  // Authentic running path around West Lake, Hanoi
  // Starting at Vườn hoa Lạc Long Quân, passing Quảng An, Phủ Tây Hồ, Thanh Niên, Nguyễn Đình Thi, Trích Sài
  const points = [
    { lat: 21.0665, lon: 105.8188, ele: 12, time: '2026-10-12T06:00:00Z' }, // Vườn hoa Lạc Long Quân
    { lat: 21.0692, lon: 105.8215, ele: 12, time: '2026-10-12T06:03:20Z' }, // Phố Nhật Chiêu
    { lat: 21.0710, lon: 105.8250, ele: 13, time: '2026-10-12T06:06:50Z' }, // Công viên nước Hồ Tây
    { lat: 21.0685, lon: 105.8285, ele: 13, time: '2026-10-12T06:10:30Z' }, // Sen Tây Hồ
    { lat: 21.0645, lon: 105.8305, ele: 14, time: '2026-10-12T06:14:15Z' }, // Đặng Thai Mai
    { lat: 21.0622, lon: 105.8335, ele: 14, time: '2026-10-12T06:18:00Z' }, // Phố Quảng An
    { lat: 21.0595, lon: 105.8360, ele: 15, time: '2026-10-12T06:21:40Z' }, // Phủ Tây Hồ
    { lat: 21.0550, lon: 105.8350, ele: 14, time: '2026-10-12T06:25:20Z' }, // Bến Hàn Quốc / Quảng Bá
    { lat: 21.0515, lon: 105.8365, ele: 13, time: '2026-10-12T06:29:10Z' }, // Làng Yên Phụ
    { lat: 21.0478, lon: 105.8368, ele: 14, time: '2026-10-12T06:33:00Z' }, // Đường Thanh Niên
    { lat: 21.0460, lon: 105.8330, ele: 13, time: '2026-10-12T06:36:45Z' }, // Chùa Trấn Quốc
    { lat: 21.0448, lon: 105.8295, ele: 12, time: '2026-10-12T06:40:30Z' }, // Phố Nguyễn Đình Thi
    { lat: 21.0442, lon: 105.8250, ele: 13, time: '2026-10-12T06:44:20Z' }, // Nguyễn Đình Thi ven hồ
    { lat: 21.0455, lon: 105.8205, ele: 12, time: '2026-10-12T06:48:10Z' }, // Phố Trích Sài
    { lat: 21.0490, lon: 105.8175, ele: 13, time: '2026-10-12T06:52:00Z' }, // Trích Sài - Văn Cao
    { lat: 21.0545, lon: 105.8160, ele: 12, time: '2026-10-12T06:55:50Z' }, // Trích Sài đoạn giữa
    { lat: 21.0600, lon: 105.8168, ele: 13, time: '2026-10-12T06:59:40Z' }, // Phố Lạc Long Quân
    { lat: 21.0665, lon: 105.8188, ele: 12, time: '2026-10-12T07:03:30Z' }  // Về đích Vườn hoa Lạc Long Quân
  ];

  const trkpts = points
    .map(
      (p) => `      <trkpt lat="${p.lat}" lon="${p.lon}">
        <ele>${p.ele}</ele>
        <time>${p.time}</time>
      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VietMap Strava Replay Simulator" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Đường Lạc Long Quân-Phố Quảng An-Phố Nguyễn Đình Thi</name>
    <desc>Cung chạy vòng quanh Hồ Tây kinh điển, TP. Hà Nội</desc>
    <time>2026-10-12T06:00:00Z</time>
  </metadata>
  <wpt lat="21.0665" lon="105.8188">
    <ele>12</ele>
    <name>Vườn hoa Lạc Long Quân (Xuất phát)</name>
    <desc>Hai con rồng gốm sứ Tây Hồ, điểm hẹn chạy bộ</desc>
  </wpt>
  <wpt lat="21.0622" lon="105.8335">
    <ele>14</ele>
    <name>Phố Quảng An</name>
    <desc>Khu vực ven hồ phía Đông Bắc</desc>
  </wpt>
  <wpt lat="21.0478" lon="105.8368">
    <ele>14</ele>
    <name>Đường Thanh Niên - Chùa Trấn Quốc</name>
    <desc>Dải phân cách giữa Hồ Tây và Hồ Trúc Bạch</desc>
  </wpt>
  <wpt lat="21.0448" lon="105.8295">
    <ele>12</ele>
    <name>Phố Nguyễn Đình Thi</name>
    <desc>Đoạn đường ven hồ rợp bóng cây</desc>
  </wpt>
  <trk>
    <name>Đường Lạc Long Quân-Phố Quảng An-Phố Nguyễn Đình Thi</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

