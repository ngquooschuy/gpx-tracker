import { GPXFileItem } from '../types/gpx';

/**
 * Converts a GPXFileItem to a standard GeoJSON FeatureCollection
 */
export function exportToGeoJSON(fileItem: GPXFileItem): string {
  const features: any[] = [];

  // Add Tracks as LineStrings or MultiLineStrings
  fileItem.tracks.forEach((track, tIdx) => {
    track.segments.forEach((seg, sIdx) => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: seg.points.map((pt) => [
            pt.lng,
            pt.lat,
            pt.ele !== undefined ? pt.ele : 0
          ])
        },
        properties: {
          entityType: 'track',
          trackIndex: tIdx,
          trackName: track.name,
          segmentIndex: sIdx,
          pointsCount: seg.points.length,
          distanceMeters: Math.round(seg.distance),
          file: fileItem.fileName
        }
      });
    });
  });

  // Add Routes
  fileItem.routes.forEach((route, rIdx) => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: route.points.map((pt) => [
          pt.lng,
          pt.lat,
          pt.ele !== undefined ? pt.ele : 0
        ])
      },
      properties: {
        entityType: 'route',
        routeIndex: rIdx,
        routeName: route.name,
        pointsCount: route.points.length,
        distanceMeters: Math.round(route.distance),
        file: fileItem.fileName
      }
    });
  });

  // Add Waypoints
  fileItem.waypoints.forEach((wpt) => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          wpt.lng,
          wpt.lat,
          wpt.ele !== undefined ? wpt.ele : 0
        ]
      },
      properties: {
        entityType: 'waypoint',
        name: wpt.name,
        desc: wpt.desc,
        symbol: wpt.sym,
        elevation: wpt.ele,
        time: wpt.time?.toISOString(),
        file: fileItem.fileName
      }
    });
  });

  const geoJson = {
    type: 'FeatureCollection',
    metadata: {
      generatedBy: 'VietMap GPX Viewer',
      sourceFile: fileItem.fileName,
      totalDistanceKm: fileItem.stats.totalDistanceKm,
      elevationGainM: fileItem.stats.elevationGainM,
      elevationLossM: fileItem.stats.elevationLossM,
      exportedAt: new Date().toISOString()
    },
    features
  };

  return JSON.stringify(geoJson, null, 2);
}

/**
 * Exports summary statistics of multiple files as CSV
 */
export function exportStatsToCSV(files: GPXFileItem[]): string {
  const headers = [
    'Tên File',
    'Tổng Quãng Đường (km)',
    'Số Track',
    'Số Route',
    'Số Waypoint',
    'Tổng Điểm GPS',
    'Độ Cao Thấp Nhất (m)',
    'Độ Cao Cao Nhất (m)',
    'Độ Cao Tăng (m)',
    'Độ Cao Giảm (m)',
    'Thời Gian Bắt Đầu',
    'Thời Gian Kết Thúc',
    'Tổng Thời Gian (phút)',
    'Thời Gian Di Chuyển (phút)',
    'Tốc Độ TB (km/h)',
    'Tốc Độ TB Di Chuyển (km/h)',
    'Tốc Độ Tối Đa (km/h)'
  ];

  const rows = files.map((f) => {
    const s = f.stats;
    return [
      `"${f.fileName.replace(/"/g, '""')}"`,
      s.totalDistanceKm,
      s.trackCount,
      s.routeCount,
      s.waypointCount,
      s.totalPointsCount,
      s.minElevationM ?? '',
      s.maxElevationM ?? '',
      s.elevationGainM ?? '',
      s.elevationLossM ?? '',
      s.startTime ? s.startTime.toISOString() : '',
      s.endTime ? s.endTime.toISOString() : '',
      s.totalDurationSeconds ? (s.totalDurationSeconds / 60).toFixed(1) : '',
      s.movingDurationSeconds ? (s.movingDurationSeconds / 60).toFixed(1) : '',
      s.avgSpeedKmh ?? '',
      s.avgMovingSpeedKmh ?? '',
      s.maxSpeedKmh ?? ''
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers browser download of text file (GPX, GeoJSON, CSV)
 */
export function triggerFileDownload(
  content: string,
  fileName: string,
  mimeType: string = 'application/json'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
