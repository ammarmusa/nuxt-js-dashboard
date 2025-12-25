<template>
  <div
    v-if="instruction"
    class="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border-2 border-green-500"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
        >
          <component :is="directionIcon" :size="24" class="text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-muted-foreground mb-1">
            {{ instruction.distance }}
          </div>
          <div class="text-lg font-bold text-foreground">
            {{ instruction.instruction }}
          </div>
          <div
            v-if="instruction.name"
            class="text-sm text-muted-foreground mt-1"
          >
            {{ instruction.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Navigation,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  ArrowUp,
  ArrowUpRight,
} from "lucide-vue-next";
import type { NavigationInstruction } from "../types/navigation.types";

const props = defineProps<{
  instruction: NavigationInstruction | null;
}>();

const directionIcon = computed(() => {
  if (!props.instruction) return Navigation;

  const lowerType = props.instruction.type.toLowerCase();
  if (lowerType.includes("left")) return ArrowLeftIcon;
  if (lowerType.includes("right")) return ArrowRight;
  if (lowerType.includes("straight") || lowerType.includes("continue"))
    return ArrowUp;
  if (lowerType.includes("slight")) return ArrowUpRight;
  return Navigation;
});
</script>
