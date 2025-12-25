<template>
  <div class="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
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

    <!-- Divider -->
    <div class="h-px bg-border my-1"></div>

    <!-- Zoom Controls -->
    <Button
      size="icon"
      variant="secondary"
      @click="$emit('zoom-in')"
      title="Zoom in"
    >
      <Plus :size="18" />
    </Button>
    <Button
      size="icon"
      variant="secondary"
      @click="$emit('zoom-out')"
      title="Zoom out"
    >
      <Minus :size="18" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import {
  Locate,
  MapPin as MapPinIcon,
  Plus,
  Minus,
  Search,
} from "lucide-vue-next";

defineProps<{
  isNavigating: boolean;
  isMapCentered: boolean;
}>();

defineEmits<{
  (e: "recenter"): void;
  (e: "toggle-search"): void;
  (e: "center-on-user"): void;
  (e: "zoom-in"): void;
  (e: "zoom-out"): void;
}>();
</script>
