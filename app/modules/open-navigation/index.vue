<template>
  <div class="flex flex-col h-screen bg-background">
    <!-- Map Container - Full Width and Height -->
    <div class="flex-1 relative">
      <ClientOnly>
        <div class="absolute inset-0">
          <div
            ref="mapContainer"
            class="w-full h-full"
            style="background: #e0e0e0"
          ></div>

          <!-- Home Button Overlay -->
          <div class="absolute top-2 left-2 md:top-4 md:left-4 z-[1000]">
            <Button
              variant="secondary"
              size="icon"
              class="shadow-lg bg-white hover:bg-gray-100 h-9 w-9 md:h-10 md:w-10"
              title="Go to Home"
              @click="goHome"
            >
              <Home :size="18" class="md:hidden" />
              <Home :size="20" class="hidden md:block" />
            </Button>
          </div>

          <!-- Map Controls Overlay -->
          <MapControls
            :is-navigating="isNavigating"
            :is-map-centered="isMapCentered"
            @recenter="handleRecenterMap"
            @toggle-search="toggleSearchPanel"
            @center-on-user="handleCenterOnUser"
            @zoom-in="handleZoomIn"
            @zoom-out="handleZoomOut"
          />

          <!-- Coordinates Display -->
          <CoordinatesDisplay :coords="currentCoords" />

          <!-- Route Search Panel -->
          <RouteSearchPanel
            :show="showSearchPanel"
            :is-navigating="isNavigating"
            :search-query="searchQuery"
            :search-results="searchResults"
            :selected-destination="selectedDestination"
            :from-search-query="fromSearchQuery"
            :from-search-results="fromSearchResults"
            :selected-from-location="selectedFromLocation"
            :selected-profile="selectedProfile"
            :route-info="routeInfo"
            :route-profiles="routeProfiles"
            @close="showSearchPanel = false"
            @update:search-query="handleSearchQueryUpdate"
            @update:from-search-query="handleFromSearchQueryUpdate"
            @update:selected-profile="selectedProfile = $event"
            @select-from="handleSelectFromLocation"
            @select-destination="handleSelectDestination"
            @clear-destination="handleClearDestination"
            @reset-to-user-location="handleResetToUserLocation"
            @calculate-route="calculateRoute"
            @start-navigation="handleStartNavigation"
            @clear-route="handleClearRoute"
          />

          <!-- Navigation Status Badge -->
          <NavigationStatus
            :is-navigating="isNavigating"
            :waypoint-count="waypoints.length"
            :show-search-panel="showSearchPanel"
          />

          <!-- Navigation Instructions -->
          <NavigationInstructions
            v-if="isNavigating"
            :instruction="currentInstruction"
            :next-instruction="nextInstruction"
          />

          <!-- Stop Navigation Button -->
          <div
            v-if="isNavigating"
            class="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[1000]"
          >
            <Button
              @click="handleStopNavigation"
              class="bg-red-600 hover:bg-red-700 shadow-lg px-4 md:px-6 text-sm md:text-base"
              variant="destructive"
            >
              <X :size="16" class="mr-1 md:mr-2" />
              <span class="hidden sm:inline">Stop Navigation</span>
              <span class="sm:hidden">Stop</span>
            </Button>
          </div>
        </div>

        <template #fallback>
          <div
            class="absolute inset-0 bg-muted flex items-center justify-center"
          >
            <div class="text-center space-y-2">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
              ></div>
              <p class="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, Home } from "lucide-vue-next";
import { useLeafletMap } from "~/modules/3d-map/composables/useLeafletMap";
import { useRouting, type Place } from "./composables/useRouting";
import { useNavigationState } from "./composables/useNavigationState";
import { useLocationTracking } from "./composables/useLocationTracking";
import { useRouteSearch } from "./composables/useRouteSearch";
import type { Coordinates, Waypoint } from "./types/navigation.types";

// Components
import MapControls from "./components/MapControls.vue";
import CoordinatesDisplay from "./components/CoordinatesDisplay.vue";
import RouteSearchPanel from "./components/RouteSearchPanel.vue";
import NavigationStatus from "./components/NavigationStatus.vue";
import NavigationInstructions from "./components/NavigationInstructions.vue";

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

// Map composable
const {
  mapInstance,
  initMap,
  addMarker: addLeafletMarker,
  removeMarker,
  clearMarkers,
  zoomIn: mapZoomIn,
  zoomOut: mapZoomOut,
  destroyMap,
} = useLeafletMap();

// Routing composable
const { searchPlace, getRoute, formatDistance, formatDuration, routeProfiles } =
  useRouting();

// Navigation state composable
const {
  isNavigating,
  isMapCentered,
  currentInstruction,
  nextInstruction,
  isProgrammaticMove,
  userNavigationLocation,
  routeSteps,
  startNavigation,
  stopNavigation,
  recenterMap,
  handleMapDrag,
  setRouteSteps,
  setRouteLayer,
  getRouteLayer,
} = useNavigationState();

// Location tracking composable
const {
  isTrackingLocation,
  userLocation,
  toggleLocationTracking,
  cleanup: cleanupLocationTracking,
} = useLocationTracking();

// Route search composable
const {
  showSearchPanel,
  searchQuery,
  searchResults,
  selectedDestination,
  fromSearchQuery,
  fromSearchResults,
  selectedFromLocation,
  selectedProfile,
  routeInfo,
  toggleSearchPanel,
  handleSearchInput,
  handleFromSearchInput,
  selectDestination,
  selectFromLocation,
  resetToUserLocation,
  clearDestination,
  clearRoute,
  resetSearchState,
  setRouteInfo,
} = useRouteSearch();

// Local state
const currentCoords = ref<Coordinates>({
  lat: 3.139,
  lng: 101.6869,
  zoom: 13,
});

const waypoints = ref<Waypoint[]>([]);

// Search query handlers with debounce
let searchTimeout: ReturnType<typeof setTimeout>;
let fromSearchTimeout: ReturnType<typeof setTimeout>;

const handleSearchQueryUpdate = (value: string) => {
  searchQuery.value = value;
  clearTimeout(searchTimeout);

  if (value.length < 3) {
    searchResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const results = await searchPlace(value);
      searchResults.value = results;
    } catch (error) {
      toast.error("Search failed", {
        description: "Unable to search for places",
      });
    }
  }, 500);
};

const handleFromSearchQueryUpdate = (value: string) => {
  fromSearchQuery.value = value;
  clearTimeout(fromSearchTimeout);

  if (value.length < 3) {
    fromSearchResults.value = [];
    return;
  }

  fromSearchTimeout = setTimeout(async () => {
    try {
      const results = await searchPlace(value);
      fromSearchResults.value = results;
    } catch (error) {
      toast.error("Search failed", {
        description: "Unable to search for places",
      });
    }
  }, 500);
};

// Event handlers
const handleSelectFromLocation = (place: Place) => {
  selectFromLocation(place, toast);
};

const handleSelectDestination = (place: Place) => {
  selectDestination(place, toast);
};

const handleClearDestination = () => {
  clearDestination(removeMarker, getRouteLayer());
};

const handleResetToUserLocation = () => {
  resetToUserLocation(userLocation.value, toast);
};

const handleClearRoute = () => {
  clearMarkers();
  waypoints.value = [];
  clearRoute(
    clearMarkers,
    mapInstance.value,
    getRouteLayer(),
    userLocation.value,
    toast
  );
  setRouteLayer(null);
};

// Center map on user's current location
const handleCenterOnUser = () => {
  if (userLocation.value && mapInstance.value) {
    mapInstance.value.setView(
      [userLocation.value.lat, userLocation.value.lng],
      mapInstance.value.getZoom()
    );
  } else {
    // If no user location yet, try to get it
    centerOnUserLocation();
  }
};

const handleRecenterMap = () => {
  recenterMap(mapInstance.value, toast);
};

const handleZoomIn = () => {
  mapZoomIn();
  updateCoordinates();
};

const handleZoomOut = () => {
  mapZoomOut();
  updateCoordinates();
};

const handleStartNavigation = () => {
  // Remove the user location marker before starting navigation
  // Navigation will create its own marker
  if (userMarker.value && mapInstance.value) {
    mapInstance.value.removeLayer(userMarker.value);
    userMarker.value = null;
  }

  startNavigation(
    routeInfo.value,
    selectedDestination.value,
    mapInstance.value,
    addLeafletMarker,
    removeMarker,
    userLocation,
    selectedFromLocation,
    toast
  );
};

const handleStopNavigation = () => {
  stopNavigation(mapInstance.value, removeMarker, clearMarkers, toast);
  resetSearchState();
  setRouteLayer(null);

  // Restore the user location marker after navigation stops
  if (userLocation.value) {
    addUserMarker(userLocation.value.lat, userLocation.value.lng);
  }
};

// Calculate route
const calculateRoute = async () => {
  if (!selectedDestination.value || !selectedFromLocation.value) {
    toast.error("Missing information", {
      description: "Please select starting point and destination",
    });
    return;
  }

  try {
    toast.loading("Calculating route...");

    const profile = routeProfiles.find((p) => p.id === selectedProfile.value);
    const destLat = parseFloat(selectedDestination.value.lat);
    const destLng = parseFloat(selectedDestination.value.lon);

    const route = await getRoute(
      selectedFromLocation.value.lat,
      selectedFromLocation.value.lng,
      destLat,
      destLng,
      profile?.osrmProfile || "car"
    );

    // Store route steps for navigation instructions
    setRouteSteps(route.legs?.[0]?.steps || []);

    // Update route info
    setRouteInfo({
      distance: formatDistance(route.distance),
      duration: formatDuration(route.duration),
    });

    // Draw route on map
    await drawRoute(route.geometry.coordinates);

    // Add destination marker
    await addLeafletMarker([destLat, destLng], {
      popup: `<b>Destination</b><br>${selectedDestination.value.display_name}`,
    });

    // Add starting point marker if not user location
    if (!selectedFromLocation.value.isUserLocation) {
      await addLeafletMarker(
        [selectedFromLocation.value.lat, selectedFromLocation.value.lng],
        {
          popup: `<b>Starting Point</b><br>${
            selectedFromLocation.value.display_name || "Selected Location"
          }`,
        }
      );
    }

    // Fit map to show entire route
    if (mapInstance.value) {
      const L = await import("leaflet");
      const bounds = L.latLngBounds([
        [selectedFromLocation.value.lat, selectedFromLocation.value.lng],
        [destLat, destLng],
      ]);
      mapInstance.value.fitBounds(bounds, { padding: [50, 50] });
    }

    toast.success("Route calculated!");
  } catch (error) {
    console.error("Route calculation error:", error);
    toast.error("Route calculation failed", {
      description: "Unable to find a route to the destination",
    });
  }
};

// Draw route on map
const drawRoute = async (coordinates: number[][]) => {
  if (!mapInstance.value) return;

  const L = await import("leaflet");

  // Remove old route if exists
  const currentRouteLayer = getRouteLayer();
  if (currentRouteLayer) {
    mapInstance.value.removeLayer(currentRouteLayer);
  }

  // Convert coordinates from [lng, lat] to [lat, lng]
  const latLngs = coordinates.map(
    (coord) => [coord[1], coord[0]] as [number, number]
  );

  // Create polyline for route
  const newRouteLayer = L.polyline(latLngs, {
    color: "#f97316", // Orange color
    weight: 5,
    opacity: 0.7,
  }).addTo(mapInstance.value as L.Map);

  setRouteLayer(newRouteLayer);
};

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
  }
};

// Handle map click
const handleMapClick = async (e: any) => {
  console.log("Map clicked at:", e.latlng);
};

const goHome = () => {
  router.push("/");
};

// User location marker reference
const userMarker = ref<any>(null);

// Get user's initial location, center map, and show marker
const centerOnUserLocation = async () => {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      // Update current coordinates
      currentCoords.value = {
        lat: latitude,
        lng: longitude,
        zoom: 15, // Zoom in closer for user location
      };

      // Center map on user location
      if (mapInstance.value) {
        mapInstance.value.setView([latitude, longitude], 15);
      }

      // Set user location for routing
      userLocation.value = { lat: latitude, lng: longitude };

      // Set as default from location
      selectedFromLocation.value = {
        lat: latitude,
        lng: longitude,
        display_name: `Current Location (${latitude.toFixed(
          5
        )}, ${longitude.toFixed(5)})`,
        isUserLocation: true,
      };

      // Add user marker on the map
      await addUserMarker(latitude, longitude);
    },
    (error) => {
      console.warn("Could not get user location:", error.message);
      // Silently fail - user can still use the map at default location
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
};

// Add or update user location marker
const addUserMarker = async (lat: number, lng: number) => {
  if (!mapInstance.value) return;

  const L = await import("leaflet");

  // Remove existing user marker if any
  // Use removeLayer directly since marker is added directly to map (not markersLayer)
  if (userMarker.value) {
    mapInstance.value.removeLayer(userMarker.value);
    userMarker.value = null;
  }

  // Create custom icon for user location
  const userIcon = L.divIcon({
    html: `<div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    className: "user-location-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  // Add marker without popup (no remove button)
  const marker = L.marker([lat, lng], {
    icon: userIcon,
  });

  // Add to map directly (not to markers layer to avoid clearMarkers removing it)
  marker.addTo(mapInstance.value as L.Map);
  userMarker.value = marker;
};

// Initialize map on mount
onMounted(async () => {
  await nextTick();

  if (mapContainer.value) {
    try {
      await initMap(mapContainer.value, {
        center: [currentCoords.value.lat, currentCoords.value.lng],
        zoom: currentCoords.value.zoom,
        minZoom: 2,
        maxZoom: 18,
      });

      // Set up event listeners
      if (mapInstance.value) {
        mapInstance.value.on("moveend", updateCoordinates);
        mapInstance.value.on("zoomend", updateCoordinates);
        mapInstance.value.on("click", handleMapClick);

        // Detect manual map panning/dragging during navigation
        mapInstance.value.on("dragstart", handleMapDrag);
        mapInstance.value.on("movestart", handleMapDrag);
      }

      // Automatically center on user's location
      centerOnUserLocation();

      toast.success("Navigation map loaded!");
    } catch (error) {
      console.error("Failed to initialize map:", error);
      toast.error("Failed to initialize map");
    }
  }
});

// Clean up on unmount
onUnmounted(() => {
  cleanupLocationTracking();
  destroyMap();
});
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
