<template>
  <div class="flex flex-col h-screen bg-background">
    <!-- Header -->
    <div class="border-b bg-card flex-shrink-0">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="ghost" size="sm" @click="goBack">
              <ArrowLeft :size="18" class="mr-2" />
              Back
            </Button>
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-lg bg-orange-500 text-white shadow-sm">
                <Navigation :size="22" />
              </div>
              <div>
                <h1 class="text-2xl font-bold">Open Navigation Module</h1>
                <p class="text-sm text-muted-foreground">
                  Advanced navigation and routing system
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="toggleSearchPanel">
              <Search :size="16" class="mr-2" />
              {{ showSearchPanel ? "Hide" : "Find Route" }}
            </Button>
            <Button variant="outline" size="sm" @click="clearRoute">
              <Trash2 :size="16" class="mr-2" />
              Clear Route
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container - Full Width and Height -->
    <div class="flex-1 relative">
      <ClientOnly>
        <div class="absolute inset-0">
          <div
            ref="mapContainer"
            class="w-full h-full"
            style="background: #e0e0e0"
          ></div>

          <!-- Map Controls Overlay - Scalable Structure -->
          <div class="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <!-- Recenter Map Button (shown during navigation when map is not centered) -->
            <Button
              v-if="isNavigating && !isMapCentered"
              size="icon"
              variant="default"
              @click="recenterMap"
              class="bg-blue-600 hover:bg-blue-700"
              title="Recenter on my location"
            >
              <Locate :size="18" />
            </Button>

            <!-- Location Tracking Button -->
            <Button
              size="icon"
              :variant="isTrackingLocation ? 'default' : 'secondary'"
              @click="toggleLocationTracking"
              :class="{
                'bg-orange-500 hover:bg-orange-600': isTrackingLocation,
              }"
              title="Track my location"
            >
              <MapPinIcon
                :size="18"
                :class="{ 'animate-pulse': isTrackingLocation }"
              />
            </Button>

            <!-- Divider -->
            <div class="h-px bg-border my-1"></div>

            <!-- Zoom Controls -->
            <Button
              size="icon"
              variant="secondary"
              @click="handleZoomIn"
              title="Zoom in"
            >
              <Plus :size="18" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              @click="handleZoomOut"
              title="Zoom out"
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

          <!-- Route Search Panel -->
          <div
            v-if="showSearchPanel && !isNavigating"
            class="absolute top-4 left-4 z-[1000] bg-background border rounded-lg shadow-lg w-96 max-h-[calc(100vh-8rem)] overflow-auto"
          >
            <div class="p-4 space-y-4">
              <!-- Panel Header -->
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-lg">Find Route</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  @click="showSearchPanel = false"
                >
                  <X :size="18" />
                </Button>
              </div>

              <!-- From Search -->
              <div class="space-y-2">
                <label class="text-sm font-medium">From</label>
                <div class="relative">
                  <input
                    v-model="fromSearchQuery"
                    @input="handleFromSearchInput"
                    type="text"
                    placeholder="Search starting point..."
                    class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Search
                    :size="16"
                    class="absolute right-3 top-2.5 text-muted-foreground"
                  />
                </div>

                <!-- From Search Results -->
                <div
                  v-if="fromSearchResults.length > 0"
                  class="border rounded-md max-h-48 overflow-auto"
                >
                  <button
                    v-for="place in fromSearchResults"
                    :key="place.place_id"
                    @click="selectFromLocation(place)"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-0"
                  >
                    <div class="font-medium">{{ place.display_name }}</div>
                  </button>
                </div>

                <!-- Selected From Location -->
                <div
                  v-if="selectedFromLocation"
                  class="p-3 bg-muted rounded-md text-sm"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <div class="font-medium">
                        {{
                          selectedFromLocation.isUserLocation
                            ? "Current Location"
                            : "Starting Point:"
                        }}
                      </div>
                      <div class="text-muted-foreground text-xs mt-1">
                        {{
                          selectedFromLocation.isUserLocation
                            ? `Lat: ${selectedFromLocation.lat.toFixed(
                                5
                              )}, Lng: ${selectedFromLocation.lng.toFixed(5)}`
                            : selectedFromLocation.display_name
                        }}
                      </div>
                    </div>
                    <Button
                      v-if="!selectedFromLocation.isUserLocation"
                      size="icon"
                      variant="ghost"
                      @click="resetToUserLocation"
                      class="h-6 w-6"
                      title="Reset to current location"
                    >
                      <Locate :size="14" />
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Destination Search -->
              <div class="space-y-2">
                <label class="text-sm font-medium">Destination</label>
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    @input="handleSearchInput"
                    type="text"
                    placeholder="Search for a place..."
                    class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Search
                    :size="16"
                    class="absolute right-3 top-2.5 text-muted-foreground"
                  />
                </div>

                <!-- Search Results -->
                <div
                  v-if="searchResults.length > 0"
                  class="border rounded-md max-h-48 overflow-auto"
                >
                  <button
                    v-for="place in searchResults"
                    :key="place.place_id"
                    @click="selectDestination(place)"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-0"
                  >
                    <div class="font-medium">{{ place.display_name }}</div>
                  </button>
                </div>

                <!-- Selected Destination -->
                <div
                  v-if="selectedDestination"
                  class="p-3 bg-muted rounded-md text-sm"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <div class="font-medium">Selected:</div>
                      <div class="text-muted-foreground text-xs mt-1">
                        {{ selectedDestination.display_name }}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      @click="clearDestination"
                      class="h-6 w-6"
                    >
                      <X :size="14" />
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Route Profile Selection -->
              <div class="space-y-2">
                <label class="text-sm font-medium">Travel Mode</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="profile in routeProfiles"
                    :key="profile.id"
                    @click="selectedProfile = profile.id"
                    :class="[
                      'p-3 border rounded-md text-center transition-all',
                      selectedProfile === profile.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted',
                    ]"
                  >
                    <component
                      :is="getIcon(profile.icon)"
                      :size="20"
                      class="mx-auto mb-1"
                    />
                    <div class="text-xs font-medium">{{ profile.name }}</div>
                  </button>
                </div>
              </div>

              <!-- Calculate Route Button -->
              <Button
                @click="calculateRoute"
                :disabled="!selectedDestination || !selectedFromLocation"
                class="w-full"
              >
                <Navigation :size="16" class="mr-2" />
                Calculate Route
              </Button>

              <!-- Route Info -->
              <div
                v-if="routeInfo"
                class="p-3 bg-green-500/10 border border-green-500/20 rounded-md space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Distance:</span>
                  <span class="font-semibold">{{ routeInfo.distance }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Duration:</span>
                  <span class="font-semibold">{{ routeInfo.duration }}</span>
                </div>
              </div>

              <!-- Navigation Controls -->
              <div v-if="routeInfo" class="space-y-2">
                <Button
                  v-if="!isNavigating"
                  @click="startNavigation"
                  class="w-full bg-green-600 hover:bg-green-700"
                >
                  <Navigation :size="16" class="mr-2" />
                  Start Navigation
                </Button>
                <Button
                  v-else
                  @click="stopNavigation"
                  class="w-full bg-red-600 hover:bg-red-700"
                  variant="destructive"
                >
                  <X :size="16" class="mr-2" />
                  Stop Navigation
                </Button>
              </div>
            </div>
          </div>

          <!-- Waypoint Counter -->
          <div
            v-if="waypoints.length > 0 && !showSearchPanel"
            class="absolute top-4 left-4 z-[1000] bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg"
          >
            <Navigation :size="16" class="inline mr-2" />
            {{ waypoints.length }} Waypoint{{ waypoints.length > 1 ? "s" : "" }}
          </div>

          <!-- Navigation Status -->
          <div
            v-if="isNavigating"
            class="absolute top-4 left-4 z-[1000] bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg animate-pulse"
          >
            <Navigation :size="16" class="inline mr-2" />
            Navigating...
          </div>

          <!-- Navigation Instructions -->
          <div
            v-if="isNavigating && currentInstruction"
            class="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4"
          >
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border-2 border-green-500"
            >
              <div class="flex items-start gap-3">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <component
                    :is="getDirectionIcon(currentInstruction.type)"
                    :size="24"
                    class="text-white"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-muted-foreground mb-1">
                    {{ currentInstruction.distance }}
                  </div>
                  <div class="text-lg font-bold text-foreground">
                    {{ currentInstruction.instruction }}
                  </div>
                  <div
                    v-if="currentInstruction.name"
                    class="text-sm text-muted-foreground mt-1"
                  >
                    {{ currentInstruction.name }}
                  </div>
                </div>
              </div>
            </div>
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
import {
  ArrowLeft,
  Navigation,
  Plus,
  Minus,
  MapPin as MapPinIcon,
  Trash2,
  Locate,
  Search,
  X,
  Car,
  Bike,
  PersonStanding,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  ArrowUp,
  ArrowUpRight,
  MoveRight,
} from "lucide-vue-next";
import { useLeafletMap } from "~/modules/3d-map/composables/useLeafletMap";
import {
  useRouting,
  type Place,
  type RouteProfile,
} from "./composables/useRouting";

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
  addMarker: addLeafletMarker,
  removeMarker,
  clearMarkers,
  zoomIn: mapZoomIn,
  zoomOut: mapZoomOut,
  destroyMap,
} = useLeafletMap();

const currentCoords = ref({
  lat: 37.7749,
  lng: -122.4194,
  zoom: 13,
});

const waypoints = ref<any[]>([]);
const isTrackingLocation = ref(false);
const userLocationMarker = ref<any>(null);
const locationWatchId = ref<number | null>(null);

// Navigation state
const isNavigating = ref(false);
const navigationWatchId = ref<number | null>(null);
const navigationMarker = ref<any>(null);
const routeSteps = ref<any[]>([]);
const currentStepIndex = ref(0);
const currentInstruction = ref<{
  instruction: string;
  distance: string;
  type: string;
  name?: string;
} | null>(null);
const isMapCentered = ref(true);
const userNavigationLocation = ref<{ lat: number; lng: number } | null>(null);
let isProgrammaticMove = false;

// Routing state
const { searchPlace, getRoute, formatDistance, formatDuration, routeProfiles } =
  useRouting();
const showSearchPanel = ref(false);
const searchQuery = ref("");
const searchResults = ref<Place[]>([]);
const selectedDestination = ref<Place | null>(null);
const fromSearchQuery = ref("");
const fromSearchResults = ref<Place[]>([]);
const selectedFromLocation = ref<{
  lat: number;
  lng: number;
  display_name?: string;
  isUserLocation?: boolean;
} | null>(null);
const selectedProfile = ref("car");
const routeInfo = ref<{ distance: string; duration: string } | null>(null);
const routeLayer = ref<any>(null);
const userLocation = ref<{ lat: number; lng: number } | null>(null);
let searchTimeout: NodeJS.Timeout;
let fromSearchTimeout: NodeJS.Timeout;

const iconMap: Record<string, any> = {
  Car,
  Bike,
  PersonStanding,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Car;
};

// Get direction icon based on maneuver type
const getDirectionIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("left")) return ArrowLeftIcon;
  if (lowerType.includes("right")) return ArrowRight;
  if (lowerType.includes("straight") || lowerType.includes("continue"))
    return ArrowUp;
  if (lowerType.includes("slight")) return ArrowUpRight;
  return Navigation;
};

// Generate instruction text from maneuver type and modifier
const generateInstruction = (maneuver: any): string => {
  const type = maneuver.type || "";
  const modifier = maneuver.modifier || "";

  if (type === "depart") {
    return "Head " + (modifier || "straight");
  }
  if (type === "arrive") {
    return "You have arrived at your destination";
  }
  if (type === "turn") {
    if (modifier === "left") return "Turn left";
    if (modifier === "right") return "Turn right";
    if (modifier === "sharp left") return "Sharp left turn";
    if (modifier === "sharp right") return "Sharp right turn";
    if (modifier === "slight left") return "Slight left";
    if (modifier === "slight right") return "Slight right";
    return "Turn " + modifier;
  }
  if (type === "new name") {
    return "Continue straight";
  }
  if (type === "continue") {
    return "Continue " + (modifier || "straight");
  }
  if (type === "merge") {
    return "Merge " + (modifier || "");
  }
  if (type === "on ramp") {
    return "Take the ramp " + (modifier || "");
  }
  if (type === "off ramp") {
    return "Take the exit " + (modifier || "");
  }
  if (type === "fork") {
    return "At the fork, take " + (modifier || "");
  }
  if (type === "end of road") {
    return "At the end of the road, turn " + (modifier || "");
  }
  if (type === "roundabout") {
    return "Enter the roundabout";
  }
  if (type === "rotary") {
    return "Enter the rotary";
  }

  // Default
  return modifier ? `${type} ${modifier}` : type || "Continue";
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
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

  return R * c; // Distance in meters
};

// Update current navigation instruction based on user location
const updateNavigationInstruction = (lat: number, lng: number) => {
  if (!routeSteps.value.length) return;

  // Find the closest step to current location
  let closestStepIndex = currentStepIndex.value;
  let minDistance = Infinity;

  for (let i = currentStepIndex.value; i < routeSteps.value.length; i++) {
    const step = routeSteps.value[i];
    if (!step.maneuver?.location) continue;

    const [stepLng, stepLat] = step.maneuver.location;
    const distance = calculateDistance(lat, lng, stepLat, stepLng);

    if (distance < minDistance) {
      minDistance = distance;
      closestStepIndex = i;
    }

    // If we're getting farther, stop checking
    if (distance > minDistance * 2) break;
  }

  // Update to the closest step if we've progressed
  if (closestStepIndex >= currentStepIndex.value) {
    currentStepIndex.value = closestStepIndex;
  }

  // Get current step
  const currentStep = routeSteps.value[currentStepIndex.value];
  if (!currentStep) return;

  // Calculate distance to next maneuver
  const [maneuverLng, maneuverLat] = currentStep.maneuver.location;
  const distanceToManeuver = calculateDistance(
    lat,
    lng,
    maneuverLat,
    maneuverLng
  );

  // Generate instruction from maneuver type and modifier
  const instruction = generateInstruction(currentStep.maneuver);
  const distanceText =
    distanceToManeuver > 1000
      ? `In ${(distanceToManeuver / 1000).toFixed(1)} km`
      : `In ${Math.round(distanceToManeuver)} m`;

  currentInstruction.value = {
    instruction,
    distance: distanceText,
    type:
      currentStep.maneuver.modifier || currentStep.maneuver.type || "continue",
    name: currentStep.name || "",
  };
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
        // Listen to both drag and movestart events for better detection
        mapInstance.value.on("dragstart", handleMapDrag);
        mapInstance.value.on("movestart", handleMapMove);
      }

      toast.success("Navigation map loaded!");
    } catch (error) {
      console.error("Failed to initialize map:", error);
      toast.error("Failed to initialize map");
    }
  }
});

// Clean up on unmount
onUnmounted(() => {
  if (locationWatchId.value !== null) {
    navigator.geolocation.clearWatch(locationWatchId.value);
  }
  if (navigationWatchId.value !== null) {
    navigator.geolocation.clearWatch(navigationWatchId.value);
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
  }
};

// Handle map click to add waypoint
const handleMapClick = async (e: any) => {
  console.log("Map clicked at:", e.latlng);
};

// Handle map drag - user manually panned
const handleMapDrag = () => {
  if (isNavigating.value && !isProgrammaticMove) {
    isMapCentered.value = false;
  }
};

// Handle map move - detect user interaction
const handleMapMove = (e: any) => {
  // Only disable centering if this is a user-initiated move (not programmatic)
  if (isNavigating.value && !isProgrammaticMove) {
    isMapCentered.value = false;
  }
};

// Toggle location tracking
const toggleLocationTracking = () => {
  if (isTrackingLocation.value) {
    stopLocationTracking();
  } else {
    startLocationTracking();
  }
};

// Start location tracking
const startLocationTracking = () => {
  if (!navigator.geolocation) {
    toast.error("Geolocation not supported", {
      description: "Your browser doesn't support location tracking",
    });
    return;
  }

  isTrackingLocation.value = true;
  toast.info("Location tracking started", {
    description: "Following your current position",
  });

  // Get initial position
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      // Center on initial position acquisition
      await updateUserLocation(
        position.coords.latitude,
        position.coords.longitude,
        true // Center map on initial location
      );
    },
    (error) => {
      console.error("Geolocation error:", error);
      isTrackingLocation.value = false;
      toast.error("Location access denied", {
        description: "Please enable location permissions",
      });
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );

  // Watch position for continuous tracking
  locationWatchId.value = navigator.geolocation.watchPosition(
    async (position) => {
      // Don't center map on location updates - let user pan freely
      await updateUserLocation(
        position.coords.latitude,
        position.coords.longitude,
        false // Don't center, just update marker position
      );
    },
    (error) => {
      console.error("Geolocation watch error:", error);
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
};

// Stop location tracking
const stopLocationTracking = () => {
  isTrackingLocation.value = false;

  if (locationWatchId.value !== null) {
    navigator.geolocation.clearWatch(locationWatchId.value);
    locationWatchId.value = null;
  }

  // Remove user location marker
  if (userLocationMarker.value) {
    removeMarker(userLocationMarker.value);
    userLocationMarker.value = null;
  }

  toast.success("Location tracking stopped");
};

// Update user location on map
const updateUserLocation = async (
  lat: number,
  lng: number,
  shouldCenter: boolean = true
) => {
  if (!mapInstance.value) return;

  // Skip updating the location marker if navigation is active
  // Navigation mode uses its own marker (navigationMarker)
  if (isNavigating.value) {
    // Just update the user location reference without marker or centering
    userLocation.value = { lat, lng };
    if (selectedFromLocation.value?.isUserLocation) {
      selectedFromLocation.value = {
        lat,
        lng,
        display_name: `Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        isUserLocation: true,
      };
    }
    return;
  }

  // Remove old location marker
  if (userLocationMarker.value) {
    removeMarker(userLocationMarker.value);
  }

  // Create custom icon for user location if needed
  const L = await import("leaflet");
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

  // Add new location marker
  userLocationMarker.value = await addLeafletMarker([lat, lng], {
    icon: userIcon,
    popup: `<b>Your Location</b><br>Lat: ${lat.toFixed(
      5
    )}<br>Lng: ${lng.toFixed(5)}`,
  });

  // Only center map on user location if requested (e.g., initial location)
  // This allows the user to pan freely without the map snapping back
  if (shouldCenter) {
    isProgrammaticMove = true;
    mapInstance.value.setView([lat, lng], mapInstance.value.getZoom());
    setTimeout(() => {
      isProgrammaticMove = false;
    }, 100);
  }

  // Store user location for routing
  userLocation.value = { lat, lng };

  // Set as default from location if not already set
  if (!selectedFromLocation.value) {
    selectedFromLocation.value = {
      lat,
      lng,
      display_name: `Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      isUserLocation: true,
    };
  } else if (selectedFromLocation.value.isUserLocation) {
    // Update current location coordinates if it's still set as user location
    selectedFromLocation.value = {
      lat,
      lng,
      display_name: `Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      isUserLocation: true,
    };
  }
};

// Search panel controls
const toggleSearchPanel = () => {
  showSearchPanel.value = !showSearchPanel.value;
};

// Handle search input with debounce
const handleSearchInput = () => {
  clearTimeout(searchTimeout);

  if (searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const results = await searchPlace(searchQuery.value);
      searchResults.value = results;
    } catch (error) {
      toast.error("Search failed", {
        description: "Unable to search for places",
      });
    }
  }, 500);
};

// Select destination
const selectDestination = (place: Place) => {
  selectedDestination.value = place;
  searchResults.value = [];
  searchQuery.value = "";
  toast.success("Destination selected");
};

// Handle from search input with debounce
const handleFromSearchInput = () => {
  clearTimeout(fromSearchTimeout);

  if (fromSearchQuery.value.length < 3) {
    fromSearchResults.value = [];
    return;
  }

  fromSearchTimeout = setTimeout(async () => {
    try {
      const results = await searchPlace(fromSearchQuery.value);
      fromSearchResults.value = results;
    } catch (error) {
      toast.error("Search failed", {
        description: "Unable to search for places",
      });
    }
  }, 500);
};

// Select from location
const selectFromLocation = (place: Place) => {
  selectedFromLocation.value = {
    lat: parseFloat(place.lat),
    lng: parseFloat(place.lon),
    display_name: place.display_name,
    isUserLocation: false,
  };
  fromSearchResults.value = [];
  fromSearchQuery.value = "";
  toast.success("Starting point selected");
};

// Reset to user location
const resetToUserLocation = () => {
  if (userLocation.value) {
    selectedFromLocation.value = {
      ...userLocation.value,
      display_name: `Current Location (${userLocation.value.lat.toFixed(
        5
      )}, ${userLocation.value.lng.toFixed(5)})`,
      isUserLocation: true,
    };
    fromSearchQuery.value = "";
    toast.success("Reset to current location");
  } else {
    toast.error("Current location not available", {
      description: "Please enable location tracking first",
    });
  }
};

// Clear destination
const clearDestination = () => {
  selectedDestination.value = null;
  routeInfo.value = null;
  if (routeLayer.value) {
    removeMarker(routeLayer.value);
    routeLayer.value = null;
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
    routeSteps.value = route.legs?.[0]?.steps || [];

    // Update route info
    routeInfo.value = {
      distance: formatDistance(route.distance),
      duration: formatDuration(route.duration),
    };

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
  if (routeLayer.value) {
    mapInstance.value.removeLayer(routeLayer.value);
  }

  // Convert coordinates from [lng, lat] to [lat, lng]
  const latLngs = coordinates.map(
    (coord) => [coord[1], coord[0]] as [number, number]
  );

  // Create polyline for route
  routeLayer.value = L.polyline(latLngs, {
    color: "#f97316", // Orange color
    weight: 5,
    opacity: 0.7,
  }).addTo(mapInstance.value);
};

const goBack = () => {
  router.back();
};

const addWaypoint = async () => {
  if (mapInstance.value) {
    const center = mapInstance.value.getCenter();
    const waypointNumber = waypoints.value.length + 1;

    const marker = await addLeafletMarker([center.lat, center.lng], {
      popup: `<div style="text-align: center;">
        <b>Waypoint ${waypointNumber}</b><br>
        Lat: ${center.lat.toFixed(5)}<br>
        Lng: ${center.lng.toFixed(5)}
      </div>`,
      draggable: true,
    });

    if (marker) {
      waypoints.value.push({
        id: waypointNumber,
        marker,
        lat: center.lat,
        lng: center.lng,
      });
      toast.success(`Waypoint ${waypointNumber} added`);
    }
  }
};

const clearRoute = () => {
  clearMarkers();
  waypoints.value = [];
  selectedDestination.value = null;
  routeInfo.value = null;
  fromSearchQuery.value = "";
  fromSearchResults.value = [];

  // Reset from location to user location
  if (userLocation.value) {
    selectedFromLocation.value = {
      ...userLocation.value,
      display_name: `Current Location (${userLocation.value.lat.toFixed(
        5
      )}, ${userLocation.value.lng.toFixed(5)})`,
      isUserLocation: true,
    };
  }

  if (routeLayer.value && mapInstance.value) {
    mapInstance.value.removeLayer(routeLayer.value);
    routeLayer.value = null;
  }

  toast.success("Route cleared");
};

const handleZoomIn = () => {
  mapZoomIn();
  updateCoordinates();
};

const handleZoomOut = () => {
  mapZoomOut();
  updateCoordinates();
};

// Recenter map on user's navigation location
const recenterMap = () => {
  if (mapInstance.value && userNavigationLocation.value) {
    isProgrammaticMove = true;
    mapInstance.value.setView(
      [userNavigationLocation.value.lat, userNavigationLocation.value.lng],
      mapInstance.value.getZoom()
    );
    // Reset flag after a short delay to allow the map to finish moving
    setTimeout(() => {
      isProgrammaticMove = false;
      isMapCentered.value = true;
    }, 100);
    toast.success("Map recentered on your location");
  }
};

// Start navigation mode
const startNavigation = () => {
  if (!navigator.geolocation) {
    toast.error("Geolocation not supported", {
      description: "Your browser doesn't support location tracking",
    });
    return;
  }

  if (!routeInfo.value || !selectedDestination.value) {
    toast.error("No route available", {
      description: "Please calculate a route first",
    });
    return;
  }

  isNavigating.value = true;
  currentStepIndex.value = 0;
  isMapCentered.value = true;

  toast.success("Navigation started", {
    description: "Following your location every second",
  });

  // Get initial position
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      await updateNavigationLocation(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.heading
      );
    },
    (error) => {
      console.error("Navigation geolocation error:", error);
      isNavigating.value = false;
      toast.error("Location access denied", {
        description: "Please enable location permissions",
      });
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );

  // Watch position with high frequency (every second)
  navigationWatchId.value = navigator.geolocation.watchPosition(
    async (position) => {
      await updateNavigationLocation(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.heading
      );
    },
    (error) => {
      console.error("Navigation watch error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 1000,
      maximumAge: 0,
    }
  );
};

// Stop navigation mode
const stopNavigation = () => {
  isNavigating.value = false;

  if (navigationWatchId.value !== null) {
    navigator.geolocation.clearWatch(navigationWatchId.value);
    navigationWatchId.value = null;
  }

  // Remove navigation marker
  if (navigationMarker.value) {
    removeMarker(navigationMarker.value);
    navigationMarker.value = null;
  }

  // Reset navigation state
  routeSteps.value = [];
  currentStepIndex.value = 0;
  currentInstruction.value = null;
  isMapCentered.value = true;
  userNavigationLocation.value = null;

  // Reset navigation configuration
  selectedFromLocation.value = null;
  selectedDestination.value = null;
  routeInfo.value = null;
  fromSearchQuery.value = "";
  fromSearchResults.value = "";
  searchQuery.value = "";
  searchResults.value = [];

  if (routeLayer.value && mapInstance.value) {
    mapInstance.value.removeLayer(routeLayer.value);
    routeLayer.value = null;
  }

  clearMarkers();

  toast.success("Navigation stopped", {
    description: "Navigation configuration has been reset",
  });
};

// Update navigation location on map with direction
const updateNavigationLocation = async (
  lat: number,
  lng: number,
  heading: number | null
) => {
  if (!mapInstance.value) return;

  // Remove old navigation marker
  if (navigationMarker.value) {
    removeMarker(navigationMarker.value);
  }

  // Create custom directional icon for navigation
  const L = await import("leaflet");

  // Calculate rotation based on heading
  const rotation = heading !== null && !isNaN(heading) ? heading : 0;

  const navigationIcon = L.divIcon({
    html: `<div style="
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
    </div>`,
    className: "navigation-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Add new navigation marker
  navigationMarker.value = await addLeafletMarker([lat, lng], {
    icon: navigationIcon,
    popup: `<b>Your Position</b><br>Lat: ${lat.toFixed(
      5
    )}<br>Lng: ${lng.toFixed(5)}${
      heading !== null ? `<br>Heading: ${Math.round(rotation)}°` : ""
    }`,
  });

  // Store current navigation location
  userNavigationLocation.value = { lat, lng };

  // Only auto-center map if the user hasn't manually panned
  if (isMapCentered.value && mapInstance.value) {
    isProgrammaticMove = true;
    mapInstance.value.setView([lat, lng], mapInstance.value.getZoom());
    // Reset flag after a short delay
    setTimeout(() => {
      isProgrammaticMove = false;
    }, 100);
  }

  // Update navigation instruction
  updateNavigationInstruction(lat, lng);

  // Update user location reference
  userLocation.value = { lat, lng };
  if (selectedFromLocation.value?.isUserLocation) {
    selectedFromLocation.value = {
      lat,
      lng,
      display_name: `Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      isUserLocation: true,
    };
  }
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
