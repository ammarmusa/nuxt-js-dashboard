export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],

  css: ["~/assets/css/tailwind.css"],

  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
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
