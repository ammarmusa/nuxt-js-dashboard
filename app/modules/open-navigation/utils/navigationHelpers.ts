/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Generate human-readable instruction from OSRM maneuver
 */
export const generateInstruction = (maneuver: any): string => {
  const type = maneuver.type || "";
  const modifier = maneuver.modifier || "";

  const instructionMap: Record<string, string | ((mod: string) => string)> = {
    depart: (mod) => `Head ${mod || "straight"}`,
    arrive: () => "You have arrived at your destination",
    "new name": () => "Continue straight",
    continue: (mod) => `Continue ${mod || "straight"}`,
    merge: (mod) => `Merge ${mod || ""}`.trim(),
    "on ramp": (mod) => `Take the ramp ${mod || ""}`.trim(),
    "off ramp": (mod) => `Take the exit ${mod || ""}`.trim(),
    fork: (mod) => `At the fork, take ${mod || ""}`.trim(),
    "end of road": (mod) => `At the end of the road, turn ${mod || ""}`.trim(),
    roundabout: () => "Enter the roundabout",
    rotary: () => "Enter the rotary",
  };

  // Handle turn type separately for more specific instructions
  if (type === "turn") {
    const turnInstructions: Record<string, string> = {
      left: "Turn left",
      right: "Turn right",
      "sharp left": "Sharp left turn",
      "sharp right": "Sharp right turn",
      "slight left": "Slight left",
      "slight right": "Slight right",
    };
    return turnInstructions[modifier] || `Turn ${modifier}`;
  }

  const handler = instructionMap[type];
  if (handler) {
    return typeof handler === "function" ? handler(modifier) : handler;
  }

  // Default
  return modifier ? `${type} ${modifier}` : type || "Continue";
};

/**
 * Format distance text for navigation instructions
 */
export const formatDistanceText = (meters: number): string => {
  if (meters > 1000) {
    return `In ${(meters / 1000).toFixed(1)} km`;
  }
  return `In ${Math.round(meters)} m`;
};

/**
 * Create user location marker icon HTML
 */
export const createUserLocationIconHtml = (): string => `
  <div style="
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>
`;

/**
 * Create navigation marker icon HTML with rotation
 */
export const createNavigationIconHtml = (rotation: number): string => `
  <div style="
    width: 32px;
    height: 32px;
    background: #10b981;
    border: 4px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(16, 185, 129, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(${rotation}deg);
  ">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform: translateY(-2px)">
      <path d="M12 2L4 20l8-4 8 4z"/>
    </svg>
  </div>
`;
