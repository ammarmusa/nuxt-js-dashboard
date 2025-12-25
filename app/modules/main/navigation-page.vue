<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <div class="border-b bg-card">
      <div class="container mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h1 class="text-3xl font-bold tracking-tight">Module Selection</h1>
            <p class="text-muted-foreground">
              Choose a module to get started with your workflow
            </p>
          </div>
          <Badge variant="outline" class="text-xs">
            {{ modules.length }} Modules Available
          </Badge>
        </div>
      </div>
    </div>

    <!-- Module Cards Grid -->
    <div class="container mx-auto px-6 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="module in modules"
          :key="module.id"
          class="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          @click="navigateToModule(module)"
        >
          <!-- Hover gradient overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />

          <CardHeader class="relative">
            <div class="flex items-start justify-between mb-4">
              <div
                :class="[
                  module.color,
                  'p-3 rounded-lg text-white transition-all duration-200 group-hover:shadow-lg group-hover:scale-110',
                ]"
              >
                <component :is="getIcon(module.icon)" :size="24" />
              </div>
              <Badge
                v-if="module.enabled"
                variant="default"
                class="bg-green-500 hover:bg-green-600 text-white"
              >
                Active
              </Badge>
              <Badge v-else variant="secondary">Disabled</Badge>
            </div>
            <CardTitle class="text-xl">{{ module.name }}</CardTitle>
            <CardDescription class="mt-2">
              {{ module.description }}
            </CardDescription>
          </CardHeader>

          <CardFooter class="relative flex justify-between items-center pt-6">
            <span class="text-xs text-muted-foreground">Click to open</span>
            <Button
              variant="ghost"
              size="sm"
              class="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              Open
              <component
                :is="getIcon('ChevronRight')"
                :size="16"
                class="ml-1"
              />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Map, BarChart3, Settings, Bell, ChevronRight } from "lucide-vue-next";
import type { ModuleCard } from "~/types/modules";
import { availableModules } from "~/types/modules";

const toast = useToast();
const router = useRouter();

const modules = ref<ModuleCard[]>(availableModules);

const iconMap: Record<string, any> = {
  Map,
  BarChart3,
  Settings,
  Bell,
  ChevronRight,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Map;
};

const navigateToModule = (module: ModuleCard) => {
  if (!module.enabled) {
    toast.warning(`${module.name} module is currently disabled`);
    return;
  }

  toast.success(`Opening ${module.name}...`);

  setTimeout(() => {
    router.push(module.route);
  }, 300);
};
</script>
