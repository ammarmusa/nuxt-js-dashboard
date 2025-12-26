import type { UserLocation, SelectedLocation } from "../types/navigation.types";
import { createUserLocationIconHtml } from "../utils/navigationHelpers";

export const useLocationTracking = () => {
  const isTrackingLocation = ref(false);
  const userLocationMarker = ref<any>(null);
  const locationWatchId = ref<number | null>(null);
  const userLocation = ref<UserLocation | null>(null);

  /**
   * Update user location on map
   */
  const updateUserLocation = async (
    lat: number,
    lng: number,
    shouldCenter: boolean,
    isNavigating: Ref<boolean>,
    mapInstance: any,
    addMarker: Function,
    removeMarker: Function,
    selectedFromLocation: Ref<SelectedLocation | null>,
    isProgrammaticMove: Ref<boolean>
  ) => {
    if (!mapInstance) return;

    // Skip updating the location marker if navigation is active
    // Navigation mode uses its own marker (navigationMarker)
    if (isNavigating.value) {
      // Just update the user location reference without marker or centering
      userLocation.value = { lat, lng };
      if (selectedFromLocation.value?.isUserLocation) {
        selectedFromLocation.value = {
          lat,
          lng,
          display_name: `Current Location (${lat.toFixed(5)}, ${lng.toFixed(
            5
          )})`,
          isUserLocation: true,
        };
      }
      return;
    }

    // Remove old location marker
    if (userLocationMarker.value) {
      removeMarker(userLocationMarker.value);
    }

    // Create custom icon for user location
    const L = await import("leaflet");
    const userIcon = L.divIcon({
      html: createUserLocationIconHtml(),
      className: "user-location-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Add new location marker
    userLocationMarker.value = await addMarker([lat, lng], {
      icon: userIcon,
      popup: `<b>Your Location</b><br>Lat: ${lat.toFixed(
        5
      )}<br>Lng: ${lng.toFixed(5)}`,
    });

    // Only center map on user location if requested
    if (shouldCenter) {
      isProgrammaticMove.value = true;
      mapInstance.setView([lat, lng], mapInstance.getZoom());
      setTimeout(() => {
        isProgrammaticMove.value = false;
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
      selectedFromLocation.value = {
        lat,
        lng,
        display_name: `Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        isUserLocation: true,
      };
    }
  };

  /**
   * Start location tracking
   */
  const startLocationTracking = (
    isNavigating: Ref<boolean>,
    mapInstance: any,
    addMarker: Function,
    removeMarker: Function,
    selectedFromLocation: Ref<SelectedLocation | null>,
    isProgrammaticMove: Ref<boolean>,
    toast: any
  ) => {
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
        await updateUserLocation(
          position.coords.latitude,
          position.coords.longitude,
          true, // Center map on initial location
          isNavigating,
          mapInstance,
          addMarker,
          removeMarker,
          selectedFromLocation,
          isProgrammaticMove
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
        await updateUserLocation(
          position.coords.latitude,
          position.coords.longitude,
          false, // Don't center, just update marker position
          isNavigating,
          mapInstance,
          addMarker,
          removeMarker,
          selectedFromLocation,
          isProgrammaticMove
        );
      },
      (error) => {
        console.error("Geolocation watch error:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  /**
   * Stop location tracking
   */
  const stopLocationTracking = (removeMarker: Function, toast: any) => {
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

  /**
   * Toggle location tracking
   */
  const toggleLocationTracking = (
    isNavigating: Ref<boolean>,
    mapInstance: any,
    addMarker: Function,
    removeMarker: Function,
    selectedFromLocation: Ref<SelectedLocation | null>,
    isProgrammaticMove: Ref<boolean>,
    toast: any
  ) => {
    if (isTrackingLocation.value) {
      stopLocationTracking(removeMarker, toast);
    } else {
      startLocationTracking(
        isNavigating,
        mapInstance,
        addMarker,
        removeMarker,
        selectedFromLocation,
        isProgrammaticMove,
        toast
      );
    }
  };

  /**
   * Cleanup on unmount
   */
  const cleanup = () => {
    if (locationWatchId.value !== null) {
      navigator.geolocation.clearWatch(locationWatchId.value);
    }
  };

  return {
    isTrackingLocation,
    userLocation,
    userLocationMarker,
    locationWatchId,
    updateUserLocation,
    startLocationTracking,
    stopLocationTracking,
    toggleLocationTracking,
    cleanup,
  };
};
