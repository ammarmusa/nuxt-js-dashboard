<template>
  <div
    v-if="show && !isNavigating"
    class="absolute top-4 left-4 z-[1000] backdrop-blur-md bg-white/70 dark:bg-black/70 border border-white/20 dark:border-white/10 rounded-lg shadow-lg w-96 max-h-[calc(100vh-8rem)] overflow-auto"
  >
    <div class="p-4 space-y-4">
      <!-- Panel Header -->
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">Find Route</h3>
        <Button size="icon" variant="ghost" @click="$emit('close')">
          <X :size="18" />
        </Button>
      </div>

      <!-- From Search -->
      <div class="space-y-2">
        <label class="text-sm font-medium">From</label>
        <div class="relative">
          <input
            :value="fromSearchQuery"
            @input="
              $emit(
                'update:fromSearchQuery',
                ($event.target as HTMLInputElement).value
              )
            "
            type="text"
            placeholder="Search starting point..."
            class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Search
            :size="16"
            class="absolute right-3 top-2.5 text-muted-foreground"
          />
        </div>

        <!-- From Search Results -->
        <div
          v-if="fromSearchResults.length > 0"
          class="border rounded-md max-h-48 overflow-auto"
        >
          <button
            v-for="place in fromSearchResults"
            :key="place.place_id"
            @click="$emit('select-from', place)"
            class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-0"
          >
            <div class="font-medium">{{ place.display_name }}</div>
          </button>
        </div>

        <!-- Selected From Location -->
        <div
          v-if="selectedFromLocation"
          class="p-3 bg-muted rounded-md text-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <div class="font-medium">
                {{
                  selectedFromLocation.isUserLocation
                    ? "Current Location"
                    : "Starting Point:"
                }}
              </div>
              <div class="text-muted-foreground text-xs mt-1">
                {{
                  selectedFromLocation.isUserLocation
                    ? `Lat: ${selectedFromLocation.lat.toFixed(
                        5
                      )}, Lng: ${selectedFromLocation.lng.toFixed(5)}`
                    : selectedFromLocation.display_name
                }}
              </div>
            </div>
            <Button
              v-if="!selectedFromLocation.isUserLocation"
              size="icon"
              variant="ghost"
              @click="$emit('reset-to-user-location')"
              class="h-6 w-6"
              title="Reset to current location"
            >
              <Locate :size="14" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Destination Search -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Destination</label>
        <div class="relative">
          <input
            :value="searchQuery"
            @input="
              $emit(
                'update:searchQuery',
                ($event.target as HTMLInputElement).value
              )
            "
            type="text"
            placeholder="Search for a place..."
            class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Search
            :size="16"
            class="absolute right-3 top-2.5 text-muted-foreground"
          />
        </div>

        <!-- Search Results -->
        <div
          v-if="searchResults.length > 0"
          class="border rounded-md max-h-48 overflow-auto"
        >
          <button
            v-for="place in searchResults"
            :key="place.place_id"
            @click="$emit('select-destination', place)"
            class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-0"
          >
            <div class="font-medium">{{ place.display_name }}</div>
          </button>
        </div>

        <!-- Selected Destination -->
        <div v-if="selectedDestination" class="p-3 bg-muted rounded-md text-sm">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <div class="font-medium">Selected:</div>
              <div class="text-muted-foreground text-xs mt-1">
                {{ selectedDestination.display_name }}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              @click="$emit('clear-destination')"
              class="h-6 w-6"
            >
              <X :size="14" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Route Profile Selection -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Travel Mode</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="profile in routeProfiles"
            :key="profile.id"
            @click="$emit('update:selectedProfile', profile.id)"
            :class="[
              'p-3 border rounded-md text-center transition-all',
              selectedProfile === profile.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted',
            ]"
          >
            <component
              :is="getIcon(profile.icon)"
              :size="20"
              class="mx-auto mb-1"
            />
            <div class="text-xs font-medium">{{ profile.name }}</div>
          </button>
        </div>
      </div>

      <!-- Calculate Route Button -->
      <Button
        @click="$emit('calculate-route')"
        :disabled="!selectedDestination || !selectedFromLocation"
        class="w-full"
      >
        <Navigation :size="16" class="mr-2" />
        Calculate Route
      </Button>

      <!-- Route Info -->
      <div
        v-if="routeInfo"
        class="p-3 bg-green-500/10 border border-green-500/20 rounded-md space-y-2"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Distance:</span>
          <span class="font-semibold">{{ routeInfo.distance }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Duration:</span>
          <span class="font-semibold">{{ routeInfo.duration }}</span>
        </div>
      </div>

      <!-- Navigation Controls -->
      <div v-if="routeInfo" class="space-y-2">
        <Button
          @click="$emit('start-navigation')"
          class="w-full bg-green-600 hover:bg-green-700"
        >
          <Navigation :size="16" class="mr-2" />
          Start Navigation
        </Button>
        <Button @click="$emit('clear-route')" variant="outline" class="w-full">
          <Trash2 :size="16" class="mr-2" />
          Clear Route
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Navigation,
  Search,
  X,
  Locate,
  Car,
  Bike,
  PersonStanding,
  Trash2,
} from "lucide-vue-next";
import type { Place, RouteProfile } from "../composables/useRouting";
import type { SelectedLocation, RouteInfo } from "../types/navigation.types";

defineProps<{
  show: boolean;
  isNavigating: boolean;
  searchQuery: string;
  searchResults: Place[];
  selectedDestination: Place | null;
  fromSearchQuery: string;
  fromSearchResults: Place[];
  selectedFromLocation: SelectedLocation | null;
  selectedProfile: string;
  routeInfo: RouteInfo | null;
  routeProfiles: RouteProfile[];
}>();

defineEmits<{
  (e: "close"): void;
  (e: "update:searchQuery", value: string): void;
  (e: "update:fromSearchQuery", value: string): void;
  (e: "update:selectedProfile", value: string): void;
  (e: "select-from", place: Place): void;
  (e: "select-destination", place: Place): void;
  (e: "clear-destination"): void;
  (e: "reset-to-user-location"): void;
  (e: "calculate-route"): void;
  (e: "start-navigation"): void;
  (e: "clear-route"): void;
}>();

const iconMap: Record<string, any> = {
  Car,
  Bike,
  PersonStanding,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Car;
};
</script>
