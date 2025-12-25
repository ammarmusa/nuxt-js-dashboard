<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Global Toast Container - Available throughout the entire app -->
    <Toaster
      position="top-right"
      richColors
      :toastOptions="{
        duration: 3000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }"
      closeButton
    />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from "vue-sonner";

// Set page title and meta
useHead({
  title: "Nuxt App - Module System",
  meta: [
    {
      name: "description",
      content: "A scalable module-based Nuxt application",
    },
  ],
});
</script>
