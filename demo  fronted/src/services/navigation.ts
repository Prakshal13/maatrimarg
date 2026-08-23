import { Hospital } from '../types';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatEta(totalMinutes: number, language: 'en' | 'mr' | 'hi' = 'en'): string {
  const mins = Math.max(1, Math.round(totalMinutes));
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (language === 'mr') {
    if (hours > 0) {
      return remainingMins > 0 ? `${hours} तास ${remainingMins} मिनिटे` : `${hours} तास`;
    }
    return `${remainingMins} मिनिटे`;
  } else if (language === 'hi') {
    if (hours > 0) {
      return remainingMins > 0 ? `${hours} घंटा ${remainingMins} मिनट` : `${hours} घंटा`;
    }
    return `${remainingMins} मिनट`;
  }

  if (hours > 0) {
    const hrLabel = hours === 1 ? 'hr' : 'hrs';
    const minLabel = remainingMins === 1 ? 'min' : 'mins';
    return remainingMins > 0 ? `${hours} ${hrLabel} ${remainingMins} ${minLabel}` : `${hours} ${hrLabel}`;
  }
  return `${remainingMins} mins`;
}

export function findBestHospitalFromLocation(
  userLat: number,
  userLng: number,
  hospitals: Hospital[],
  language: 'en' | 'mr' | 'hi' = 'en'
): {
  hospital: Hospital;
  distanceKm: number;
  estimatedMinutes: number;
  formattedEta: string;
  googleMapsUrl: string;
} | null {
  // Filter hospitals with available beds and not in DIVERT
  const eligible = hospitals.filter(
    h => h.lat && h.lng && h.available_beds > 0 && h.status !== 'DIVERT'
  );

  const pool = eligible.length > 0 ? eligible : hospitals.filter(h => h.lat && h.lng);

  if (pool.length === 0) return null;

  // Calculate distance to each hospital and score based on distance + ICU beds
  const scored = pool.map(h => {
    const dist = calculateDistanceKm(userLat, userLng, h.lat!, h.lng!);
    // Estimate transit time: assume 35 km/h average emergency speed with ambulance priority
    const mins = Math.max(4, Math.round((dist / 35) * 60));
    return {
      hospital: h,
      distanceKm: dist,
      estimatedMinutes: mins,
      score: dist - (h.availableIcuBeds * 1.5) // prioritize facilities with ICU beds nearby
    };
  });

  // Sort by lowest score (closest + highest capacity)
  scored.sort((a, b) => a.score - b.score);
  const best = scored[0];

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${best.hospital.lat},${best.hospital.lng}&travelmode=driving`;

  return {
    hospital: best.hospital,
    distanceKm: best.distanceKm,
    estimatedMinutes: best.estimatedMinutes,
    formattedEta: formatEta(best.estimatedMinutes, language),
    googleMapsUrl
  };
}

export function getGoogleMapsUrlForHospital(
  destination: Hospital,
  origin?: Hospital | { lat: number; lng: number }
): string {
  if (origin && 'lat' in origin && origin.lat && origin.lng && destination.lat && destination.lng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  }
  if (destination.lat && destination.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ', ' + destination.district + ', Maharashtra')}`;
}
