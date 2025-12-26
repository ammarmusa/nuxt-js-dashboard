<template>
  <div class="absolute top-14 left-2 md:top-4 md:left-16 z-[1000]">
    <!-- Waypoint Counter Badge -->
    <div
      v-if="waypointCount > 0 && !showSearchPanel && !isNavigating"
      class="bg-orange-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium shadow-lg"
    >
      <Navigation :size="14" class="inline mr-1 md:hidden" />
      <Navigation :size="16" class="hidden md:inline mr-2" />
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
