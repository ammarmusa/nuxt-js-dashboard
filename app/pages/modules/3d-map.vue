<template>
  <div>
    <ModulesMapView />
  </div>
</template>

<script setup lang="ts">
// Make this page client-only to avoid SSR issues with Leaflet
definePageMeta({
  ssr: false,
});

// Import the actual map component
const ModulesMapView = defineAsyncComponent(
  () => import("~/modules/3d-map/index.vue")
);
</script>
