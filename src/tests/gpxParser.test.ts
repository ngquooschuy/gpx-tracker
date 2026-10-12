import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, parseGPXString } from '../services/gpxParser';
import { exportStatsToCSV, exportToGeoJSON } from '../services/gpxExporter';
import { VIETNAM_GEO_ANNOTATIONS, TILE_PROVIDERS } from '../data/vietnamGeoAnnotations';

describe('VietMap GPX Parser & Geo Engine', () => {
  it('correctly calculates Haversine distance between two known coordinates', () => {
    // Da Nang (16.0544, 108.2022) to Hue (16.4637, 107.5909) ~ 82 km
    const distM = calculateHaversineDistance(16.0544, 108.2022, 16.4637, 107.5909);
    const distKm = distM / 1000;
    expect(distKm).toBeGreaterThan(75);
    expect(distKm).toBeLessThan(90);
  });

  it('parses valid GPX file with tracks, elevation and timestamps', () => {
    const validGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test Suite">
  <trk>
    <name>Trek Fansipan Test</name>
    <trkseg>
      <trkpt lat="22.3508" lon="103.7758">
        <ele>1950</ele>
        <time>2026-04-10T01:00:00Z</time>
      </trkpt>
      <trkpt lat="22.3398" lon="103.7795">
        <ele>2215</ele>
        <time>2026-04-10T02:00:00Z</time>
      </trkpt>
      <trkpt lat="22.3034" lon="103.7753">
        <ele>3143</ele>
        <time>2026-04-10T05:00:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
  <wpt lat="22.3034" lon="103.7753">
    <name>Dinh Fansipan</name>
    <ele>3143</ele>
  </wpt>
</gpx>`;

    const result = parseGPXString(validGpx, 'test_fansipan.gpx', 1024, '#06b6d4');
    expect(result.tracks.length).toBe(1);
    expect(result.tracks[0].name).toBe('Trek Fansipan Test');
    expect(result.waypoints.length).toBe(1);
    expect(result.waypoints[0].name).toBe('Dinh Fansipan');
    expect(result.stats.hasElevation).toBe(true);
    expect(result.stats.minElevationM).toBe(1950);
    expect(result.stats.maxElevationM).toBe(3143);
    expect(result.stats.elevationGainM).toBeGreaterThanOrEqual(1190);
    expect(result.stats.totalDistanceKm).toBeGreaterThan(4);
    expect(result.stats.hasTime).toBe(true);
  });

  it('gracefully parses GPX with multiple routes, tracks and waypoints', () => {
    const multiGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk><name>Track A</name><trkseg><trkpt lat="10.0" lon="106.0"/></trkseg></trk>
  <trk><name>Track B</name><trkseg><trkpt lat="10.1" lon="106.1"/></trkseg></trk>
  <rte><name>Route 1</name><rtept lat="10.2" lon="106.2"/></rte>
  <wpt lat="10.3" lon="106.3"><name>Waypoint 1</name></wpt>
</gpx>`;

    const result = parseGPXString(multiGpx, 'multi.gpx', 500, '#10b981');
    expect(result.tracks.length).toBe(2);
    expect(result.routes.length).toBe(1);
    expect(result.waypoints.length).toBe(1);
    expect(result.stats.trackCount).toBe(2);
    expect(result.stats.routeCount).toBe(1);
    expect(result.stats.waypointCount).toBe(1);
  });

  it('handles GPX without elevation or timestamps without throwing', () => {
    const plainGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <name>Plain Line</name>
    <trkseg>
      <trkpt lat="16.0" lon="108.0"/>
      <trkpt lat="16.1" lon="108.1"/>
    </trkseg>
  </trk>
</gpx>`;

    const result = parseGPXString(plainGpx, 'plain.gpx', 300, '#f59e0b');
    expect(result.stats.hasElevation).toBe(false);
    expect(result.stats.elevationGainM).toBeNull();
    expect(result.stats.hasTime).toBe(false);
    expect(result.stats.startTime).toBeNull();
    expect(result.stats.totalDistanceKm).toBeGreaterThan(0);
  });

  it('throws an error for empty file or malformed XML', () => {
    expect(() => parseGPXString('', 'empty.gpx', 0, '#ef4444')).toThrow();
    expect(() => parseGPXString('<xml><unclosed>', 'broken.gpx', 20, '#ef4444')).toThrow();
    expect(() => parseGPXString('<note><body>Not a GPX</body></note>', 'note.xml', 30, '#ef4444')).toThrow();
  });

  it('rejects points with invalid coordinates', () => {
    const invalidCoordsGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <name>Bad Points</name>
    <trkseg>
      <trkpt lat="999.0" lon="108.0"/>
      <trkpt lat="16.0" lon="999.0"/>
    </trkseg>
  </trk>
</gpx>`;

    expect(() => parseGPXString(invalidCoordsGpx, 'bad.gpx', 100, '#ef4444')).toThrow(
      /không chứa dữ liệu track, route hoặc waypoint/
    );
  });

  it('exports parsed file to valid GeoJSON FeatureCollection', () => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <name>GeoJSON Test</name>
    <trkseg>
      <trkpt lat="16.0" lon="108.0"><ele>100</ele></trkpt>
      <trkpt lat="16.1" lon="108.1"><ele>200</ele></trkpt>
    </trkseg>
  </trk>
  <wpt lat="16.0" lon="108.0"><name>WP1</name></wpt>
</gpx>`;
    const parsed = parseGPXString(gpx, 'test.gpx', 200, '#06b6d4');
    const geoJsonStr = exportToGeoJSON(parsed);
    const parsedJson = JSON.parse(geoJsonStr);

    expect(parsedJson.type).toBe('FeatureCollection');
    expect(parsedJson.features.length).toBe(2); // 1 track LineString + 1 waypoint Point
    expect(parsedJson.features[0].geometry.type).toBe('LineString');
    expect(parsedJson.features[1].geometry.type).toBe('Point');
  });

  it('exports summary stats to CSV correctly', () => {
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <name>CSV Test</name>
    <trkseg>
      <trkpt lat="16.0" lon="108.0"/>
      <trkpt lat="16.1" lon="108.1"/>
    </trkseg>
  </trk>
</gpx>`;
    const parsed = parseGPXString(gpx, 'csv_test.gpx', 200, '#06b6d4');
    const csv = exportStatsToCSV([parsed]);

    expect(csv).toContain('Tên File');
    expect(csv).toContain('csv_test.gpx');
  });
});

describe('Vietnam Geographic Sovereignty Layer Integrity', () => {
  it('contains dedicated annotations for Hoàng Sa and Trường Sa archipelagos', () => {
    const hoangSa = VIETNAM_GEO_ANNOTATIONS.find((a) => a.id === 'hoang-sa-archipelago');
    const truongSa = VIETNAM_GEO_ANNOTATIONS.find((a) => a.id === 'truong-sa-archipelago');

    expect(hoangSa).toBeDefined();
    expect(hoangSa?.nameVi).toContain('Quần đảo Hoàng Sa, Việt Nam');
    expect(hoangSa?.administrativeUnit).toContain('Đà Nẵng');

    expect(truongSa).toBeDefined();
    expect(truongSa?.nameVi).toContain('Quần đảo Trường Sa, Việt Nam');
    expect(truongSa?.administrativeUnit).toContain('Khánh Hòa');
  });

  it('has independent tile providers and annotations with zoom ranges', () => {
    expect(TILE_PROVIDERS.length).toBeGreaterThanOrEqual(3);
    VIETNAM_GEO_ANNOTATIONS.forEach((anno) => {
      expect(anno.zoomRange[0]).toBeLessThanOrEqual(anno.zoomRange[1]);
      expect(anno.center[0]).toBeGreaterThan(0);
      expect(anno.center[1]).toBeGreaterThan(100);
    });
  });
});
