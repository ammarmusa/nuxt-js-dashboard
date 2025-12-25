import type {
  Map as LeafletMap,
  LatLngExpression,
  TileLayer,
  LayerGroup,
  Marker as LeafletMarker,
} from "leaflet";
import type { Ref } from "vue";

export interface MapConfig {
  center: LatLngExpression;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface MapTileLayer {
  name: string;
  url: string;
  attribution: string;
  maxZoom?: number;
}

export const useLeafletMap = () => {
  const mapInstance = ref<LeafletMap | null>(null);
  const markersLayer = ref<LayerGroup | null>(null);
  const currentTileLayer = ref<TileLayer | null>(null);

  // Available tile layers
  const tileLayers = {
    openStreetMap: {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    },
    terrain: {
      name: "Terrain",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "Map data: &copy; OpenTopoMap contributors",
      maxZoom: 17,
    },
  } as const;

  /**
   * Initialize the map
   */
  const initMap = async (container: HTMLElement, config: MapConfig) => {
    if (!import.meta.client) {
      console.warn("Map initialization skipped: not running on client");
      return;
    }

    if (!container) {
      console.error("Map container is null or undefined");
      return;
    }

    try {
      // Dynamically import Leaflet only on client side
      const L = await import("leaflet");

      // Fix Leaflet default icon paths before creating any markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create map instance
      mapInstance.value = L.map(container, {
        center: config.center,
        zoom: config.zoom,
        minZoom: config.minZoom || 2,
        maxZoom: config.maxZoom || 18,
        zoomControl: false, // We'll add custom controls
      });

      // Add default tile layer
      currentTileLayer.value = L.tileLayer(tileLayers.openStreetMap.url, {
        attribution: tileLayers.openStreetMap.attribution,
        maxZoom: tileLayers.openStreetMap.maxZoom,
      }).addTo(mapInstance.value as any);

      // Initialize markers layer
      markersLayer.value = L.layerGroup().addTo(mapInstance.value as any);

      return mapInstance.value;
    } catch (error) {
      console.error("Error initializing map:", error);
      throw error;
    }
  };

  /**
   * Switch tile layer
   */
  const switchTileLayer = async (layerKey: keyof typeof tileLayers) => {
    if (!mapInstance.value || !import.meta.client) return;

    const L = await import("leaflet");
    const layer = tileLayers[layerKey];

    if (currentTileLayer.value) {
      mapInstance.value.removeLayer(currentTileLayer.value as any);
    }

    currentTileLayer.value = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: layer.maxZoom,
    }).addTo(mapInstance.value as any);
  };

  /**
   * Add a marker to the map
   */
  const addMarker = async (
    position: LatLngExpression,
    options?: {
      popup?: string;
      draggable?: boolean;
      icon?: any;
    }
  ) => {
    if (!markersLayer.value || !import.meta.client) return null;

    const L = await import("leaflet");

    // Ensure default icon is configured (in case marker is added before initMap completes)
    if (!L.Icon.Default.prototype.options.iconUrl) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }

    const markerOptions: any = {
      draggable: options?.draggable || false,
    };

    // Only add icon if explicitly provided
    if (options?.icon) {
      markerOptions.icon = options.icon;
    }

    const marker = L.marker(position, markerOptions);

    if (options?.popup) {
      // Create popup content with remove button
      const popupContent = `
        <div style="min-width: 150px;">
          ${options.popup}
          <button 
            onclick="window.dispatchEvent(new CustomEvent('remove-marker', { detail: { lat: ${
              typeof position === "object" && "lat" in position
                ? position.lat
                : Array.isArray(position)
                ? position[0]
                : 0
            }, lng: ${
        typeof position === "object" && "lng" in position
          ? position.lng
          : Array.isArray(position)
          ? position[1]
          : 0
      } } }))"
            style="
              margin-top: 8px;
              width: 100%;
              padding: 4px 8px;
              background-color: #ef4444;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
            "
            onmouseover="this.style.backgroundColor='#dc2626'"
            onmouseout="this.style.backgroundColor='#ef4444'"
          >
            Remove Marker
          </button>
        </div>
      `;
      marker.bindPopup(popupContent);
    }

    markersLayer.value.addLayer(marker);
    return marker;
  };

  /**
   * Remove a specific marker
   */
  const removeMarker = (marker: any) => {
    if (markersLayer.value && marker) {
      markersLayer.value.removeLayer(marker);
    }
  };

  /**
   * Clear all markers
   */
  const clearMarkers = () => {
    if (markersLayer.value) {
      markersLayer.value.clearLayers();
    }
  };

  /**
   * Fly to a location
   */
  const flyTo = (position: LatLngExpression, zoom?: number) => {
    if (mapInstance.value) {
      mapInstance.value.flyTo(position, zoom || mapInstance.value.getZoom());
    }
  };

  /**
   * Set view instantly
   */
  const setView = (position: LatLngExpression, zoom?: number) => {
    if (mapInstance.value) {
      mapInstance.value.setView(position, zoom || mapInstance.value.getZoom());
    }
  };

  /**
   * Get current center
   */
  const getCenter = () => {
    return mapInstance.value?.getCenter();
  };

  /**
   * Get current zoom
   */
  const getZoom = () => {
    return mapInstance.value?.getZoom();
  };

  /**
   * Zoom in
   */
  const zoomIn = () => {
    mapInstance.value?.zoomIn();
  };

  /**
   * Zoom out
   */
  const zoomOut = () => {
    mapInstance.value?.zoomOut();
  };

  /**
   * Set zoom level
   */
  const setZoom = (zoom: number) => {
    mapInstance.value?.setZoom(zoom);
  };

  /**
   * Fit bounds
   */
  const fitBounds = async (bounds: any) => {
    mapInstance.value?.fitBounds(bounds);
  };

  /**
   * Destroy map instance
   */
  const destroyMap = () => {
    if (mapInstance.value) {
      mapInstance.value.remove();
      mapInstance.value = null;
      markersLayer.value = null;
      currentTileLayer.value = null;
    }
  };

  return {
    mapInstance,
    tileLayers,
    initMap,
    switchTileLayer,
    addMarker,
    removeMarker,
    clearMarkers,
    flyTo,
    setView,
    getCenter,
    getZoom,
    zoomIn,
    zoomOut,
    setZoom,
    fitBounds,
    destroyMap,
  };
};
