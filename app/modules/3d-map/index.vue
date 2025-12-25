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
                <Map :size="22" />
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
                  <option value="3d">3D View</option>
                  <option value="2d">2D View</option>
                  <option value="satellite">Satellite</option>
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
              <div
                class="relative w-full h-full bg-muted rounded-lg overflow-hidden border"
              >
                <!-- Placeholder for actual map integration -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center space-y-4">
                    <div class="p-4 rounded-full bg-blue-500/10 inline-block">
                      <Map :size="64" class="text-blue-500" />
                    </div>
                    <div>
                      <h3 class="text-xl font-semibold mb-2">
                        3D Map Placeholder
                      </h3>
                      <p class="text-muted-foreground max-w-md">
                        Integrate your preferred 3D mapping library here (Mapbox
                        GL JS, Cesium, Google Maps, etc.)
                      </p>
                    </div>
                    <div
                      class="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    >
                      <div class="flex items-center gap-1">
                        <span>Lat:</span>
                        <span class="font-mono">{{
                          mapConfig.center.lat
                        }}</span>
                      </div>
                      <span>•</span>
                      <div class="flex items-center gap-1">
                        <span>Lng:</span>
                        <span class="font-mono">{{
                          mapConfig.center.lng
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Map Overlay Controls -->
                <div class="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="icon" variant="secondary" @click="zoomIn">
                    <Plus :size="18" />
                  </Button>
                  <Button size="icon" variant="secondary" @click="zoomOut">
                    <Minus :size="18" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Map,
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

const toast = useToast();
const router = useRouter();

interface MapConfig {
  viewMode: "3d" | "2d" | "satellite";
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
  viewMode: "3d",
  zoom: 12,
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

const goBack = () => {
  router.back();
};

const handleRefresh = () => {
  toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
    loading: "Refreshing map data...",
    success: "Map refreshed successfully!",
    error: "Failed to refresh map",
  });
};

const handleSettings = () => {
  toast.info("Opening settings...", {
    description: "Configure your map preferences",
  });
};

const handleViewModeChange = () => {
  toast.success(`Switched to ${mapConfig.value.viewMode} view`);
};

const handleZoomChange = () => {
  // Debounced zoom update
  console.log("Zoom level:", mapConfig.value.zoom);
};

const handleLayerToggle = () => {
  const activeLayers = Object.entries(mapConfig.value.layers)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);

  toast.info(`Active layers: ${activeLayers.join(", ") || "None"}`);
};

const resetMap = () => {
  mapConfig.value.zoom = 12;
  mapConfig.value.center = {
    lat: 37.7749,
    lng: -122.4194,
  };
  toast.success("Map view reset to defaults");
};

const addMarker = () => {
  toast.success("Marker added", {
    description: "Click on the map to place a marker",
  });
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

const zoomIn = () => {
  if (mapConfig.value.zoom < 20) {
    mapConfig.value.zoom++;
    toast.success(`Zoomed in to level ${mapConfig.value.zoom}`);
  }
};

const zoomOut = () => {
  if (mapConfig.value.zoom > 1) {
    mapConfig.value.zoom--;
    toast.success(`Zoomed out to level ${mapConfig.value.zoom}`);
  }
};
</script>
