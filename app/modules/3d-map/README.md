# 3D Map Module - Leaflet Implementation

A scalable Leaflet map viewer implementation for Nuxt 3 with TypeScript support.

## Features

- **Interactive Map**: Pan, zoom, and interact with the map
- **Multiple View Modes**: Switch between 2D, Satellite, and Terrain views
- **Markers**: Add and manage markers dynamically
- **Custom Controls**: Zoom controls and coordinate display
- **Responsive Design**: Works on all screen sizes
- **TypeScript Support**: Fully typed with proper interfaces

## Architecture

### Composables

#### `useLeafletMap.ts`

The main composable that handles all Leaflet map interactions. It provides:

- **Map Initialization**: `initMap(container, config)`
- **Tile Layer Management**: `switchTileLayer(layerKey)`
- **Marker Management**: `addMarker()`, `clearMarkers()`
- **Navigation**: `flyTo()`, `setView()`
- **Zoom Controls**: `zoomIn()`, `zoomOut()`, `setZoom()`
- **Cleanup**: `destroyMap()`

#### `useMapStore.ts`

State management for map data (existing):

- Markers storage
- Active marker tracking
- Marker CRUD operations

### Types

#### `map.types.ts`

TypeScript interfaces for type safety:

- `MapMarker`: Marker data structure
- `MapLayer`: Layer configuration
- `ViewMode`: View mode types
- `MapState`: Overall map state

### Utils

#### `mapHelpers.ts`

Utility functions (existing):

- `calculateDistance()`: Haversine formula for distance calculation
- `formatCoordinates()`: Format lat/lng display
- `isValidCoordinates()`: Coordinate validation

## Usage

### Basic Map Setup

```typescript
import { useLeafletMap } from "./composables/useLeafletMap";

const { initMap, addMarker } = useLeafletMap();

// Initialize map
await initMap(mapContainer.value, {
  center: [37.7749, -122.4194],
  zoom: 13,
});
```

### Adding Markers

```typescript
// Add a marker with popup
await addMarker([37.7749, -122.4194], {
  popup: "<b>San Francisco</b><br>Welcome!",
  draggable: true,
});
```

### Switching Views

```typescript
// Switch to satellite view
await switchTileLayer("satellite");

// Switch to terrain
await switchTileLayer("terrain");

// Back to standard
await switchTileLayer("openStreetMap");
```

### Navigation

```typescript
// Fly to a location with animation
flyTo([40.7128, -74.006], 12);

// Jump to a location instantly
setView([40.7128, -74.006], 12);
```

## Available Tile Layers

1. **OpenStreetMap** (Default)

   - Standard street map
   - Max zoom: 19

2. **Satellite**

   - Satellite imagery from Esri
   - Max zoom: 19

3. **Terrain**
   - Topographic map
   - Max zoom: 17

## Extending the Map

### Adding Custom Tile Layers

Edit `useLeafletMap.ts` and add to `tileLayers`:

```typescript
const tileLayers: Record<string, MapTileLayer> = {
  // ... existing layers
  customLayer: {
    name: "Custom Layer",
    url: "https://your-tile-server.com/{z}/{x}/{y}.png",
    attribution: "© Your Attribution",
    maxZoom: 18,
  },
};
```

### Adding Custom Controls

Create a new composable in `composables/` directory:

```typescript
// composables/useMapControls.ts
export const useMapControls = () => {
  const addCustomControl = async (map: LeafletMap) => {
    const L = await import("leaflet");
    // Add your custom control
  };

  return { addCustomControl };
};
```

### Adding Overlays

```typescript
// In useLeafletMap.ts, add overlay management
const addOverlay = async (geoJsonData: any) => {
  const L = await import("leaflet");
  if (mapInstance.value) {
    L.geoJSON(geoJsonData).addTo(mapInstance.value);
  }
};
```

## Performance Considerations

1. **Lazy Loading**: Leaflet is dynamically imported only on client-side
2. **Cleanup**: Map instance is properly destroyed on unmount
3. **Event Listeners**: Throttled/debounced where appropriate
4. **Marker Clustering**: For large datasets, consider using `leaflet.markercluster`

## Dependencies

- `leaflet`: ^1.9.4 - Core mapping library
- `@types/leaflet`: TypeScript definitions

## Future Enhancements

- [ ] Marker clustering for large datasets
- [ ] Drawing tools (polygons, polylines)
- [ ] Geolocation support
- [ ] Search/geocoding integration
- [ ] Layer switcher control
- [ ] Print/export functionality
- [ ] Heatmap overlay
- [ ] Route planning
- [ ] Custom marker icons
- [ ] GeoJSON support

## Troubleshooting

### Map not displaying

- Check that `mapContainer` ref is properly attached
- Ensure Leaflet CSS is loaded
- Check browser console for errors

### Marker icons missing

- The setup uses CDN links for default icons
- For custom icons, import and configure properly

### Performance issues

- Implement marker clustering for >100 markers
- Use appropriate zoom levels
- Consider tile layer caching

## License

Part of the Nuxt App module system.
