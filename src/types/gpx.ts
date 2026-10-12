/**
 * Core types for GPX Data structures and statistics
 */

export interface GPXPoint {
  lat: number;
  lng: number;
  ele?: number; // Elevation in meters
  time?: Date;  // UTC Timestamp
  speed?: number; // Speed in m/s or km/h if available in extensions
  course?: number;
  hdop?: number;
  // Computed values
  distanceFromStart?: number; // in meters
  distanceFromPrev?: number;  // in meters
  speedCalc?: number; // in km/h
  grade?: number; // slope percentage (%)
}

export interface GPXWaypoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  desc?: string;
  sym?: string;
  ele?: number;
  time?: Date;
  type?: string;
}

export interface GPXSegment {
  id: string;
  points: GPXPoint[];
  distance: number; // in meters
}

export interface GPXTrack {
  id: string;
  name: string;
  desc?: string;
  segments: GPXSegment[];
  pointsCount: number;
  distance: number; // in meters
}

export interface GPXRoute {
  id: string;
  name: string;
  desc?: string;
  points: GPXPoint[];
  distance: number; // in meters
}

export interface GPXStats {
  totalDistanceKm: number;
  trackCount: number;
  routeCount: number;
  waypointCount: number;
  totalPointsCount: number;
  
  // Elevation metrics
  hasElevation: boolean;
  minElevationM: number | null;
  maxElevationM: number | null;
  elevationGainM: number | null; // ascent
  elevationLossM: number | null; // descent
  
  // Time & Speed metrics
  hasTime: boolean;
  startTime: Date | null;
  endTime: Date | null;
  totalDurationSeconds: number | null;
  movingDurationSeconds: number | null;
  stoppedDurationSeconds: number | null;
  avgSpeedKmh: number | null;
  avgMovingSpeedKmh: number | null;
  maxSpeedKmh: number | null;
  
  // Bounding box
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface GPXFileItem {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  color: string;
  visible: boolean;
  showWaypoints: boolean;
  showRoutes: boolean;
  
  rawXml?: string;
  creator?: string;
  metadataName?: string;
  metadataTime?: Date;
  
  tracks: GPXTrack[];
  routes: GPXRoute[];
  waypoints: GPXWaypoint[];
  stats: GPXStats;
}
