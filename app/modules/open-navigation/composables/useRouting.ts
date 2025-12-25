export interface Place {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type?: string;
  name?: string;
}

export interface RouteProfile {
  id: string;
  name: string;
  icon: string;
  osrmProfile: string;
}

export const routeProfiles: RouteProfile[] = [
  {
    id: "car",
    name: "Car",
    icon: "Car",
    osrmProfile: "car",
  },
  {
    id: "bike",
    name: "Motorcycle",
    icon: "Bike",
    osrmProfile: "bike",
  },
  {
    id: "foot",
    name: "Walking",
    icon: "PersonStanding",
    osrmProfile: "foot",
  },
];

export const useRouting = () => {
  const config = useRuntimeConfig();
  const nominatimUrl = config.public.nominatimApiUrl;
  const osrmUrl = config.public.osrmApiUrl;

  /**
   * Search for places using Nominatim API
   */
  const searchPlace = async (query: string): Promise<Place[]> => {
    if (!query || query.length < 3) return [];

    try {
      const response = await fetch(
        `${nominatimUrl}/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5&addressdetails=1&countrycodes=my`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search place");
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching place:", error);
      throw error;
    }
  };

  /**
   * Get route between two points using OSRM API
   */
  const getRoute = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    profile: string = "car"
  ) => {
    try {
      const url = `${osrmUrl}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to get route");
      }

      const data = await response.json();

      if (data.code !== "Ok") {
        throw new Error(data.message || "Route not found");
      }

      return data.routes[0];
    } catch (error) {
      console.error("Error getting route:", error);
      throw error;
    }
  };

  /**
   * Format distance (meters to km/m)
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  /**
   * Format duration (seconds to hours/minutes)
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  return {
    searchPlace,
    getRoute,
    formatDistance,
    formatDuration,
    routeProfiles,
  };
};
