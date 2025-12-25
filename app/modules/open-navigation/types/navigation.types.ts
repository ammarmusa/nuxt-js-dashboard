import type { Place } from "../composables/useRouting";

export interface Coordinates {
  lat: number;
  lng: number;
  zoom: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface SelectedLocation {
  lat: number;
  lng: number;
  display_name?: string;
  isUserLocation?: boolean;
}

export interface Waypoint {
  id: number;
  marker: any;
  lat: number;
  lng: number;
}

export interface NavigationInstruction {
  instruction: string;
  distance: string;
  type: string;
  name?: string;
}

export interface RouteInfo {
  distance: string;
  duration: string;
}

export interface NavigationState {
  isNavigating: boolean;
  isMapCentered: boolean;
  currentStepIndex: number;
  currentInstruction: NavigationInstruction | null;
  routeSteps: any[];
  userNavigationLocation: UserLocation | null;
}

export interface LocationTrackingState {
  isTracking: boolean;
  userLocation: UserLocation | null;
  watchId: number | null;
}

export interface RouteSearchState {
  showSearchPanel: boolean;
  searchQuery: string;
  searchResults: Place[];
  selectedDestination: Place | null;
  fromSearchQuery: string;
  fromSearchResults: Place[];
  selectedFromLocation: SelectedLocation | null;
  selectedProfile: string;
  routeInfo: RouteInfo | null;
}
