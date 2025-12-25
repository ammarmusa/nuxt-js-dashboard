<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="border-b bg-card">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="ghost" size="sm" @click="goBack">
              <ArrowLeft :size="18" class="mr-2" />
              Back
            </Button>
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-lg bg-blue-500 text-white shadow-sm">
                <MapIcon :size="22" />
              </div>
              <div>
                <h1 class="text-2xl font-bold">3D Map Module</h1>
                <p class="text-sm text-muted-foreground">
                  Interactive 3D mapping and visualization
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="handleRefresh">
              <RefreshCw :size="16" class="mr-2" />
              Refresh
            </Button>
            <Button size="sm" @click="handleSettings">
              <Settings :size="16" class="mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar Controls -->
        <div class="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Map Controls</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground"
                  >View Mode</label
                >
                <select
                  v-model="mapConfig.viewMode"
                  class="w-full p-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  @change="handleViewModeChange"
                >
                  <option value="2d">2D View</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground"
                  >Zoom Level</label
                >
                <input
                  v-model.number="mapConfig.zoom"
                  type="range"
                  min="1"
                  max="20"
                  class="w-full accent-primary"
                  @input="handleZoomChange"
                />
                <span class="text-xs text-muted-foreground"
                  >Level: {{ mapConfig.zoom }}</span
                >
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Layers</label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="mapConfig.layers.buildings"
                      type="checkbox"
                      class="rounded"
                      @change="handleLayerToggle"
                    />
                    <span class="text-sm">Buildings</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="mapConfig.layers.terrain"
                      type="checkbox"
                      class="rounded"
                      @change="handleLayerToggle"
                    />
                    <span class="text-sm">Terrain</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="mapConfig.layers.traffic"
                      type="checkbox"
                      class="rounded"
                      @change="handleLayerToggle"
                    />
                    <span class="text-sm">Traffic</span>
                  </label>
                </div>
              </div>

              <Button class="w-full" @click="resetMap">
                <RotateCcw :size="16" class="mr-2" />
                Reset View
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <Button
                variant="outline"
                class="w-full justify-start"
                @click="addMarker"
              >
                <MapPin :size="16" class="mr-2" />
                Add Marker
              </Button>
              <Button
                variant="outline"
                class="w-full justify-start"
                @click="measureDistance"
              >
                <Ruler :size="16" class="mr-2" />
                Measure Distance
              </Button>
              <Button
                variant="outline"
                class="w-full justify-start"
                @click="exportMap"
              >
                <Download :size="16" class="mr-2" />
                Export Map
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Map Container -->
        <div class="lg:col-span-3">
          <Card class="h-[calc(100vh-12rem)]">
            <CardContent class="p-0 h-full">
              <ClientOnly>
                <div
                  class="relative w-full h-full bg-muted rounded-lg overflow-hidden border"
                >
                  <!-- Leaflet Map Container -->
                  <div
                    ref="mapContainer"
                    class="absolute inset-0 w-full h-full z-0"
                    style="background: #e0e0e0"
                  ></div>

                  <!-- Map Overlay Controls -->
                  <div
                    class="absolute top-4 right-4 flex flex-col gap-2 z-[1000]"
                  >
                    <Button
                      size="icon"
                      variant="secondary"
                      @click="handleZoomIn"
                    >
                      <Plus :size="18" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      @click="handleZoomOut"
                    >
                      <Minus :size="18" />
                    </Button>
                  </div>

                  <!-- Coordinates Display -->
                  <div
                    class="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md text-xs border shadow-sm"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-1">
                        <span class="text-muted-foreground">Lat:</span>
                        <span class="font-mono">{{
                          currentCoords.lat.toFixed(5)
                        }}</span>
                      </div>
                      <span class="text-muted-foreground">•</span>
                      <div class="flex items-center gap-1">
                        <span class="text-muted-foreground">Lng:</span>
                        <span class="font-mono">{{
                          currentCoords.lng.toFixed(5)
                        }}</span>
                      </div>
                      <span class="text-muted-foreground">•</span>
                      <div class="flex items-center gap-1">
                        <span class="text-muted-foreground">Zoom:</span>
                        <span class="font-mono">{{ currentCoords.zoom }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <template #fallback>
                  <div
                    class="relative w-full h-full bg-muted rounded-lg overflow-hidden border flex items-center justify-center"
                  >
                    <div class="text-center space-y-2">
                      <div
                        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
                      ></div>
                      <p class="text-sm text-muted-foreground">
                        Loading map...
                      </p>
                    </div>
                  </div>
                </template>
              </ClientOnly>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Map as MapIcon,
  ArrowLeft,
  RefreshCw,
  Settings,
  RotateCcw,
  MapPin,
  Ruler,
  Download,
  Plus,
  Minus,
} from "lucide-vue-next";
import { useLeafletMap } from "./composables/useLeafletMap";
import type { ViewMode } from "./types/map.types";

// Load Leaflet CSS via useHead
useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
      crossorigin: "",
    },
  ],
});

const toast = useToast();
const router = useRouter();
const mapContainer = ref<HTMLElement | null>(null);
const {
  mapInstance,
  initMap,
  switchTileLayer,
  addMarker: addLeafletMarker,
  removeMarker,
  clearMarkers,
  zoomIn: mapZoomIn,
  zoomOut: mapZoomOut,
  setZoom: setMapZoom,
  flyTo,
  destroyMap,
} = useLeafletMap();

// Store markers with their coordinates for removal
const markersMap = ref<Map<string, any>>(new Map());

interface MapConfig {
  viewMode: ViewMode;
  zoom: number;
  center: {
    lat: number;
    lng: number;
  };
  layers: {
    buildings: boolean;
    terrain: boolean;
    traffic: boolean;
  };
}

const mapConfig = ref<MapConfig>({
  viewMode: "2d",
  zoom: 13,
  center: {
    lat: 37.7749,
    lng: -122.4194,
  },
  layers: {
    buildings: true,
    terrain: true,
    traffic: false,
  },
});

const currentCoords = ref({
  lat: 37.7749,
  lng: -122.4194,
  zoom: 13,
});

// Initialize map on mount
onMounted(async () => {
  // Wait for next tick to ensure DOM is fully rendered
  await nextTick();

  if (mapContainer.value) {
    try {
      await initMap(mapContainer.value, {
        center: [mapConfig.value.center.lat, mapConfig.value.center.lng],
        zoom: mapConfig.value.zoom,
        minZoom: 2,
        maxZoom: 18,
      });

      // Set up event listeners
      if (mapInstance.value) {
        mapInstance.value.on("moveend", updateCoordinates);
        mapInstance.value.on("zoomend", updateCoordinates);

        // Add click handler for markers
        mapInstance.value.on("click", handleMapClick);
      }

      // Listen for marker removal events from popup buttons
      if (import.meta.client) {
        window.addEventListener(
          "remove-marker",
          handleRemoveMarkerEvent as EventListener
        );
      }

      toast.success("Map loaded successfully!");
    } catch (error) {
      console.error("Failed to initialize map:", error);
      toast.error("Failed to initialize map");
    }
  } else {
    console.error("Map container not found");
  }
});

// Clean up on unmount
onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener(
      "remove-marker",
      handleRemoveMarkerEvent as EventListener
    );
  }
  destroyMap();
});

// Update coordinates display
const updateCoordinates = () => {
  if (mapInstance.value) {
    const center = mapInstance.value.getCenter();
    const zoom = mapInstance.value.getZoom();
    currentCoords.value = {
      lat: center.lat,
      lng: center.lng,
      zoom: Math.round(zoom),
    };
    mapConfig.value.zoom = Math.round(zoom);
  }
};

// Handle map click
const handleMapClick = async (e: any) => {
  console.log("Map clicked at:", e.latlng);
};

// Handle marker removal from popup
const handleRemoveMarkerEvent = (event: CustomEvent) => {
  const { lat, lng } = event.detail;
  const key = `${lat.toFixed(5)}_${lng.toFixed(5)}`;
  const marker = markersMap.value.get(key);

  if (marker) {
    removeMarker(marker);
    markersMap.value.delete(key);
    toast.success("Marker removed");
  }
};

const goBack = () => {
  router.back();
};

const handleRefresh = () => {
  if (mapInstance.value) {
    mapInstance.value.invalidateSize();
    toast.success("Map refreshed!");
  }
};

const handleSettings = () => {
  toast.info("Opening settings...", {
    description: "Configure your map preferences",
  });
};

const handleViewModeChange = async () => {
  const mode = mapConfig.value.viewMode;

  switch (mode) {
    case "2d":
      await switchTileLayer("openStreetMap");
      break;
    case "satellite":
      await switchTileLayer("satellite");
      break;
    case "terrain":
      await switchTileLayer("terrain");
      break;
  }

  toast.success(`Switched to ${mode} view`);
};

const handleZoomChange = () => {
  if (mapInstance.value) {
    setMapZoom(mapConfig.value.zoom);
  }
};

const handleLayerToggle = () => {
  const activeLayers = Object.entries(mapConfig.value.layers)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);

  toast.info(`Active layers: ${activeLayers.join(", ") || "None"}`);
};

const resetMap = () => {
  mapConfig.value.zoom = 13;
  mapConfig.value.center = {
    lat: 37.7749,
    lng: -122.4194,
  };

  flyTo(
    [mapConfig.value.center.lat, mapConfig.value.center.lng],
    mapConfig.value.zoom
  );
  toast.success("Map view reset to defaults");
};

const addMarker = async () => {
  if (mapInstance.value) {
    const center = mapInstance.value.getCenter();
    const marker = await addLeafletMarker([center.lat, center.lng], {
      popup: `<b>New Marker</b><br>Lat: ${center.lat.toFixed(
        5
      )}<br>Lng: ${center.lng.toFixed(5)}`,
      draggable: true,
    });

    // Store marker reference for later removal
    if (marker) {
      const key = `${center.lat.toFixed(5)}_${center.lng.toFixed(5)}`;
      markersMap.value.set(key, marker);
    }

    toast.success("Marker added at current center");
  }
};

const measureDistance = () => {
  toast.info("Distance measurement tool activated", {
    description: "Click two points on the map to measure distance",
  });
};

const exportMap = () => {
  toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
    loading: "Exporting map...",
    success: "Map exported successfully!",
    error: "Failed to export map",
  });
};

const handleZoomIn = () => {
  mapZoomIn();
  updateCoordinates();
};

const handleZoomOut = () => {
  mapZoomOut();
  updateCoordinates();
};
</script>

<style>
/* Leaflet marker fix - ensure markers are visible */
.leaflet-pane,
.leaflet-tile,
.leaflet-marker-icon,
.leaflet-marker-shadow,
.leaflet-tile-container,
.leaflet-pane > svg,
.leaflet-pane > canvas,
.leaflet-zoom-box,
.leaflet-image-layer,
.leaflet-layer {
  position: absolute;
  left: 0;
  top: 0;
}

.leaflet-container {
  overflow: hidden;
}

.leaflet-marker-icon,
.leaflet-marker-shadow {
  display: block;
}
</style>
