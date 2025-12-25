<template>
  <div
    class="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md text-xs border shadow-sm"
  >
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1">
        <span class="text-muted-foreground">Lat:</span>
        <span class="font-mono">{{ coords.lat.toFixed(5) }}</span>
      </div>
      <span class="text-muted-foreground">•</span>
      <div class="flex items-center gap-1">
        <span class="text-muted-foreground">Lng:</span>
        <span class="font-mono">{{ coords.lng.toFixed(5) }}</span>
      </div>
      <span class="text-muted-foreground">•</span>
      <div class="flex items-center gap-1">
        <span class="text-muted-foreground">Zoom:</span>
        <span class="font-mono">{{ coords.zoom }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Coordinates } from "../types/navigation.types";

defineProps<{
  coords: Coordinates;
}>();
</script>
