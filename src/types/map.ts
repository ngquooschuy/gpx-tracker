export interface TileProvider {
  id: string;
  name: string;
  category: 'satellite' | 'street' | 'topo' | 'dark' | 'light';
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
  tileSize?: number;
}

export interface GeoAnnotation {
  id: string;
  nameVi: string;
  nameEn?: string;
  category: 'archipelago' | 'island' | 'maritime' | 'landmark';
  center: [number, number]; // [lat, lng]
  bounds?: [[number, number], [number, number]];
  descriptionVi: string;
  descriptionEn?: string;
  sovereigntyAffirmation: string;
  importance: 'critical' | 'high' | 'medium';
  zoomRange: [number, number]; // minZoom, maxZoom
  islandsCount?: number;
  administrativeUnit?: string;
}

export interface MapViewSettings {
  tileProviderId: string;
  showVietnamAnnotations: boolean;
  showWaypoints: boolean;
  showRoutes: boolean;
  showTracks: boolean;
  showDistanceMarkers: boolean;
  showCoordinateGrid: boolean;
  elevationExaggeration: number;
  mapDimension: '2D' | '3D';
}

export type CameraFollowMode = '3d-flyover' | '3d-orbit' | '2d-topdown';

export interface SimulationState {
  isPlaying: boolean;
  progress: number; // 0 to 1
  speedMultiplier: number; // 1, 2, 5, 10, 20
  currentIndex: number;
  cameraMode: CameraFollowMode;
  pitch: number;
  distanceCoveredKm: number;
  currentElevationM: number;
  elevationGainM: number;
  currentGradePercent: number;
  currentSpeedKmh: number;
  elapsedSeconds: number;
}
