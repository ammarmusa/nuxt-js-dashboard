export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxt/eslint"],

  css: ["~/assets/css/tailwind.css"],

  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },

  // GitHub Pages deployment configuration
  // Set NUXT_APP_BASE_URL environment variable for the repository name
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
  },

  // Runtime config for API endpoints
  runtimeConfig: {
    public: {
      nominatimApiUrl: "https://nominatim.openstreetmap.org",
      osrmApiUrl: "https://router.project-osrm.org",
    },
  },

  // Scalability: Auto-import from module subfolders
  imports: {
    dirs: ["modules/*/composables", "modules/*/utils"],
  },

  components: [
    { path: "~/components/ui", extensions: ["vue"], prefix: "" },
    { path: "~/modules", pathPrefix: false }, // Allows modules/auth/components/X.vue
  ],
});
