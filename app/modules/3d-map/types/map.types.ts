export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title?: string;
  description?: string;
  icon?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  enabled: boolean;
  type: "tile" | "overlay" | "markers";
}

export type ViewMode = "2d" | "satellite" | "terrain";

export interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  viewMode: ViewMode;
  markers: MapMarker[];
  layers: MapLayer[];
}
