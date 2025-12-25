<template>
  <div>
    <OpenNavigationView />
  </div>
</template>

<script setup lang="ts">
// Make this page client-only to avoid SSR issues with Leaflet
definePageMeta({
  ssr: false,
});

// Import the actual navigation component
const OpenNavigationView = defineAsyncComponent(
  () => import("~/modules/open-navigation/index.vue")
);
</script>
