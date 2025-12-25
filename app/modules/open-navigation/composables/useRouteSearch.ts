import type { Place } from "./useRouting";
import type {
  SelectedLocation,
  RouteInfo,
  UserLocation,
} from "../types/navigation.types";

export const useRouteSearch = () => {
  const showSearchPanel = ref(false);
  const searchQuery = ref("");
  const searchResults = ref<Place[]>([]);
  const selectedDestination = ref<Place | null>(null);
  const fromSearchQuery = ref("");
  const fromSearchResults = ref<Place[]>([]);
  const selectedFromLocation = ref<SelectedLocation | null>(null);
  const selectedProfile = ref("car");
  const routeInfo = ref<RouteInfo | null>(null);

  let searchTimeout: ReturnType<typeof setTimeout>;
  let fromSearchTimeout: ReturnType<typeof setTimeout>;

  /**
   * Toggle search panel visibility
   */
  const toggleSearchPanel = () => {
    showSearchPanel.value = !showSearchPanel.value;
  };

  /**
   * Handle destination search input with debounce
   */
  const handleSearchInput = async (searchPlace: Function, toast: any) => {
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

  /**
   * Handle from location search input with debounce
   */
  const handleFromSearchInput = async (searchPlace: Function, toast: any) => {
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

  /**
   * Select destination from search results
   */
  const selectDestination = (place: Place, toast: any) => {
    selectedDestination.value = place;
    searchResults.value = [];
    searchQuery.value = "";
    toast.success("Destination selected");
  };

  /**
   * Select from location from search results
   */
  const selectFromLocation = (place: Place, toast: any) => {
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

  /**
   * Reset to user's current location
   */
  const resetToUserLocation = (
    userLocation: UserLocation | null,
    toast: any
  ) => {
    if (userLocation) {
      selectedFromLocation.value = {
        ...userLocation,
        display_name: `Current Location (${userLocation.lat.toFixed(
          5
        )}, ${userLocation.lng.toFixed(5)})`,
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

  /**
   * Clear selected destination
   */
  const clearDestination = (removeMarker: Function, routeLayer: any) => {
    selectedDestination.value = null;
    routeInfo.value = null;
    if (routeLayer) {
      removeMarker(routeLayer);
    }
  };

  /**
   * Clear all route data
   */
  const clearRoute = (
    clearMarkers: Function,
    mapInstance: any,
    routeLayer: any,
    userLocation: UserLocation | null,
    toast: any
  ) => {
    clearMarkers();
    selectedDestination.value = null;
    routeInfo.value = null;
    fromSearchQuery.value = "";
    fromSearchResults.value = [];

    // Reset from location to user location
    if (userLocation) {
      selectedFromLocation.value = {
        ...userLocation,
        display_name: `Current Location (${userLocation.lat.toFixed(
          5
        )}, ${userLocation.lng.toFixed(5)})`,
        isUserLocation: true,
      };
    }

    if (routeLayer && mapInstance) {
      mapInstance.removeLayer(routeLayer);
    }

    toast.success("Route cleared");
  };

  /**
   * Reset search state after navigation stops
   */
  const resetSearchState = () => {
    selectedFromLocation.value = null;
    selectedDestination.value = null;
    routeInfo.value = null;
    fromSearchQuery.value = "";
    fromSearchResults.value = [];
    searchQuery.value = "";
    searchResults.value = [];
  };

  /**
   * Set route info
   */
  const setRouteInfo = (info: RouteInfo | null) => {
    routeInfo.value = info;
  };

  return {
    // State
    showSearchPanel,
    searchQuery,
    searchResults,
    selectedDestination,
    fromSearchQuery,
    fromSearchResults,
    selectedFromLocation,
    selectedProfile,
    routeInfo,

    // Actions
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
  };
};
