<template>
  <div class="absolute top-4 left-4 z-[1000]">
    <!-- Navigation Status Badge -->
    <div
      v-if="isNavigating"
      class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg animate-pulse"
    >
      <Navigation :size="16" class="inline mr-2" />
      Navigating...
    </div>

    <!-- Waypoint Counter Badge -->
    <div
      v-else-if="waypointCount > 0 && !showSearchPanel"
      class="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg"
    >
      <Navigation :size="16" class="inline mr-2" />
      {{ waypointCount }} Waypoint{{ waypointCount > 1 ? "s" : "" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Navigation } from "lucide-vue-next";

defineProps<{
  isNavigating: boolean;
  waypointCount: number;
  showSearchPanel: boolean;
}>();
</script>
