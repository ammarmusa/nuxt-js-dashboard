import type {
  NavigationInstruction,
  UserLocation,
  RouteInfo,
  SelectedLocation,
} from "../types/navigation.types";
import type { Place } from "./useRouting";
import {
  calculateDistance,
  generateInstruction,
  formatDistanceText,
  createNavigationIconHtml,
} from "../utils/navigationHelpers";

export const useNavigationState = () => {
  // Navigation state
  const isNavigating = ref(false);
  const navigationWatchId = ref<number | null>(null);
  const navigationMarker = ref<any>(null);
  const routeSteps = ref<any[]>([]);
  const currentStepIndex = ref(0);
  const currentInstruction = ref<NavigationInstruction | null>(null);
  const isMapCentered = ref(true);
  const userNavigationLocation = ref<UserLocation | null>(null);
  const isProgrammaticMove = ref(false);

  // Route layer reference
  const routeLayer = ref<any>(null);

  /**
   * Update current navigation instruction based on user location
   */
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
    const distanceText = formatDistanceText(distanceToManeuver);

    currentInstruction.value = {
      instruction,
      distance: distanceText,
      type:
        currentStep.maneuver.modifier ||
        currentStep.maneuver.type ||
        "continue",
      name: currentStep.name || "",
    };
  };

  /**
   * Update navigation location on map with direction
   */
  const updateNavigationLocation = async (
    lat: number,
    lng: number,
    heading: number | null,
    mapInstance: any,
    addMarker: Function,
    removeMarker: Function,
    userLocation: Ref<UserLocation | null>,
    selectedFromLocation: Ref<SelectedLocation | null>
  ) => {
    if (!mapInstance) return;

    // Remove old navigation marker
    if (navigationMarker.value) {
      removeMarker(navigationMarker.value);
    }

    // Create custom directional icon for navigation
    const L = await import("leaflet");

    // Calculate rotation based on heading
    const rotation = heading !== null && !isNaN(heading) ? heading : 0;

    const navigationIcon = L.divIcon({
      html: createNavigationIconHtml(rotation),
      className: "navigation-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add new navigation marker without popup during navigation
    navigationMarker.value = await addMarker([lat, lng], {
      icon: navigationIcon,
    });

    // Store current navigation location
    userNavigationLocation.value = { lat, lng };

    // Only auto-center map if the user hasn't manually panned
    if (isMapCentered.value && mapInstance) {
      isProgrammaticMove.value = true;
      mapInstance.setView([lat, lng], mapInstance.getZoom());
      setTimeout(() => {
        isProgrammaticMove.value = false;
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

  /**
   * Start navigation mode
   */
  const startNavigation = (
    routeInfo: RouteInfo | null,
    selectedDestination: Place | null,
    mapInstance: any,
    addMarker: Function,
    removeMarker: Function,
    userLocation: Ref<UserLocation | null>,
    selectedFromLocation: Ref<SelectedLocation | null>,
    toast: any
  ) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Your browser doesn't support location tracking",
      });
      return;
    }

    if (!routeInfo || !selectedDestination) {
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
          position.coords.heading,
          mapInstance,
          addMarker,
          removeMarker,
          userLocation,
          selectedFromLocation
        );

        // Zoom to user's location at zoom level 18 when navigation starts
        if (mapInstance) {
          isProgrammaticMove.value = true;
          mapInstance.setView(
            [position.coords.latitude, position.coords.longitude],
            18
          );
          setTimeout(() => {
            isProgrammaticMove.value = false;
          }, 100);
        }
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

    // Watch position with high frequency
    navigationWatchId.value = navigator.geolocation.watchPosition(
      async (position) => {
        await updateNavigationLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.heading,
          mapInstance,
          addMarker,
          removeMarker,
          userLocation,
          selectedFromLocation
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

  /**
   * Stop navigation mode
   */
  const stopNavigation = (
    mapInstance: any,
    removeMarker: Function,
    clearMarkers: Function,
    toast: any
  ) => {
    // Save user's last location before clearing
    const lastUserLocation = userNavigationLocation.value
      ? { ...userNavigationLocation.value }
      : null;

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

    // Remove route layer
    if (routeLayer.value && mapInstance) {
      mapInstance.removeLayer(routeLayer.value);
      routeLayer.value = null;
    }

    clearMarkers();

    // Center map on user's last location
    if (mapInstance && lastUserLocation) {
      isProgrammaticMove.value = true;
      mapInstance.setView([lastUserLocation.lat, lastUserLocation.lng], 18);
      setTimeout(() => {
        isProgrammaticMove.value = false;
      }, 100);
    }

    toast.success("Navigation stopped", {
      description: "Navigation configuration has been reset",
    });
  };

  /**
   * Recenter map on user's navigation location
   */
  const recenterMap = (mapInstance: any, toast: any) => {
    if (mapInstance && userNavigationLocation.value) {
      isProgrammaticMove.value = true;
      mapInstance.setView(
        [userNavigationLocation.value.lat, userNavigationLocation.value.lng],
        18
      );
      setTimeout(() => {
        isProgrammaticMove.value = false;
        isMapCentered.value = true;
      }, 100);
      toast.success("Map recentered on your location");
    }
  };

  /**
   * Handle map drag - user manually panned
   */
  const handleMapDrag = () => {
    if (isNavigating.value && !isProgrammaticMove.value) {
      isMapCentered.value = false;
    }
  };

  /**
   * Set route steps for navigation
   */
  const setRouteSteps = (steps: any[]) => {
    routeSteps.value = steps;
  };

  /**
   * Set route layer reference
   */
  const setRouteLayer = (layer: any) => {
    routeLayer.value = layer;
  };

  /**
   * Get route layer
   */
  const getRouteLayer = () => routeLayer.value;

  return {
    // State
    isNavigating,
    isMapCentered,
    currentStepIndex,
    currentInstruction,
    userNavigationLocation,
    isProgrammaticMove,
    routeSteps,
    routeLayer,

    // Actions
    startNavigation,
    stopNavigation,
    recenterMap,
    handleMapDrag,
    updateNavigationInstruction,
    setRouteSteps,
    setRouteLayer,
    getRouteLayer,
  };
};
