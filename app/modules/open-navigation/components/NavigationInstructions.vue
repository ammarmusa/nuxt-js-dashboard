<template>
  <div
    v-if="instruction"
    class="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-[calc(100%-5rem)] md:max-w-md px-2 md:px-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 md:p-4 border-2 border-green-500"
    >
      <div class="flex items-start gap-2 md:gap-3">
        <div
          class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center"
        >
          <component
            :is="directionIcon"
            :size="20"
            class="text-white md:hidden"
          />
          <component
            :is="directionIcon"
            :size="24"
            class="text-white hidden md:block"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div
            class="text-xs md:text-sm font-medium text-muted-foreground mb-0.5 md:mb-1"
          >
            {{ instruction.distance }}
          </div>
          <div
            class="text-base md:text-lg font-bold text-foreground leading-tight"
          >
            {{ instruction.instruction }}
          </div>
          <div
            v-if="instruction.name"
            class="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 truncate"
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
