<template>
  <div class="border-b bg-card flex-shrink-0">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="$emit('back')">
            <ArrowLeft :size="18" class="mr-2" />
            Back
          </Button>
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-lg bg-orange-500 text-white shadow-sm">
              <Navigation :size="22" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">Open Navigation Module</h1>
              <p class="text-sm text-muted-foreground">
                Advanced navigation and routing system
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Navigation } from "lucide-vue-next";

defineEmits<{
  (e: "back"): void;
}>();
</script>
