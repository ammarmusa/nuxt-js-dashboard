# Module System Documentation

## Overview

This application implements a scalable module-based architecture with a centralized navigation system and global toast notifications.

## Architecture

### Module Structure

Each module follows a consistent structure:

```
modules/
├── [module-name]/
│   ├── index.vue              # Main module page
│   ├── composables/           # Module-specific composables
│   │   └── useModuleStore.ts
│   ├── utils/                 # Module-specific utilities
│   │   └── helpers.ts
│   └── components/            # Module-specific components
```

### Adding a New Module

1. **Define the module in types/modules.ts:**

```typescript
{
  id: 'your-module',
  name: 'Your Module',
  description: 'Module description',
  icon: 'IconName',  // From lucide-vue-next
  route: '/modules/your-module',
  color: 'bg-blue-500',
  enabled: true,
}
```

2. **Create the module structure:**

```bash
mkdir -p app/modules/your-module/{composables,utils,components}
touch app/modules/your-module/index.vue
```

3. **Create the page route:**

```bash
mkdir -p app/pages/modules
touch app/pages/modules/your-module.vue
```

4. **Implement the module page:**

```vue
<template>
  <div class="min-h-screen bg-background">
    <!-- Module content -->
  </div>
</template>

<script setup lang="ts">
const toast = useToast();

// Module logic here
</script>
```

## Toast Notifications

### Using Toast in Components

The toast system is available throughout the entire app via the `useToast()` composable:

```typescript
const toast = useToast();

// Success notification
toast.success("Operation completed!");

// Error notification
toast.error("Something went wrong!");

// Info notification
toast.info("Here is some information");

// Warning notification
toast.warning("Please be careful!");

// Loading notification
const loadingToast = toast.loading("Processing...");
toast.dismiss(loadingToast);

// Promise-based toast
toast.promise(fetchData(), {
  loading: "Fetching data...",
  success: "Data loaded!",
  error: "Failed to load data",
});
```

### Toast Options

All toast methods accept an optional options object:

```typescript
toast.success("Message", {
  description: "Additional details",
  duration: 5000, // milliseconds
  action: {
    label: "Undo",
    onClick: () => console.log("Undo clicked"),
  },
});
```

## Module Examples

### 3D Map Module

The 3D Map module demonstrates:

- Complex UI with sidebar controls
- State management with composables
- Utility functions for map operations
- Integration points for 3D mapping libraries

**Location:** `app/modules/3d-map/`

**Composables:**

- `useMapStore()` - Manages markers and map state

**Utilities:**

- `calculateDistance()` - Haversine distance calculation
- `formatCoordinates()` - Coordinate formatting
- `isValidCoordinates()` - Coordinate validation

### Other Modules

- **Analytics** - Data visualization template
- **Settings** - Configuration interface
- **Notifications** - Notification management

## Global Configuration

### Nuxt Config

The `nuxt.config.ts` is configured for auto-imports:

```typescript
imports: {
  dirs: ["modules/*/composables", "modules/*/utils"],
},

components: [
  { path: "~/components/ui", extensions: ["vue"], prefix: "" },
  { path: "~/modules", pathPrefix: false },
],
```

This allows:

- Automatic import of composables from any module
- Automatic import of utilities from any module
- Automatic component registration

## Best Practices

1. **Module Independence**: Each module should be self-contained with its own composables, utils, and components.

2. **Consistent Structure**: Follow the established folder structure for all modules.

3. **Toast Usage**: Use appropriate toast types (success, error, info, warning) for user feedback.

4. **Composables**: Create module-specific composables for state management and business logic.

5. **Type Safety**: Define TypeScript interfaces for module-specific types.

6. **Navigation**: Always provide a back button in module pages.

## Development

### Running the App

```bash
npm install
npm run dev
```

### Adding Dependencies

```bash
npm add <package-name>
```

### Common Tasks

**Add a new icon:**
Import from `lucide-vue-next` in your component.

**Create a shared utility:**
Add to `app/utils/` or module-specific `utils/` folder.

**Add a global composable:**
Create in `app/composables/` directory.

## Support

For issues or questions about the module system, refer to:

- Nuxt 3 Documentation: https://nuxt.com/docs
- Vue Sonner: https://vue-sonner.vercel.app
- Lucide Icons: https://lucide.dev
