<template>
  <div
    class="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-2 z-[1000]"
  >
    <!-- Recenter Map Button (shown during navigation when map is not centered) -->
    <Button
      v-if="isNavigating && !isMapCentered"
      size="icon"
      variant="default"
      @click="$emit('recenter')"
      class="bg-blue-600 hover:bg-blue-700"
      title="Recenter on my location"
    >
      <Locate :size="18" />
    </Button>

    <!-- Find Route Button -->
    <Button
      v-if="!isNavigating"
      size="icon"
      variant="secondary"
      @click="$emit('toggle-search')"
      title="Find Route"
    >
      <Search :size="18" />
    </Button>

    <!-- Center on User Location Button -->
    <Button
      size="icon"
      variant="secondary"
      @click="$emit('center-on-user')"
      title="Center on my location"
    >
      <MapPinIcon :size="18" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Locate, MapPin as MapPinIcon, Search } from "lucide-vue-next";

defineProps<{
  isNavigating: boolean;
  isMapCentered: boolean;
}>();

defineEmits<{
  (e: "recenter"): void;
  (e: "toggle-search"): void;
  (e: "center-on-user"): void;
}>();
</script>
