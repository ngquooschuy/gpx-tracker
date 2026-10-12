import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Map as MapLibreMap, Marker, GeoJSONSource, config } from 'maplibre-gl';
import { GPXFileItem, GPXPoint } from '../../types/gpx';
import { CameraFollowMode } from '../../types/map';

// Explicitly set the worker URL to the local public static worker file to prevent "Worker failed to load"
if (typeof window !== 'undefined') {
  try {
    config.WORKER_URL = `${window.location.origin}/maplibre-gl-worker.mjs`;
  } catch {
    config.WORKER_URL = '/maplibre-gl-worker.mjs';
  }
}

interface StravaFlyover3DProps {
  file: GPXFileItem;
  isOpen: boolean;
  onClose: () => void;
}

// Calculate compass bearing from (lat1, lon1) to (lat2, lon2)
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Haversine distance in meters
function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface DensePoint {
  lng: number;
  lat: number;
  ele: number;
  cumDist: number;
  bearing: number;
  grade: number;
}

export const StravaFlyover3D: React.FC<StravaFlyover3DProps> = ({
  file,
  isOpen,
  onClose
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const runnerMarkerRef = useRef<Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Flatten raw points
  const rawPoints = useMemo(() => {
    const pts: GPXPoint[] = [];
    file.tracks.forEach((track) => {
      track.segments.forEach((seg) => {
        seg.points.forEach((p) => pts.push(p));
      });
    });
    if (pts.length === 0) {
      file.routes.forEach((route) => {
        route.points.forEach((p) => pts.push(p));
      });
    }
    return pts;
  }, [file]);

  // Pre-generate High-Density Dense Points (every ~5-8 meters) for buttery smooth drawing and camera
  const densePathData = useMemo(() => {
    if (rawPoints.length < 2) return null;

    const dense: DensePoint[] = [];
    let totalDist = 0;

    // Start point
    dense.push({
      lng: rawPoints[0].lng,
      lat: rawPoints[0].lat,
      ele: rawPoints[0].ele || 0,
      cumDist: 0,
      bearing: calculateBearing(
        rawPoints[0].lat,
        rawPoints[0].lng,
        rawPoints[1].lat,
        rawPoints[1].lng
      ),
      grade: 0
    });

    const STEP_METERS = 6; // Dense 6m spacing for seamless line growth

    for (let i = 0; i < rawPoints.length - 1; i++) {
      const p1 = rawPoints[i];
      const p2 = rawPoints[i + 1];
      const segDist = haversineDist(p1.lat, p1.lng, p2.lat, p2.lng);
      const segBearing = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);
      const e1 = p1.ele || 0;
      const e2 = p2.ele || e1;
      const segGrade = segDist > 1 ? ((e2 - e1) / segDist) * 100 : 0;

      const numSubSteps = Math.max(1, Math.round(segDist / STEP_METERS));

      for (let s = 1; s <= numSubSteps; s++) {
        const t = s / numSubSteps;
        const subDist = (segDist / numSubSteps);
        totalDist += subDist;

        const subLng = p1.lng + t * (p2.lng - p1.lng);
        const subLat = p1.lat + t * (p2.lat - p1.lat);
        const subEle = e1 + t * (e2 - e1);

        dense.push({
          lng: subLng,
          lat: subLat,
          ele: subEle,
          cumDist: totalDist,
          bearing: segBearing,
          grade: segGrade
        });
      }
    }

    return {
      points: dense,
      totalDistance: totalDist
    };
  }, [rawPoints]);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // Default to 1x (smooth cinematic pace)
  const [cameraMode, setCameraMode] = useState<CameraFollowMode>('3d-flyover');
  const [aspectRatioMode, setAspectRatioMode] = useState<'reel' | 'full'>('full');
  const [tileMode, setTileMode] = useState<'satellite' | 'street' | 'dark'>('satellite');

  // Progress ref (in meters) for zero-latency 60fps render loop
  const progressDistRef = useRef<number>(0);

  // HUD display values
  const [hudState, setHudState] = useState({
    distanceCoveredKm: '0,0',
    elevationGainM: 0,
    currentGrade: 0,
    progressPercent: 0
  });

  // Camera lazy-follow state
  const cameraStateRef = useRef({
    lng: rawPoints[0]?.lng || 105.82,
    lat: rawPoints[0]?.lat || 21.06,
    bearing: 0
  });

  const totalDistKm = densePathData
    ? (densePathData.totalDistance / 1000).toFixed(1).replace('.', ',')
    : '0,0';

  // Setup layers on map load:
  // NOTICE: We ONLY paint the line drawn behind the runner (no orange line ahead of the runner!),
  // exactly matching Strava Flyover in image.png!
  const setupLayers = useCallback((map: MapLibreMap) => {
    if (!map || rawPoints.length < 2) return;

    const startPt = rawPoints[0];

    // Source for completed route line (drawn dynamically following the dot)
    if (!map.getSource('active-trail')) {
      map.addSource('active-trail', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            // Must have >= 2 coordinates for valid GeoJSON
            coordinates: [
              [startPt.lng, startPt.lat],
              [startPt.lng, startPt.lat]
            ]
          }
        }
      });

      // 1. Heavy Black Outer Casing (Deep black border as seen in Strava photo)
      map.addLayer({
        id: 'active-trail-casing',
        type: 'line',
        source: 'active-trail',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#000000',
          'line-width': 11,
          'line-opacity': 0.95
        }
      });

      // 2. Bold Vibrant Strava Orange Core (#fc5200)
      map.addLayer({
        id: 'active-trail-core',
        type: 'line',
        source: 'active-trail',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#fc5200',
          'line-width': 7,
          'line-opacity': 1.0
        }
      });

      // 3. Center Highlight Stroke (Subtle yellow/white sheen in center)
      map.addLayer({
        id: 'active-trail-highlight',
        type: 'line',
        source: 'active-trail',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#ffea00',
          'line-width': 2,
          'line-opacity': 0.85
        }
      });
    }
  }, [rawPoints]);

  // 1. Map Initialization
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || rawPoints.length < 2) return;

    const startPt = rawPoints[0];
    const initialBearing = calculateBearing(
      rawPoints[0].lat,
      rawPoints[0].lng,
      rawPoints[1].lat,
      rawPoints[1].lng
    );

    cameraStateRef.current = {
      lng: startPt.lng,
      lat: startPt.lat,
      bearing: initialBearing
    };

    let rasterUrl =
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = 'Tiles &copy; Esri World Imagery';

    if (tileMode === 'street') {
      rasterUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap';
    } else if (tileMode === 'dark') {
      rasterUrl = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
      attribution = '&copy; CARTO';
    }

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [rasterUrl],
            tileSize: 256,
            attribution
          }
        },
        layers: [
          {
            id: 'raster-layer',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [startPt.lng, startPt.lat],
      zoom: 15.6,
      pitch: 58,
      bearing: initialBearing,
      maxPitch: 85,
      attributionControl: false
    });

    map.on('load', () => {
      setupLayers(map);

      // Create runner marker (White ring with orange center dot, exactly like Strava!)
      const el = document.createElement('div');
      el.className = 'strava-runner-marker';
      el.innerHTML = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(252, 82, 0, 0.4); box-shadow: 0 0 16px rgba(252, 82, 0, 0.8);"></div>
          <div style="width: 20px; height: 20px; border-radius: 50%; background: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; border: 3.5px solid #fc5200; z-index: 2;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #fc5200;"></div>
          </div>
        </div>
      `;

      const marker = new Marker({ element: el })
        .setLngLat([startPt.lng, startPt.lat])
        .addTo(map);

      runnerMarkerRef.current = marker;
    });

    mapInstanceRef.current = map;

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isOpen, tileMode, rawPoints, setupLayers]);

  // 2. Synchronous 60 FPS Render Loop: The line grows and draws DIRECTLY following the dot!
  useEffect(() => {
    if (!isOpen || !densePathData) return;

    let lastTime = performance.now();
    let lastHudUpdateTime = 0;
    const { points: densePoints, totalDistance } = densePathData;

    // Base speed: 36 seconds for entire course at 1x
    const baseMetersPerSec = totalDistance / 36;

    const tick = (now: number) => {
      const deltaSec = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (isPlaying) {
        progressDistRef.current += baseMetersPerSec * speedMultiplier * deltaSec;
        if (progressDistRef.current >= totalDistance) {
          progressDistRef.current = totalDistance;
          setIsPlaying(false);
        }
      }

      const curDist = progressDistRef.current;
      const map = mapInstanceRef.current;

      // Find dense point index corresponding to curDist
      let idx = 0;
      while (idx < densePoints.length - 1 && densePoints[idx].cumDist < curDist) {
        idx++;
      }

      const activePt = densePoints[idx] || densePoints[0];
      const targetLng = activePt.lng;
      const targetLat = activePt.lat;
      const targetBearing = activePt.bearing;

      // 2A. Update the line coordinates so the line GROWS and follows the dot!
      if (map && map.isStyleLoaded()) {
        const source = map.getSource('active-trail') as GeoJSONSource;
        if (source) {
          // Trail coordinates: from start up to current index + tip
          const trailSlice = densePoints.slice(0, idx + 1).map((p) => [p.lng, p.lat]);
          // Ensure at least 2 points
          if (trailSlice.length === 1) {
            trailSlice.push([targetLng, targetLat]);
          }

          source.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: trailSlice
            }
          });
        }

        // 2B. Update Runner Marker Position (positioned right at the leading edge of the line)
        if (runnerMarkerRef.current) {
          runnerMarkerRef.current.setLngLat([targetLng, targetLat]);
        }

        // 2C. Update Camera with smooth lazy-follow gimbal damping
        if (cameraMode === '3d-flyover') {
          const cam = cameraStateRef.current;

          // Angular damping
          let diff = targetBearing - cam.bearing;
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          cam.bearing += diff * 0.05; // 5% gentle damping per frame

          // Position damping
          cam.lng += (targetLng - cam.lng) * 0.08;
          cam.lat += (targetLat - cam.lat) * 0.08;

          map.jumpTo({
            center: [cam.lng, cam.lat],
            bearing: cam.bearing,
            pitch: 58,
            zoom: 15.6
          });
        } else if (cameraMode === '2d-topdown') {
          map.jumpTo({
            center: [targetLng, targetLat],
            bearing: 0,
            pitch: 0,
            zoom: 15.2
          });
        }
      }

      // 2D. Throttled update of HUD React state (every 75ms) to prevent render stutter
      if (now - lastHudUpdateTime > 75) {
        lastHudUpdateTime = now;

        // Calculate elevation gain so far
        let gain = 0;
        for (let k = 1; k <= idx; k++) {
          const dEle = densePoints[k].ele - densePoints[k - 1].ele;
          if (dEle > 0.3) gain += dEle;
        }

        setHudState({
          distanceCoveredKm: (curDist / 1000).toFixed(1).replace('.', ','),
          elevationGainM: Math.round(gain),
          currentGrade: Math.round(activePt.grade),
          progressPercent: Math.round((curDist / totalDistance) * 100)
        });
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, isPlaying, speedMultiplier, cameraMode, densePathData]);

  // Jump to specific progress distance
  const handleSeek = (newDist: number) => {
    progressDistRef.current = newDist;
    if (densePathData) {
      let idx = 0;
      while (idx < densePathData.points.length - 1 && densePathData.points[idx].cumDist < newDist) {
        idx++;
      }
      const pt = densePathData.points[idx];
      cameraStateRef.current = { lng: pt.lng, lat: pt.lat, bearing: pt.bearing };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden select-none animate-fade-in">
      {/* Outer Viewport: Reel 9:16 or Fullscreen */}
      <div
        className={`relative flex flex-col bg-slate-950 overflow-hidden shadow-2xl transition-all duration-300 ${
          aspectRatioMode === 'reel'
            ? 'w-[390px] h-[844px] max-h-[96vh] rounded-3xl border border-slate-700/80'
            : 'w-full h-full'
        }`}
      >
        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

        {/* Top Dark Scrim for HUD Readability */}
        <div className="absolute top-0 left-0 right-0 h-52 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

        {/* Strava Top HUD Header (Exact layout and typography matching Strava Flyover in image.png) */}
        <div className="absolute top-0 left-0 right-0 pt-6 px-6 z-20 flex flex-col items-center pointer-events-none text-white">
          {/* Brand Wordmark */}
          <div className="text-xl lg:text-2xl font-black tracking-widest uppercase text-white drop-shadow-md">
            STRAVA
          </div>

          {/* Activity / Route Title */}
          <div className="mt-2 text-xs lg:text-sm font-semibold text-slate-100 text-center max-w-[92%] truncate drop-shadow-md">
            {file.fileName.replace(/\.gpx$/i, '').replace(/_/g, ' ')}
          </div>

          {/* 3 Primary Strava KPI Metrics Strip */}
          <div className="grid grid-cols-3 w-full max-w-sm mt-4 text-center">
            {/* Quãng đường */}
            <div>
              <div className="text-[11px] font-medium text-slate-300 drop-shadow">
                Quãng đường
              </div>
              <div className="text-3xl lg:text-4xl font-black font-sans tracking-tight text-white drop-shadow-lg tabular-nums">
                {hudState.distanceCoveredKm}
              </div>
              <div className="text-[11px] font-bold text-slate-300 drop-shadow">
                km
              </div>
            </div>

            {/* Độ cao tăng */}
            <div>
              <div className="text-[11px] font-medium text-slate-300 drop-shadow">
                Độ cao tăng
              </div>
              <div className="text-3xl lg:text-4xl font-black font-sans tracking-tight text-white drop-shadow-lg tabular-nums">
                {hudState.elevationGainM}
              </div>
              <div className="text-[11px] font-bold text-slate-300 drop-shadow">
                m
              </div>
            </div>

            {/* Độ nghiêng */}
            <div>
              <div className="text-[11px] font-medium text-slate-300 drop-shadow">
                Độ nghiêng
              </div>
              <div className="text-3xl lg:text-4xl font-black font-sans tracking-tight text-white drop-shadow-lg tabular-nums">
                {hudState.currentGrade}
              </div>
              <div className="text-[11px] font-bold text-slate-300 drop-shadow">
                %
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={() =>
              setAspectRatioMode((prev) => (prev === 'reel' ? 'full' : 'reel'))
            }
            className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all"
            title="Đổi giữa tỷ lệ Reel 9:16 và Toàn màn hình"
          >
            {aspectRatioMode === 'reel' ? 'Toàn màn hình' : 'Khung dọc Reel'}
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold backdrop-blur-md border border-white/20 transition-all"
            title="Thoát giả lập 3D"
          >
            ✕
          </button>
        </div>

        {/* Bottom Playback & Scrubber Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-3">
          {/* Progress Slider */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-[11px] font-mono text-slate-300 tabular-nums">
              {hudState.progressPercent}%
            </span>
            <input
              type="range"
              min={0}
              max={densePathData ? densePathData.totalDistance : 100}
              step={10}
              value={progressDistRef.current}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 accent-[#fc5200] cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="text-[11px] font-mono text-slate-300 tabular-nums">
              {totalDistKm} km
            </span>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
            {/* Play/Pause & Speed Multipliers */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-full bg-[#fc5200] hover:bg-[#e04800] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
              >
                {isPlaying ? (
                  <span className="font-bold">❚❚</span>
                ) : (
                  <span className="font-bold ml-0.5">▶</span>
                )}
              </button>

              <button
                onClick={() => {
                  handleSeek(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Chạy lại từ đầu"
              >
                ↺
              </button>

              {/* Speeds: 0.5x, 1x, 2x, 4x */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                {[0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeedMultiplier(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      speedMultiplier === spd
                        ? 'bg-[#fc5200] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Camera and Map Selectors */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                <button
                  onClick={() => setCameraMode('3d-flyover')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    cameraMode === '3d-flyover'
                      ? 'bg-[#fc5200] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Camera 3D bám đuổi theo hướng chạy"
                >
                  Bám 3D
                </button>
                <button
                  onClick={() => setCameraMode('3d-orbit')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    cameraMode === '3d-orbit'
                      ? 'bg-[#fc5200] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Camera xoay tự do"
                >
                  Tự do
                </button>
                <button
                  onClick={() => setCameraMode('2d-topdown')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    cameraMode === '2d-topdown'
                      ? 'bg-[#fc5200] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Góc nhìn 2D từ trên cao"
                >
                  2D
                </button>
              </div>

              <select
                value={tileMode}
                onChange={(e) => setTileMode(e.target.value as any)}
                className="bg-black/60 text-white border border-white/20 rounded-lg px-2 py-1 text-[11px] cursor-pointer"
              >
                <option value="satellite">Vệ tinh ESRI (Strava)</option>
                <option value="street">OpenStreetMap</option>
                <option value="dark">Carto Dark</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
