import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GPXFileItem, GPXPoint, GPXWaypoint } from '../../types/gpx';
import { GeoAnnotation, MapViewSettings, TileProvider } from '../../types/map';
import { TILE_PROVIDERS, VIETNAM_GEO_ANNOTATIONS } from '../../data/vietnamGeoAnnotations';

interface MapViewProps {
  files: GPXFileItem[];
  selectedFileId: string | null;
  activePoint: GPXPoint | null;
  onPointSelect?: (point: GPXPoint) => void;
  onWaypointSelect?: (waypoint: GPXWaypoint, file: GPXFileItem) => void;
  onAnnotationSelect?: (annotation: GeoAnnotation) => void;
  settings: MapViewSettings;
  onSettingsChange: (settings: MapViewSettings) => void;
  fitBoundsTrigger: number;
  focusVietnamTrigger: number;
}

export const MapView: React.FC<MapViewProps> = ({
  files,
  selectedFileId,
  activePoint,
  onPointSelect,
  onWaypointSelect,
  onAnnotationSelect,
  settings,
  onSettingsChange,
  fitBoundsTrigger,
  focusVietnamTrigger
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups for clean management
  const gpxLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const annotationLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const scrubMarkerRef = useRef<L.CircleMarker | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(6);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Vietnam maritime and inland area [15.5, 108.5]
    const map = L.map(mapContainerRef.current, {
      center: [15.5, 108.5],
      zoom: 6,
      zoomControl: false, // Custom placed controls
      attributionControl: true
    });

    // Metric scale control
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Initial tile layer
    const initialProvider =
      TILE_PROVIDERS.find((p) => p.id === settings.tileProviderId) || TILE_PROVIDERS[0];
    const tileLayer = L.tileLayer(initialProvider.url, {
      attribution: initialProvider.attribution,
      maxZoom: initialProvider.maxZoom,
      subdomains: initialProvider.subdomains || ['a', 'b', 'c']
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create persistent layer groups
    const gpxGroup = L.layerGroup().addTo(map);
    const annotationGroup = L.layerGroup().addTo(map);
    gpxLayerGroupRef.current = gpxGroup;
    annotationLayerGroupRef.current = annotationGroup;

    // Track zoom and mousemove
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: parseFloat(e.latlng.lat.toFixed(5)),
        lng: parseFloat(e.latlng.lng.toFixed(5))
      });
    });

    map.on('mouseout', () => {
      setMouseCoords(null);
    });

    mapInstanceRef.current = map;

    // Ensure map updates dimensions if sidebar expands/collapses
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Tile Provider change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const provider =
      TILE_PROVIDERS.find((p) => p.id === settings.tileProviderId) || TILE_PROVIDERS[0];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || ['a', 'b', 'c']
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [settings.tileProviderId]);

  // 3. Render Vietnam Sovereign Geographic Annotation Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = annotationLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!settings.showVietnamAnnotations) return;

    VIETNAM_GEO_ANNOTATIONS.forEach((anno) => {
      // Check if zoom level is in range
      if (currentZoom < anno.zoomRange[0] || currentZoom > anno.zoomRange[1]) return;

      const isArchipelago = anno.category === 'archipelago';
      const isMaritime = anno.category === 'maritime';

      // Custom HTML Icon for Sovereignty Banner
      let customHtml = '';
      let iconSize: [number, number] = [240, 48];
      let iconAnchor: [number, number] = [120, 24];

      if (isArchipelago) {
        customHtml = `
          <div class="sovereign-banner px-3 py-1.5 rounded-lg border border-amber-400/80 bg-slate-900/90 backdrop-blur-md shadow-2xl flex items-center gap-2 cursor-pointer hover:border-amber-300 transition-all transform hover:scale-105">
            <div class="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-inner">
              <span class="text-amber-300 text-[10px] font-bold leading-none">★</span>
            </div>
            <div class="text-left">
              <div class="text-[12px] font-bold text-amber-300 whitespace-nowrap leading-tight tracking-wide">
                ${anno.nameVi}
              </div>
              <div class="text-[9px] text-slate-300 font-medium leading-none">
                ${anno.administrativeUnit || 'Chủ quyền toàn vẹn của Việt Nam'}
              </div>
            </div>
          </div>
        `;
        iconSize = [250, 42];
        iconAnchor = [125, 21];
      } else if (isMaritime) {
        customHtml = `
          <div class="px-3 py-1 rounded-md border border-cyan-500/40 bg-slate-950/80 text-cyan-200 text-[11px] font-semibold tracking-wider shadow-lg">
            ${anno.nameVi}
          </div>
        `;
        iconSize = [200, 30];
        iconAnchor = [100, 15];
      } else {
        // Individual Islands
        customHtml = `
          <div class="island-badge px-2 py-0.5 rounded border border-amber-500/60 bg-slate-900/90 text-[10px] text-amber-200 font-semibold shadow-md flex items-center gap-1 cursor-pointer hover:bg-slate-800">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span class="whitespace-nowrap">${anno.nameVi}</span>
          </div>
        `;
        iconSize = [150, 24];
        iconAnchor = [75, 12];
      }

      const icon = L.divIcon({
        html: customHtml,
        className: 'vietnam-annotation-marker',
        iconSize,
        iconAnchor
      });

      const marker = L.marker(anno.center, { icon });
      marker.on('click', () => {
        if (onAnnotationSelect) onAnnotationSelect(anno);
      });

      // Add gentle bounding box highlight for archipelago at mid zoom
      if (isArchipelago && anno.bounds && currentZoom >= 5 && currentZoom <= 9) {
        const rect = L.rectangle(anno.bounds, {
          color: '#f59e0b',
          weight: 1,
          dashArray: '4, 4',
          fillColor: '#f59e0b',
          fillOpacity: 0.05,
          interactive: false
        });
        group.addLayer(rect);
      }

      group.addLayer(marker);
    });
  }, [settings.showVietnamAnnotations, currentZoom, onAnnotationSelect]);

  // 4. Render GPX Tracks, Routes, and Waypoints
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = gpxLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    files.forEach((file) => {
      if (!file.visible) return;

      const isSelected = selectedFileId === file.id;
      const fileColor = file.color;

      // 4A. Render Tracks
      if (settings.showTracks) {
        file.tracks.forEach((track) => {
          track.segments.forEach((seg) => {
            if (seg.points.length === 0) return;

            const latlngs: [number, number][] = seg.points.map((p) => [p.lat, p.lng]);

            // Main Polyline
            const polyline = L.polyline(latlngs, {
              color: fileColor,
              weight: isSelected ? 5 : 3.5,
              opacity: isSelected ? 0.95 : 0.8,
              lineJoin: 'round',
              lineCap: 'round'
            });

            // Interactive popup / click
            polyline.on('click', (e: L.LeafletMouseEvent) => {
              // Find closest point to click
              const clickLat = e.latlng.lat;
              const clickLng = e.latlng.lng;
              let closest = seg.points[0];
              let minDist = Infinity;

              seg.points.forEach((pt) => {
                const d = Math.hypot(pt.lat - clickLat, pt.lng - clickLng);
                if (d < minDist) {
                  minDist = d;
                  closest = pt;
                }
              });

              if (onPointSelect) onPointSelect(closest);
            });

            group.addLayer(polyline);

            // Add Start & End Markers for first & last points of segment
            if (seg.points.length >= 2) {
              const startPt = seg.points[0];
              const endPt = seg.points[seg.points.length - 1];

              // Start Icon (Green)
              const startIcon = L.divIcon({
                html: `
                  <div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                    A
                  </div>
                `,
                className: 'gpx-term-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              const startMarker = L.marker([startPt.lat, startPt.lng], { icon: startIcon });
              startMarker.bindTooltip(`Bắt đầu: ${track.name} (${startPt.ele ? startPt.ele + 'm' : ''})`, {
                direction: 'top',
                offset: [0, -12]
              });
              group.addLayer(startMarker);

              // End Icon (Rose / Red)
              const endIcon = L.divIcon({
                html: `
                  <div class="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                    B
                  </div>
                `,
                className: 'gpx-term-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              const endMarker = L.marker([endPt.lat, endPt.lng], { icon: endIcon });
              endMarker.bindTooltip(`Kết thúc: ${track.name} (${endPt.ele ? endPt.ele + 'm' : ''})`, {
                direction: 'top',
                offset: [0, -12]
              });
              group.addLayer(endMarker);
            }
          });
        });
      }

      // 4B. Render Routes
      if (settings.showRoutes && file.showRoutes) {
        file.routes.forEach((route) => {
          if (route.points.length === 0) return;
          const latlngs: [number, number][] = route.points.map((p) => [p.lat, p.lng]);

          const routeLine = L.polyline(latlngs, {
            color: fileColor,
            weight: 3,
            dashArray: '6, 8',
            opacity: 0.85
          });

          routeLine.bindTooltip(`Route: ${route.name} (${(route.distance / 1000).toFixed(1)} km)`, {
            sticky: true
          });
          group.addLayer(routeLine);
        });
      }

      // 4C. Render Waypoints
      if (settings.showWaypoints && file.showWaypoints) {
        file.waypoints.forEach((wpt) => {
          const wptIcon = L.divIcon({
            html: `
              <div class="wpt-pin w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold transform hover:scale-125 transition-transform" style="background-color: ${fileColor}">
                ★
              </div>
            `,
            className: 'gpx-wpt-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const wptMarker = L.marker([wpt.lat, wpt.lng], { icon: wptIcon });
          wptMarker.bindTooltip(wpt.name, { direction: 'top', offset: [0, -10] });

          wptMarker.on('click', () => {
            if (onWaypointSelect) onWaypointSelect(wpt, file);
          });

          group.addLayer(wptMarker);
        });
      }
    });
  }, [files, selectedFileId, settings.showTracks, settings.showRoutes, settings.showWaypoints, onPointSelect, onWaypointSelect]);

  // 5. Active scrub point indicator from elevation chart
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (scrubMarkerRef.current) {
      map.removeLayer(scrubMarkerRef.current);
      scrubMarkerRef.current = null;
    }

    if (activePoint) {
      const marker = L.circleMarker([activePoint.lat, activePoint.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 3,
        fillColor: '#38bdf8',
        fillOpacity: 1
      }).addTo(map);

      // Tooltip with distance and elevation
      const kmText = activePoint.distanceFromStart
        ? `${(activePoint.distanceFromStart / 1000).toFixed(2)} km`
        : '';
      const eleText = activePoint.ele !== undefined ? `${Math.round(activePoint.ele)} m` : '';
      const content = [kmText, eleText].filter(Boolean).join(' · ');

      if (content) {
        marker.bindTooltip(content, { permanent: true, direction: 'top', offset: [0, -10] }).openTooltip();
      }

      scrubMarkerRef.current = marker;
    }
  }, [activePoint]);

  // 6. Handle Fit Bounds trigger
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || files.length === 0) return;

    const visibleFiles = files.filter((f) => f.visible);
    if (visibleFiles.length === 0) return;

    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    visibleFiles.forEach((file) => {
      const b = file.stats.bounds;
      minLat = Math.min(minLat, b.minLat);
      maxLat = Math.max(maxLat, b.maxLat);
      minLng = Math.min(minLng, b.minLng);
      maxLng = Math.max(maxLng, b.maxLng);
    });

    if (minLat <= maxLat && minLng <= maxLng) {
      map.fitBounds(
        [
          [minLat, minLng],
          [maxLat, maxLng]
        ],
        { padding: [50, 50], maxZoom: 15, animate: true }
      );
    }
  }, [fitBoundsTrigger]);

  // 7. Handle Focus Vietnam Maritime trigger
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || focusVietnamTrigger === 0) return;

    // View encompassing Vietnam inland, East Sea, Hoang Sa and Truong Sa
    map.flyToBounds(
      [
        [6.5, 102.0],
        [23.5, 117.5]
      ],
      { duration: 1.2, padding: [20, 20] }
    );
  }, [focusVietnamTrigger]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Right Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Layer & Basemap Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700/80 shadow-xl backdrop-blur-md transition-all active:scale-95"
            title="Đổi bản đồ nền và quản lý lớp hiển thị"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Bản đồ & Lớp</span>
          </button>

          {/* Layer Popover Menu */}
          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-4 backdrop-blur-xl z-30 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="font-semibold text-slate-200">Cấu hình Bản đồ</span>
                <button
                  onClick={() => setShowLayerMenu(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              {/* Base Map Providers */}
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Bản đồ nền (Base Map)
                </span>
                <div className="space-y-1.5">
                  {TILE_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        onSettingsChange({ ...settings, tileProviderId: provider.id });
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                        settings.tileProviderId === provider.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{provider.name}</span>
                      {settings.tileProviderId === provider.id && (
                        <span className="text-cyan-400 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggleable Layers */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Lớp thông tin hiển thị
                </span>
                <div className="space-y-2">
                  {/* Sovereign Vietnam Annotation Layer */}
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                    <span className="text-amber-300 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Hoàng Sa & Trường Sa (VN)
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showVietnamAnnotations}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          showVietnamAnnotations: e.target.checked
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                  </label>

                  {/* Tracks */}
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                    <span className="text-slate-300">Đường Track GPX</span>
                    <input
                      type="checkbox"
                      checked={settings.showTracks}
                      onChange={(e) =>
                        onSettingsChange({ ...settings, showTracks: e.target.checked })
                      }
                      className="rounded accent-cyan-500"
                    />
                  </label>

                  {/* Routes */}
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                    <span className="text-slate-300">Tuyến đường (Routes)</span>
                    <input
                      type="checkbox"
                      checked={settings.showRoutes}
                      onChange={(e) =>
                        onSettingsChange({ ...settings, showRoutes: e.target.checked })
                      }
                      className="rounded accent-cyan-500"
                    />
                  </label>

                  {/* Waypoints */}
                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                    <span className="text-slate-300">Điểm mốc (Waypoints)</span>
                    <input
                      type="checkbox"
                      checked={settings.showWaypoints}
                      onChange={(e) =>
                        onSettingsChange({ ...settings, showWaypoints: e.target.checked })
                      }
                      className="rounded accent-cyan-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Map Action Buttons */}
        <div className="flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-700/80 shadow-xl backdrop-blur-md">
          {/* Zoom In */}
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all font-bold"
            title="Phóng to"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all font-bold"
            title="Thu nhỏ"
          >
            −
          </button>
          <div className="h-px bg-slate-800 my-0.5" />
          {/* Fit GPX Data */}
          <button
            onClick={() => {
              if (files.length > 0) {
                const visibleFiles = files.filter((f) => f.visible);
                if (visibleFiles.length > 0) {
                  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                  visibleFiles.forEach((file) => {
                    const b = file.stats.bounds;
                    minLat = Math.min(minLat, b.minLat);
                    maxLat = Math.max(maxLat, b.maxLat);
                    minLng = Math.min(minLng, b.minLng);
                    maxLng = Math.max(maxLng, b.maxLng);
                  });
                  mapInstanceRef.current?.fitBounds([
                    [minLat, minLng],
                    [maxLat, maxLng]
                  ], { padding: [50, 50], maxZoom: 15 });
                }
              }
            }}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-slate-800 active:scale-95 transition-all"
            title="Căn vừa toàn bộ dữ liệu GPX"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          {/* Focus Vietnam Maritime Territory */}
          <button
            onClick={() => {
              mapInstanceRef.current?.flyToBounds([
                [6.5, 102.0],
                [23.5, 117.5]
              ], { duration: 1.2 });
            }}
            className="w-8 h-8 rounded flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 active:scale-95 transition-all"
            title="Căn toàn cảnh Biển đảo Việt Nam (Hoàng Sa & Trường Sa)"
          >
            ★
          </button>
        </div>
      </div>

      {/* Bottom Floating Telemetry & Coordinate Bar */}
      <div className="absolute bottom-6 right-4 z-20 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-3 shadow-lg pointer-events-auto">
          {mouseCoords ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Tọa độ:</span>
              <span className="text-slate-200 tabular-nums">
                {mouseCoords.lat.toFixed(4)}°N, {mouseCoords.lng.toFixed(4)}°E
              </span>
            </div>
          ) : (
            <span className="text-slate-500">Di chuột để xem tọa độ</span>
          )}
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Zoom:</span>
            <span className="text-cyan-400 font-semibold tabular-nums">{currentZoom}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
