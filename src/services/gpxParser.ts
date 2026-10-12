import { GPXFileItem, GPXPoint, GPXRoute, GPXSegment, GPXStats, GPXTrack, GPXWaypoint } from '../types/gpx';

/**
 * Haversine formula to calculate the great-circle distance between two points in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's mean radius in meters
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

/**
 * Clean & sanitize text content to prevent XSS
 */
function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[<>]/g, '') // strip brackets
    .slice(0, 1000); // cap length
}

/**
 * Parses raw GPX XML string into structured, validated GPXFileItem
 */
export function parseGPXString(
  xmlContent: string,
  fileName: string,
  fileSize: number,
  color: string
): GPXFileItem {
  if (!xmlContent || !xmlContent.trim()) {
    throw new Error(`File "${fileName}" rỗng hoặc không có nội dung.`);
  }

  // Parse XML using browser DOMParser safely
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

  // Check for parsererror
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    const errorText = parserError.textContent || 'Định dạng XML không hợp lệ';
    throw new Error(`Lỗi cú pháp XML trong file "${fileName}": ${errorText.slice(0, 150)}`);
  }

  const gpxNode = xmlDoc.querySelector('gpx');
  if (!gpxNode) {
    throw new Error(`File "${fileName}" không phải là định dạng GPX hợp lệ (thiếu thẻ gốc <gpx>).`);
  }

  const creator = gpxNode.getAttribute('creator') || undefined;

  // Metadata
  const metadataNode = gpxNode.querySelector('metadata');
  let metadataName: string | undefined;
  let metadataTime: Date | undefined;

  if (metadataNode) {
    const nameEl = metadataNode.querySelector('name');
    if (nameEl) metadataName = sanitizeText(nameEl.textContent);
    const timeEl = metadataNode.querySelector('time');
    if (timeEl && timeEl.textContent) {
      const parsedTime = new Date(timeEl.textContent);
      if (!isNaN(parsedTime.getTime())) {
        metadataTime = parsedTime;
      }
    }
  }

  // Helper to parse a point element (trkpt, rtept, wpt)
  const parsePoint = (ptNode: Element, prevPt?: GPXPoint): GPXPoint | null => {
    const latStr = ptNode.getAttribute('lat');
    const lonStr = ptNode.getAttribute('lon') || ptNode.getAttribute('lng');

    if (!latStr || !lonStr) return null;

    const lat = parseFloat(latStr);
    const lng = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }

    const eleNode = ptNode.querySelector('ele');
    let ele: number | undefined;
    if (eleNode && eleNode.textContent) {
      const parsedEle = parseFloat(eleNode.textContent);
      if (!isNaN(parsedEle)) ele = parsedEle;
    }

    const timeNode = ptNode.querySelector('time');
    let time: Date | undefined;
    if (timeNode && timeNode.textContent) {
      const parsedTime = new Date(timeNode.textContent);
      if (!isNaN(parsedTime.getTime())) time = parsedTime;
    }

    const point: GPXPoint = { lat, lng, ele, time };

    // Check extensions for speed or hdop
    const speedNode = ptNode.querySelector('speed');
    if (speedNode && speedNode.textContent) {
      const s = parseFloat(speedNode.textContent);
      if (!isNaN(s)) point.speed = s;
    }

    const hdopNode = ptNode.querySelector('hdop');
    if (hdopNode && hdopNode.textContent) {
      const h = parseFloat(hdopNode.textContent);
      if (!isNaN(h)) point.hdop = h;
    }

    // Cumulative metrics calculation
    if (prevPt) {
      const d = calculateHaversineDistance(prevPt.lat, prevPt.lng, lat, lng);
      point.distanceFromPrev = d;
      point.distanceFromStart = (prevPt.distanceFromStart || 0) + d;

      // Speed calculation if time exists
      if (point.time && prevPt.time) {
        const timeDiffSec = (point.time.getTime() - prevPt.time.getTime()) / 1000;
        if (timeDiffSec > 0 && timeDiffSec < 3600) {
          const speedKmh = (d / timeDiffSec) * 3.6;
          // Filter anomalous teleport speed jumps (> 250 km/h)
          point.speedCalc = speedKmh < 250 ? speedKmh : prevPt.speedCalc;
        }
      }

      // Slope / Grade calculation
      if (point.ele !== undefined && prevPt.ele !== undefined && d > 1) {
        const eleDiff = point.ele - prevPt.ele;
        point.grade = (eleDiff / d) * 100;
      }
    } else {
      point.distanceFromPrev = 0;
      point.distanceFromStart = 0;
    }

    return point;
  };

  // 1. Parse Tracks
  const tracks: GPXTrack[] = [];
  const trackNodes = gpxNode.querySelectorAll('trk');

  trackNodes.forEach((trkNode, trkIndex) => {
    const trkName = sanitizeText(trkNode.querySelector('name')?.textContent) || `Track ${trkIndex + 1}`;
    const trkDesc = sanitizeText(trkNode.querySelector('desc')?.textContent);

    const segments: GPXSegment[] = [];
    const segNodes = trkNode.querySelectorAll('trkseg');
    let trackDistance = 0;
    let trackPointsCount = 0;

    segNodes.forEach((segNode, segIndex) => {
      const ptNodes = segNode.querySelectorAll('trkpt');
      const points: GPXPoint[] = [];
      let lastPoint: GPXPoint | undefined;
      let segDist = 0;

      ptNodes.forEach((ptNode) => {
        const pt = parsePoint(ptNode, lastPoint);
        if (pt) {
          points.push(pt);
          if (pt.distanceFromPrev) {
            segDist += pt.distanceFromPrev;
          }
          lastPoint = pt;
        }
      });

      if (points.length > 0) {
        segments.push({
          id: `seg-${trkIndex}-${segIndex}`,
          points,
          distance: segDist
        });
        trackDistance += segDist;
        trackPointsCount += points.length;
      }
    });

    if (segments.length > 0) {
      tracks.push({
        id: `trk-${trkIndex}-${Date.now()}`,
        name: trkName,
        desc: trkDesc,
        segments,
        distance: trackDistance,
        pointsCount: trackPointsCount
      });
    }
  });

  // 2. Parse Routes
  const routes: GPXRoute[] = [];
  const routeNodes = gpxNode.querySelectorAll('rte');

  routeNodes.forEach((rteNode, rteIndex) => {
    const rteName = sanitizeText(rteNode.querySelector('name')?.textContent) || `Route ${rteIndex + 1}`;
    const rteDesc = sanitizeText(rteNode.querySelector('desc')?.textContent);
    const ptNodes = rteNode.querySelectorAll('rtept');

    const points: GPXPoint[] = [];
    let lastPoint: GPXPoint | undefined;
    let routeDistance = 0;

    ptNodes.forEach((ptNode) => {
      const pt = parsePoint(ptNode, lastPoint);
      if (pt) {
        points.push(pt);
        if (pt.distanceFromPrev) {
          routeDistance += pt.distanceFromPrev;
        }
        lastPoint = pt;
      }
    });

    if (points.length > 0) {
      routes.push({
        id: `rte-${rteIndex}-${Date.now()}`,
        name: rteName,
        desc: rteDesc,
        points,
        distance: routeDistance
      });
    }
  });

  // 3. Parse Waypoints
  const waypoints: GPXWaypoint[] = [];
  const wptNodes = gpxNode.querySelectorAll('wpt');

  wptNodes.forEach((wptNode, wptIndex) => {
    const latStr = wptNode.getAttribute('lat');
    const lonStr = wptNode.getAttribute('lon') || wptNode.getAttribute('lng');
    if (!latStr || !lonStr) return;

    const lat = parseFloat(latStr);
    const lng = parseFloat(lonStr);
    if (isNaN(lat) || isNaN(lng)) return;

    const name = sanitizeText(wptNode.querySelector('name')?.textContent) || `Waypoint ${wptIndex + 1}`;
    const desc = sanitizeText(wptNode.querySelector('desc')?.textContent);
    const sym = sanitizeText(wptNode.querySelector('sym')?.textContent);
    const type = sanitizeText(wptNode.querySelector('type')?.textContent);

    let ele: number | undefined;
    const eleEl = wptNode.querySelector('ele');
    if (eleEl && eleEl.textContent) {
      const val = parseFloat(eleEl.textContent);
      if (!isNaN(val)) ele = val;
    }

    let time: Date | undefined;
    const timeEl = wptNode.querySelector('time');
    if (timeEl && timeEl.textContent) {
      const val = new Date(timeEl.textContent);
      if (!isNaN(val.getTime())) time = val;
    }

    waypoints.push({
      id: `wpt-${wptIndex}-${Date.now()}`,
      lat,
      lng,
      name,
      desc,
      sym,
      type,
      ele,
      time
    });
  });

  // Validation: Check if there's any geographic entity
  if (tracks.length === 0 && routes.length === 0 && waypoints.length === 0) {
    throw new Error(
      `File "${fileName}" không chứa dữ liệu track, route hoặc waypoint nào có tọa độ hợp lệ.`
    );
  }

  // Calculate comprehensive statistics
  const stats = calculateFileStatistics(tracks, routes, waypoints);

  return {
    id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fileName,
    fileSize,
    uploadedAt: new Date(),
    color,
    visible: true,
    showWaypoints: true,
    showRoutes: true,
    rawXml: xmlContent,
    creator,
    metadataName,
    metadataTime,
    tracks,
    routes,
    waypoints,
    stats
  };
}

/**
 * Computes statistics from tracks, routes and waypoints
 */
export function calculateFileStatistics(
  tracks: GPXTrack[],
  routes: GPXRoute[],
  waypoints: GPXWaypoint[]
): GPXStats {
  let totalDistanceM = 0;
  let totalPointsCount = 0;

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  const allPoints: GPXPoint[] = [];

  // Collect track points
  tracks.forEach((track) => {
    track.segments.forEach((seg) => {
      seg.points.forEach((pt) => {
        allPoints.push(pt);
        if (pt.distanceFromPrev) totalDistanceM += pt.distanceFromPrev;
        minLat = Math.min(minLat, pt.lat);
        maxLat = Math.max(maxLat, pt.lat);
        minLng = Math.min(minLng, pt.lng);
        maxLng = Math.max(maxLng, pt.lng);
      });
    });
  });

  // Collect route points if no tracks or in addition
  routes.forEach((route) => {
    route.points.forEach((pt) => {
      if (tracks.length === 0) {
        allPoints.push(pt);
        if (pt.distanceFromPrev) totalDistanceM += pt.distanceFromPrev;
      }
      minLat = Math.min(minLat, pt.lat);
      maxLat = Math.max(maxLat, pt.lat);
      minLng = Math.min(minLng, pt.lng);
      maxLng = Math.max(maxLng, pt.lng);
    });
  });

  // Include waypoints in bounds
  waypoints.forEach((wpt) => {
    minLat = Math.min(minLat, wpt.lat);
    maxLat = Math.max(maxLat, wpt.lat);
    minLng = Math.min(minLng, wpt.lng);
    maxLng = Math.max(maxLng, wpt.lng);
  });

  totalPointsCount = allPoints.length;

  // Fallback bounds if only empty or single point
  if (minLat > maxLat || minLng > maxLng) {
    minLat = 10;
    maxLat = 16;
    minLng = 105;
    maxLng = 110;
  }

  // Elevation analysis
  const pointsWithEle = allPoints.filter((pt) => pt.ele !== undefined && !isNaN(pt.ele));
  const hasElevation = pointsWithEle.length > 0;

  let minElevationM: number | null = null;
  let maxElevationM: number | null = null;
  let elevationGainM: number | null = null;
  let elevationLossM: number | null = null;

  if (hasElevation) {
    minElevationM = Math.min(...pointsWithEle.map((pt) => pt.ele!));
    maxElevationM = Math.max(...pointsWithEle.map((pt) => pt.ele!));

    let gain = 0;
    let loss = 0;
    const ELE_THRESHOLD = 2.0; // 2 meters jitter threshold to filter GPS altimeter noise

    for (let i = 1; i < pointsWithEle.length; i++) {
      const prev = pointsWithEle[i - 1].ele!;
      const curr = pointsWithEle[i].ele!;
      const diff = curr - prev;

      if (diff > ELE_THRESHOLD) {
        gain += diff;
      } else if (diff < -ELE_THRESHOLD) {
        loss += Math.abs(diff);
      }
    }

    elevationGainM = Math.round(gain);
    elevationLossM = Math.round(loss);
  }

  // Time & Speed analysis
  const pointsWithTime = allPoints.filter((pt) => pt.time && !isNaN(pt.time.getTime()));
  const hasTime = pointsWithTime.length >= 2;

  let startTime: Date | null = null;
  let endTime: Date | null = null;
  let totalDurationSeconds: number | null = null;
  let movingDurationSeconds: number | null = null;
  let stoppedDurationSeconds: number | null = null;
  let avgSpeedKmh: number | null = null;
  let avgMovingSpeedKmh: number | null = null;
  let maxSpeedKmh: number | null = null;

  if (hasTime) {
    startTime = pointsWithTime[0].time!;
    endTime = pointsWithTime[pointsWithTime.length - 1].time!;
    const totalSec = Math.max(0, (endTime.getTime() - startTime.getTime()) / 1000);
    totalDurationSeconds = Math.round(totalSec);

    let movingSec = 0;
    let maxSpd = 0;
    let movingDistM = 0;

    for (let i = 1; i < pointsWithTime.length; i++) {
      const p1 = pointsWithTime[i - 1];
      const p2 = pointsWithTime[i];
      const dt = (p2.time!.getTime() - p1.time!.getTime()) / 1000;
      const dx = calculateHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);

      if (dt > 0 && dt < 1800) {
        const speed = (dx / dt) * 3.6; // km/h
        // If moving faster than 0.8 km/h or substantial movement
        if (speed >= 0.8 && speed < 220) {
          movingSec += dt;
          movingDistM += dx;
          if (speed > maxSpd) maxSpd = speed;
        }
      }
    }

    movingDurationSeconds = Math.round(movingSec);
    stoppedDurationSeconds = Math.max(0, totalDurationSeconds - movingDurationSeconds);

    if (totalDurationSeconds > 0 && totalDistanceM > 0) {
      avgSpeedKmh = parseFloat(((totalDistanceM / totalDurationSeconds) * 3.6).toFixed(1));
    }

    if (movingDurationSeconds > 0 && movingDistM > 0) {
      avgMovingSpeedKmh = parseFloat(((movingDistM / movingDurationSeconds) * 3.6).toFixed(1));
    }

    maxSpeedKmh = maxSpd > 0 ? parseFloat(maxSpd.toFixed(1)) : null;
  }

  return {
    totalDistanceKm: parseFloat((totalDistanceM / 1000).toFixed(2)),
    trackCount: tracks.length,
    routeCount: routes.length,
    waypointCount: waypoints.length,
    totalPointsCount,
    hasElevation,
    minElevationM,
    maxElevationM,
    elevationGainM,
    elevationLossM,
    hasTime,
    startTime,
    endTime,
    totalDurationSeconds,
    movingDurationSeconds,
    stoppedDurationSeconds,
    avgSpeedKmh,
    avgMovingSpeedKmh,
    maxSpeedKmh,
    bounds: {
      minLat,
      maxLat,
      minLng,
      maxLng
    }
  };
}
