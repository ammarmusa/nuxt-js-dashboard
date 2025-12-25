import type { Ref } from "vue";

export interface MapOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
  style?: string;
}

export interface Marker {
  id: string;
  position: { lat: number; lng: number };
  title?: string;
  description?: string;
}

export const useMapStore = () => {
  const markers = useState<Marker[]>("map-markers", () => []);
  const activeMarker = useState<Marker | null>("active-marker", () => null);

  const addMarker = (marker: Marker) => {
    markers.value.push(marker);
  };

  const removeMarker = (id: string) => {
    markers.value = markers.value.filter((m) => m.id !== id);
  };

  const clearMarkers = () => {
    markers.value = [];
  };

  const setActiveMarker = (marker: Marker | null) => {
    activeMarker.value = marker;
  };

  return {
    markers,
    activeMarker,
    addMarker,
    removeMarker,
    clearMarkers,
    setActiveMarker,
  };
};
